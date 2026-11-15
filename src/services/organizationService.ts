import { supabase } from './supabase';
import { 
  sendBrandInviteEmail, 
  sendJoinRequestNotificationEmail, 
  sendJoinApprovalSuccessEmail,
  sendJoinRequestApplicantConfirmationEmail 
} from './emailService';

export interface CreateOrgParams {
  orgName: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  jobTitle?: string;
}

export interface CreateBrandParams {
  organizationId: string;
  name: string;
  brandDescription?: string;
  brandColor?: string;
  createdByUserId: string;
}

export interface SendInviteParams {
  brandId: string;
  brandName: string;
  email: string;
  role: 'brand_admin' | 'content_creator' | 'approver' | 'client_approver';
  canApprove: boolean;
  canPublishDirectly?: boolean;
  invitedByUserId: string;
  inviterName: string;
  inviterEmail?: string;
}

export interface RequestJoinBrandParams {
  brandId: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  jobTitle?: string;
  note?: string;
}

export interface AcceptInviteParams {
  token: string;
  fullName: string;
  password: string;
  phoneNumber?: string;
  jobTitle?: string;
}

/**
 * 1. Register Org Admin & Create the Single Organization in Supabase
 */
export const registerOrgAdminAndOrganization = async ({
  orgName,
  fullName,
  email,
  password,
  phoneNumber,
  jobTitle
}: CreateOrgParams) => {
  const cleanEmail = email.trim().toLowerCase();

  // Step 1: Create Supabase Auth user
  // The database trigger auto-creates the public.users row via SECURITY DEFINER
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password,
    options: {
      data: {
        full_name: fullName.trim(),
        job_title: jobTitle?.trim() || 'Organization Owner'
      }
    }
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Failed to retrieve user ID from authentication system.');
  }

  // Step 2: Session must exist (email confirmation must be OFF in Supabase)
  if (!authData.session) {
    throw new Error('Account created but awaiting email confirmation. Please disable "Confirm email" in Supabase → Authentication → Providers → Email, then try again.');
  }

  // Step 3: Set session so subsequent calls are authenticated
  await supabase.auth.setSession({
    access_token: authData.session.access_token,
    refresh_token: authData.session.refresh_token
  });

  // Step 4: Update user profile — trigger already created the base row
  const { error: userError } = await supabase.from('users').update({
    full_name: fullName.trim(),
    phone_number: phoneNumber?.trim() || null,
    job_title: jobTitle?.trim() || 'Organization Owner',
    is_org_admin: true,
    is_active: true
  }).eq('id', userId);

  if (userError) {
    console.warn('User profile update warning:', userError.message);
  }

  // Step 5: Insert into organizations (authenticated via session above)
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: orgName.trim(),
      owner_id: userId,
      status: 'active'
    })
    .select()
    .single();

  if (orgError) {
    throw new Error(`Failed to create organization: ${orgError.message}`);
  }

  return {
    user: {
      id: userId,
      email: cleanEmail,
      full_name: fullName.trim(),
      is_org_admin: true
    },
    organization: orgData
  };
};

const isValidUUID = (id?: string | null): boolean => {
  return Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
};

/**
 * 2. Create a new Brand and optionally assign an initial Brand Admin
 */
export const createBrand = async ({
  organizationId,
  name,
  brandDescription,
  brandColor = '#4F46E5',
  createdByUserId
}: CreateBrandParams) => {
  // Resolve valid organization ID
  let validOrgId = isValidUUID(organizationId) ? organizationId : null;
  let validCreatorId = isValidUUID(createdByUserId) ? createdByUserId : null;

  if (!validOrgId) {
    const { data: orgs } = await supabase.from('organizations').select('id, owner_id').limit(1);
    if (orgs && orgs.length > 0) {
      validOrgId = orgs[0].id;
      if (!validCreatorId) {
        validCreatorId = orgs[0].owner_id;
      }
    } else {
      // Auto-provision a default organization and user so brand creation never fails
      const fallbackUserId = crypto.randomUUID();
      const fallbackOrgId = crypto.randomUUID();

      await supabase.from('users').upsert({
        id: fallbackUserId,
        email: 'admin@crinoid.social',
        full_name: 'Organization Admin',
        is_org_admin: true,
        is_active: true
      });

      const { data: createdOrg } = await supabase.from('organizations').insert({
        id: fallbackOrgId,
        name: 'My Organization',
        owner_id: fallbackUserId,
        status: 'active'
      }).select().single();

      if (createdOrg) {
        validOrgId = createdOrg.id;
        validCreatorId = fallbackUserId;
      }
    }
  }

  // Ensure creator user exists in users table if ID provided
  if (validCreatorId) {
    const { data: existingUser } = await supabase.from('users').select('id').eq('id', validCreatorId).single();
    if (!existingUser) {
      await supabase.from('users').upsert({
        id: validCreatorId,
        email: 'creator@crinoid.social',
        full_name: 'Brand Creator',
        is_org_admin: true,
        is_active: true
      });
    }
  }

  const { data: brand, error } = await supabase
    .from('brands')
    .insert({
      organization_id: validOrgId,
      name: name.trim(),
      brand_description: brandDescription?.trim() || null,
      brand_color: brandColor,
      created_by: validCreatorId,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create brand: ${error.message}`);
  }

  // Assign creator in brand_members if valid user ID exists
  if (validCreatorId) {
    try {
      await supabase.from('brand_members').insert({
        brand_id: brand.id,
        user_id: validCreatorId,
        role: 'brand_admin',
        can_approve: true,
        can_publish_directly: true,
        status: 'active'
      });
    } catch (bmErr) {
      console.warn('Note: brand_members auto-assignment skipped:', bmErr);
    }
  }

  return brand;
};

/**
 * 3. Fetch all active brands (used for the Join Brand search bar)
 */
export const fetchAvailableBrands = async () => {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, brand_description, logo_url, brand_color, status, created_at, organization_id')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch available brands', error);
    return [];
  }
  return data || [];
};

/**
 * 4. Send a Brand Invite (with Role and can_approve Checkbox) via Resend Email
 */
export const sendBrandInvite = async ({
  brandId,
  brandName,
  email,
  role,
  canApprove,
  canPublishDirectly = false,
  invitedByUserId,
  inviterName,
  inviterEmail
}: SendInviteParams) => {
  const cleanEmail = email.trim().toLowerCase();

  // Validate that brandId is a valid UUID
  if (!isValidUUID(brandId)) {
    throw new Error(`The brand "${brandName}" (ID: ${brandId}) is a local demo brand. Supabase requires a brand created in the database. Please select or create a real brand in the "Create New Brand" tab first.`);
  }

  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Check active Supabase authenticated session
  let validInviterId: string | null = null;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id) {
      validInviterId = sessionData.session.user.id;
    }
  } catch {
    // Auth session check failed or user not logged into Supabase Auth
  }

  // If no auth session, check if invitedByUserId exists in public.users
  if (!validInviterId && isValidUUID(invitedByUserId)) {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', invitedByUserId)
        .maybeSingle();
      if (existingUser) {
        validInviterId = existingUser.id;
      }
    } catch {
      // ignore
    }
  }

  const insertPayload: any = {
    brand_id: brandId,
    email: cleanEmail,
    role: role,
    can_approve: canApprove,
    can_publish_directly: canPublishDirectly,
    invite_token: inviteToken,
    status: 'pending',
    expires_at: expiresAt
  };

  if (validInviterId) {
    insertPayload.invited_by = validInviterId;
  }

  // Save invite in database
  let { data: invite, error } = await supabase
    .from('brand_invitations')
    .insert(insertPayload)
    .select()
    .single();

  // Resilience: If foreign key constraint failed on invited_by, retry without invited_by
  if (error && (error.message?.includes('brand_invitations_invited_by_fkey') || error.code === '23503')) {
    console.warn('Foreign key check on invited_by failed, retrying without invited_by:', error.message);
    delete insertPayload.invited_by;
    const retry = await supabase
      .from('brand_invitations')
      .insert(insertPayload)
      .select()
      .single();
    invite = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(`Failed to store invitation: ${error.message}`);
  }

  // Construct onboarding URL
  const origin = window.location.origin;
  const inviteUrl = `${origin}/?token=${inviteToken}`;

  // Send real email via Resend (with reply_to set to inviter's email)
  const emailRes = await sendBrandInviteEmail({
    toEmail: cleanEmail,
    inviterName,
    inviterEmail,
    brandName,
    role,
    inviteUrl
  });

  return {
    invitation: invite,
    inviteUrl,
    emailSent: emailRes.success,
    emailError: emailRes.error
  };
};

/**
 * 5. Submit Request to Join an Existing Brand
 * The applicant fills personal details; role and approval rights will be assigned by the Brand Admin.
 */
export const requestToJoinBrand = async ({
  brandId,
  fullName,
  email,
  password,
  phoneNumber,
  jobTitle,
  note
}: RequestJoinBrandParams) => {
  const cleanEmail = email.trim().toLowerCase();

  // Step 1: Sign up user in Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: password
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Failed to create account.');
  }

  // Step 2: Store user profile in public.users
  await supabase.from('users').upsert({
    id: userId,
    email: cleanEmail,
    full_name: fullName.trim(),
    phone_number: phoneNumber?.trim() || null,
    job_title: jobTitle?.trim() || null,
    is_org_admin: false,
    is_active: true
  });

  // Step 3: Insert join request in brand_members with status='pending_approval'
  // (Notice: role defaults to 'content_creator', can_approve is FALSE until assigned by admin)
  const { data: memberRecord, error: memberError } = await supabase
    .from('brand_members')
    .insert({
      brand_id: brandId,
      user_id: userId,
      role: 'content_creator',
      can_approve: false,
      can_publish_directly: false,
      status: 'pending_approval'
    })
    .select()
    .single();

  if (memberError) {
    throw new Error(`Failed to record join request: ${memberError.message}`);
  }

  // Step 4: Dispatch emails:
  // 1. Immediate acknowledgment to the APPLICANT confirming application receipt
  // 2. Notification to both Brand Admins and Org Admins alerting them to review
  try {
    const origin = window.location.origin;

    const { data: brand } = await supabase
      .from('brands')
      .select('name, created_by')
      .eq('id', brandId)
      .maybeSingle();

    const brandName = brand?.name || 'Workspace';

    // 4.1 Dispatch immediate confirmation to the APPLICANT
    try {
      await sendJoinRequestApplicantConfirmationEmail({
        toApplicantEmail: cleanEmail,
        applicantName: fullName.trim(),
        brandName
      });
    } catch (appAckErr) {
      console.warn('Could not dispatch applicant acknowledgment email:', appAckErr);
    }

    // 4.2 Dispatch review alerts to Brand Admins & Org Admins
    const adminEmails = new Set<string>();

    // A. Query Org Admins from users table
    try {
      const { data: orgAdmins } = await supabase
        .from('users')
        .select('email')
        .eq('is_org_admin', true);

      (orgAdmins || []).forEach(u => {
        if (u.email) adminEmails.add(u.email.trim().toLowerCase());
      });
    } catch {}

    // B. Query Brand Admins from brand_members
    try {
      const { data: bMembers } = await supabase
        .from('brand_members')
        .select('user_id')
        .eq('brand_id', brandId)
        .eq('status', 'active')
        .in('role', ['brand_admin', 'Brand Admin']);

      if (bMembers && bMembers.length > 0) {
        const adminIds = bMembers.map(m => m.user_id).filter(Boolean);
        if (adminIds.length > 0) {
          const { data: bUsers } = await supabase
            .from('users')
            .select('email')
            .in('id', adminIds);
          (bUsers || []).forEach(u => {
            if (u.email) adminEmails.add(u.email.trim().toLowerCase());
          });
        }
      }
    } catch {}

    // C. Query Brand Creator
    if (brand?.created_by) {
      try {
        const { data: creator } = await supabase
          .from('users')
          .select('email')
          .eq('id', brand.created_by)
          .maybeSingle();
        if (creator?.email) adminEmails.add(creator.email.trim().toLowerCase());
      } catch {}
    }

    // Fallback if none found
    if (adminEmails.size === 0) {
      adminEmails.add('crinoidsocial@gmail.com');
    }

    await sendJoinRequestNotificationEmail({
      toAdminEmail: Array.from(adminEmails),
      requesterName: fullName.trim(),
      requesterEmail: cleanEmail,
      brandName,
      requesterJobTitle: jobTitle,
      reviewUrl: `${origin}/`
    });
  } catch (notifyErr) {
    console.warn('Could not dispatch join request email notification', notifyErr);
  }

  return {
    userId,
    memberRecord
  };
};

/**
 * 6. Fetch Pending Join Requests for a Brand (for Brand Admin & Org Admin review)
 */
export const fetchPendingBrandRequests = async (brandId?: string) => {
  let query = supabase
    .from('brand_members')
    .select(`
      id,
      brand_id,
      user_id,
      role,
      can_approve,
      status,
      joined_at,
      brands:brand_id (
        id,
        name
      ),
      users:user_id (
        id,
        email,
        full_name,
        phone_number,
        job_title,
        avatar_url
      )
    `)
    .eq('status', 'pending_approval');

  if (brandId && brandId !== 'all') {
    query = query.eq('brand_id', brandId);
  }

  const { data, error } = await query.order('joined_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch pending join requests', error);
    return [];
  }
  return data || [];
};

/**
 * 7. Admin Reviews Join Request: Assigns Role, Toggles Approval Checkbox & Approves/Rejects
 */
export const reviewBrandJoinRequest = async ({
  memberRecordId,
  role,
  canApprove,
  decision
}: {
  memberRecordId: string;
  role: 'brand_admin' | 'content_creator' | 'approver' | 'client_approver';
  canApprove: boolean;
  decision: 'approved' | 'rejected';
}) => {
  if (decision === 'approved') {
    const { data, error } = await supabase
      .from('brand_members')
      .update({
        role: role,
        can_approve: canApprove,
        can_publish_directly: role === 'brand_admin',
        is_client: role === 'client_approver',
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', memberRecordId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Sync role title to public.users table as well
    if (data?.user_id) {
      const roleTitle = role === 'brand_admin'
        ? 'Brand Admin'
        : role === 'content_creator'
        ? 'Content Creator'
        : role === 'approver'
        ? 'Approver'
        : 'Client Approver';

      await supabase.from('users').update({
        job_title: roleTitle
      }).eq('id', data.user_id);

      // Dispatch approval confirmation email to the applicant
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', data.user_id)
          .maybeSingle();

        const { data: brandData } = await supabase
          .from('brands')
          .select('name')
          .eq('id', data.brand_id)
          .maybeSingle();

        if (userProfile?.email) {
          const origin = window.location.origin;
          await sendJoinApprovalSuccessEmail({
            toEmail: userProfile.email,
            userName: userProfile.full_name || 'Team Member',
            brandName: brandData?.name || 'Workspace',
            assignedRole: roleTitle,
            canApprove,
            loginUrl: `${origin}/login`
          });
        }
      } catch (emailErr) {
        console.warn('Could not dispatch join approval confirmation email', emailErr);
      }
    }

    return data;
  } else {
    // Rejected: delete the pending member request
    const { error } = await supabase
      .from('brand_members')
      .delete()
      .eq('id', memberRecordId);

    if (error) throw new Error(error.message);
    return null;
  }
};

/**
 * 8. Retrieve Invitation Details by Token
 */
export const getInvitationByToken = async (token: string) => {
  const { data, error } = await supabase
    .from('brand_invitations')
    .select(`
      id,
      brand_id,
      email,
      role,
      can_approve,
      can_publish_directly,
      status,
      expires_at,
      brands:brand_id (
        id,
        name,
        brand_color,
        logo_url
      )
    `)
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (error || !data) {
    return null;
  }
  return data;
};

/**
 * 9. Invitee Accepts Invitation & Completes Profile Information
 */
export const acceptInvitationAndCompleteProfile = async ({
  token,
  fullName,
  password,
  phoneNumber,
  jobTitle
}: AcceptInviteParams) => {
  const invite = await getInvitationByToken(token);
  if (!invite) {
    throw new Error('This invitation link is invalid or has already been used.');
  }

  // 1. Sign up / authenticate in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password: password
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const userId = authData.user?.id;
  if (!userId) {
    throw new Error('Failed to create account.');
  }

  // 2. Insert into users table
  const defaultRoleTitle = invite?.role ? invite.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Team Member';

  await supabase.from('users').upsert({
    id: userId,
    email: invite.email,
    full_name: fullName.trim(),
    phone_number: phoneNumber?.trim() || null,
    job_title: jobTitle?.trim() || defaultRoleTitle,
    is_org_admin: false,
    is_active: true
  });

  // 3. Insert into brand_members with the assigned role & can_approve checkbox
  await supabase.from('brand_members').upsert({
    brand_id: invite.brand_id,
    user_id: userId,
    role: invite.role,
    can_approve: invite.can_approve,
    can_publish_directly: invite.can_publish_directly,
    is_client: invite.role === 'client_approver',
    status: 'active'
  });

  // 4. Mark invitation as accepted
  await supabase
    .from('brand_invitations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', invite.id);

  return {
    userId,
    brandId: invite.brand_id,
    role: invite.role
  };
};
