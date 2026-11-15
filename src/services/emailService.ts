import { supabase } from './supabase';

export interface SendInviteEmailParams {
  toEmail: string;
  inviterName: string;
  inviterEmail?: string;
  brandName: string;
  role: string;
  inviteUrl: string;
}

export interface SendJoinRequestEmailParams {
  toAdminEmail: string;
  requesterName: string;
  requesterEmail: string;
  brandName: string;
  requesterJobTitle?: string;
  reviewUrl: string;
}

/**
 * Sends a branded invitation email via Resend API
 */
export const sendBrandInviteEmail = async ({
  toEmail,
  inviterName,
  inviterEmail,
  brandName,
  role,
  inviteUrl
}: SendInviteEmailParams): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const roleFormatted = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Crinoid Social</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Unified Social Media Management</p>
        </div>
        
        <div style="padding: 32px 28px; color: #1e293b; line-height: 1.6;">
          <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a;">You're Invited!</h2>
          <p style="margin: 0 0 16px; font-size: 15px;">
            <strong>${inviterName}</strong> has invited you to join <strong>${brandName}</strong> on Crinoid Social as a <strong>${roleFormatted}</strong>.
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13.5px; color: #475569;">
              <strong>Workspace:</strong> ${brandName}<br/>
              <strong>Assigned Role:</strong> ${roleFormatted}<br/>
              <strong>Invited By:</strong> ${inviterName} ${inviterEmail ? `(${inviterEmail})` : ''}
            </p>
          </div>

          <p style="margin: 0 0 24px; font-size: 14.5px; color: #334155;">
            Click the button below to accept your invitation, complete your profile, and start collaborating:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 13px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);">
              Accept Invitation & Set Up Account
            </a>
          </div>

          <p style="margin: 24px 0 0; font-size: 12.5px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${inviteUrl}" style="color: #4f46e5; word-break: break-all;">${inviteUrl}</a>
          </p>

          ${inviterEmail ? `
          <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 12px;">
            Need help or have questions? Simply reply directly to this email to reach <strong>${inviterName}</strong> (${inviterEmail}).
          </p>` : ''}
        </div>

        <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; ${new Date().getFullYear()} Crinoid Social. All rights reserved.
        </div>
      </div>
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: 'Crinoid Social <onboarding@resend.dev>',
        reply_to: inviterEmail || undefined,
        to: [toEmail],
        subject: `Invitation: Join ${brandName} as ${roleFormatted} on Crinoid Social`,
        html: htmlContent
      })
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.warn('Resend API response error:', data);
      return { success: false, error: data.error || data.message || 'Failed to send invite email' };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Email dispatch exception:', err);
    return { success: false, error: err.message || 'Failed to dispatch email' };
  }
};

/**
 * Sends a notification email to Org Admin / Brand Admin when a user requests to join
 */
export const sendJoinRequestNotificationEmail = async ({
  toAdminEmail,
  requesterName,
  requesterEmail,
  brandName,
  requesterJobTitle,
  reviewUrl
}: SendJoinRequestEmailParams): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">New Member Join Request</h1>
          <p style="margin: 4px 0 0; font-size: 13.5px; opacity: 0.9;">Crinoid Social Workspace Access</p>
        </div>

        <div style="padding: 28px 24px; color: #1e293b; line-height: 1.6;">
          <p style="margin: 0 0 16px; font-size: 15px;">
            <strong>${requesterName}</strong> has submitted a request to join <strong>${brandName}</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0 0 6px; font-size: 13.5px;"><strong>Applicant Name:</strong> ${requesterName}</p>
            <p style="margin: 0 0 6px; font-size: 13.5px;"><strong>Email:</strong> ${requesterEmail}</p>
            ${requesterJobTitle ? `<p style="margin: 0; font-size: 13.5px;"><strong>Job Title:</strong> ${requesterJobTitle}</p>` : ''}
          </div>

          <p style="margin: 0 0 24px; font-size: 14px; color: #475569;">
            As the administrator, you can review this request, assign their role, toggle post approval rights, and grant access to the workspace.
          </p>

          <div style="text-align: center; margin: 26px 0;">
            <a href="${reviewUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14.5px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
              Review & Assign Role
            </a>
          </div>
        </div>
      </div>
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        from: 'Crinoid Social <onboarding@resend.dev>',
        reply_to: requesterEmail || undefined,
        to: [toAdminEmail],
        subject: `[Join Request] ${requesterName} wants to join ${brandName}`,
        html: htmlContent
      })
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || data.message || 'Failed to send join request notification' };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send join request notification' };
  }
};
