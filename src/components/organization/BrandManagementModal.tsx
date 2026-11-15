import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  createBrand, 
  sendBrandInvite, 
  fetchPendingBrandRequests, 
  reviewBrandJoinRequest,
  fetchAvailableBrands
} from '../../services/organizationService';
import { supabase } from '../../services/supabase';
import { 
  X, 
  Building2, 
  Plus, 
  Mail, 
  Check, 
  Copy, 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  Send,
  UserCheck,
  UserX,
  Briefcase,
  Phone
} from 'lucide-react';

interface BrandManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandManagementModal: React.FC<BrandManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentBrand, currentUser, showToast, brands, switchBrand, addBrand } = useApp();

  // Role hierarchy check: Org Admin can invite Brand Admins & create brands; Brand Admin invites team members
  const isOrgAdmin = Boolean(
    currentUser?.role === 'Brand Director' || 
    currentUser?.role === 'Brand Manager' ||
    currentUser?.role === 'Social Lead' ||
    (currentUser as any)?.is_org_admin
  );

  const [activeTab, setActiveTab] = useState<'create_brand' | 'invite_member' | 'pending_requests'>('invite_member');

  // Supabase Brands state
  const [dbBrands, setDbBrands] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');

  // Create Brand State
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [newBrandColor, setNewBrandColor] = useState('#4F46E5');
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);

  // Invite Member State: Org Admin defaults to brand_admin; Brand Admin defaults to content_creator
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'brand_admin' | 'content_creator' | 'approver' | 'client_approver'>(
    isOrgAdmin ? 'brand_admin' : 'content_creator'
  );
  const [canApproveCheckbox, setCanApproveCheckbox] = useState<boolean>(isOrgAdmin ? true : false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [lastGeneratedInviteUrl, setLastGeneratedInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOrgAdmin && inviteRole === 'brand_admin') {
      setInviteRole('content_creator');
      setCanApproveCheckbox(false);
    }
  }, [isOrgAdmin]);

  // Pending Join Requests State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, any>>({});
  const [approvalChecks, setApprovalChecks] = useState<Record<string, boolean>>({});

  const isValidUUID = (id?: string) => !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Load available brands from Supabase
  const loadDbBrands = async () => {
    try {
      const data = await fetchAvailableBrands();
      setDbBrands(data);
      if (isValidUUID(currentBrand?.id)) {
        setSelectedBrandId(currentBrand.id);
      } else if (data.length > 0) {
        setSelectedBrandId(data[0].id);
      } else {
        setSelectedBrandId('');
      }
    } catch (err) {
      console.error('Failed to load Supabase brands', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDbBrands();
    }
  }, [isOpen, currentBrand?.id]);

  const [requestBrandFilter, setRequestBrandFilter] = useState<string>('all');

  // Load pending join requests for current brand or all brands
  const loadRequests = async (overrideFilter?: string) => {
    setIsLoadingRequests(true);
    try {
      const filter = overrideFilter !== undefined ? overrideFilter : (isOrgAdmin ? requestBrandFilter : (currentBrand?.id || 'all'));
      const data = await fetchPendingBrandRequests(filter);
      setPendingRequests(data);
      // Pre-populate default roles
      const initialRoles: Record<string, any> = {};
      const initialChecks: Record<string, boolean> = {};
      data.forEach(req => {
        initialRoles[req.id] = req.role || 'content_creator';
        initialChecks[req.id] = req.role === 'brand_admin' || req.role === 'approver' || Boolean(req.can_approve);
      });
      setSelectedRoles(prev => ({ ...initialRoles, ...prev }));
      setApprovalChecks(prev => ({ ...initialChecks, ...prev }));
    } catch (err) {
      console.error('Failed to load pending requests', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'pending_requests') {
      loadRequests();
    }
  }, [isOpen, activeTab, selectedBrandId, currentBrand?.id, requestBrandFilter]);

  if (!isOpen) return null;

  // Handler: Create Brand
  const handleCreateBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      showToast('error', 'Brand name is required.');
      return;
    }

    setIsCreatingBrand(true);
    try {
      // Fetch org ID
      const { data: orgs } = await supabase.from('organizations').select('id, owner_id').limit(1);
      if (!orgs || orgs.length === 0) {
        showToast('error', 'No organization found in Supabase. Please register an organization first.');
        return;
      }
      const orgId = orgs[0].id;
      const creatorId = isValidUUID(currentUser?.id) ? currentUser!.id : orgs[0].owner_id;

      const brand = await createBrand({
        organizationId: orgId,
        name: newBrandName,
        brandDescription: newBrandDesc,
        brandColor: newBrandColor,
        createdByUserId: creatorId
      });

      const newBrandObj = {
        id: brand.id,
        name: brand.name,
        logo: brand.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        tagline: brand.brand_description || 'Social Media Management',
        color: brand.brand_color || '#4f46e5',
        users: [],
        accounts: []
      };

      addBrand(newBrandObj);
      setSelectedBrandId(brand.id);
      showToast('success', `Brand "${brand.name}" created in Supabase!`);
      setNewBrandName('');
      setNewBrandDesc('');
      await loadDbBrands();
      setActiveTab('invite_member');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to create brand.');
    } finally {
      setIsCreatingBrand(false);
    }
  };

  // Handler: Send Brand Invite (with Role & Approval Checkbox)
  const handleSendInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      showToast('error', 'Email is required.');
      return;
    }

    if (!isValidUUID(selectedBrandId)) {
      showToast('error', 'Please create a brand first in the "Create New Brand" tab before sending invites.');
      return;
    }

    const targetBrand = dbBrands.find(b => b.id === selectedBrandId) || currentBrand;

    setIsSendingInvite(true);
    try {
      const res = await sendBrandInvite({
        brandId: selectedBrandId,
        brandName: targetBrand?.name || 'Brand',
        email: inviteEmail,
        role: inviteRole,
        canApprove: canApproveCheckbox,
        canPublishDirectly: inviteRole === 'brand_admin',
        invitedByUserId: currentUser?.id || '',
        inviterName: currentUser?.name || 'Administrator',
        inviterEmail: currentUser?.email || 'admin@crinoid.social'
      });

      setLastGeneratedInviteUrl(res.inviteUrl);
      if (res.emailSent) {
        showToast('success', `Invitation sent via email to ${inviteEmail}!`);
      } else {
        showToast('warning', `Invite created in database. Email note: ${res.emailError || 'Use copy link below'}`);
      }
      setInviteEmail('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to send invite.');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Handler: Review Join Request (Assign Role, Approval Checkbox, & Admit)
  const handleReviewRequest = async (requestId: string, decision: 'approved' | 'rejected') => {
    setProcessingRequestId(requestId);
    try {
      const role = selectedRoles[requestId] || 'content_creator';
      const canApprove = Boolean(approvalChecks[requestId]);

      await reviewBrandJoinRequest({
        memberRecordId: requestId,
        role,
        canApprove,
        decision
      });

      showToast('success', decision === 'approved' ? 'Member approved and admitted to brand!' : 'Join request rejected.');
      loadRequests();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to process request.');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleCopyLink = () => {
    if (lastGeneratedInviteUrl) {
      navigator.clipboard.writeText(lastGeneratedInviteUrl);
      setCopiedLink(true);
      showToast('success', 'Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Brand & Team Management
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Active Brand: <strong>{currentBrand.name}</strong>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', padding: '0 12px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('invite_member')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'invite_member' ? 700 : 500,
              color: activeTab === 'invite_member' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'invite_member' ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            Invite Member / Admin
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create_brand')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'create_brand' ? 700 : 500,
              color: activeTab === 'create_brand' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'create_brand' ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            Create New Brand
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending_requests')}
            style={{
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'pending_requests' ? 700 : 500,
              color: activeTab === 'pending_requests' ? '#4f46e5' : '#64748b',
              borderBottom: activeTab === 'pending_requests' ? '2px solid #4f46e5' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Pending Join Requests</span>
            {pendingRequests.length > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 5px', borderRadius: '999px', fontWeight: 700 }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px', overflowY: 'auto' }}>
          
          {/* TAB 1: INVITE MEMBER WITH ROLE & APPROVAL CHECKBOX */}
          {activeTab === 'invite_member' && (
            <form onSubmit={handleSendInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  {isOrgAdmin ? 'Invite Brand Admin or Team Member' : 'Invite Team Member'} to {dbBrands.find(b => b.id === selectedBrandId)?.name || currentBrand.name}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  Dispatched via Crinoid Social with <strong>Reply-To: {currentUser?.email || 'your email'}</strong>
                </p>
              </div>

              {/* Target Brand Selection / Notice */}
              {dbBrands.length === 0 ? (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e', fontSize: '12.5px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} color="#d97706" />
                    <span>Create a Database Brand First</span>
                  </div>
                  <p style={{ margin: '0 0 8px', lineHeight: 1.4 }}>
                    "{currentBrand.name}" is a local demo brand. Supabase requires a brand stored in your database to generate valid invitation tokens and link team members.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create_brand')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Create Brand in Supabase &rarr;
                  </button>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Target Brand *
                  </label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    {dbBrands.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Invitee Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    required
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Assign Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => {
                    const r = e.target.value as any;
                    setInviteRole(r);
                    // Brand Admin and Approver have can_approve checked by default
                    if (r === 'brand_admin' || r === 'approver') {
                      setCanApproveCheckbox(true);
                    } else if (r === 'content_creator') {
                      setCanApproveCheckbox(false);
                    }
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#ffffff' }}
                >
                  {isOrgAdmin && (
                    <option value="brand_admin">Brand Admin (Full Control of Brand & Team)</option>
                  )}
                  <option value="content_creator">Content Creator (Creates drafts; must submit for approval)</option>
                  <option value="approver">Approver (Reviews, requests changes, and approves content)</option>
                  <option value="client_approver">Client Approver (External client portal view)</option>
                </select>
              </div>

              {/* THE APPROVAL PERMISSION CHECKBOX (User Requirement) */}
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={canApproveCheckbox}
                    onChange={(e) => setCanApproveCheckbox(e.target.checked)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#4f46e5' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Can Approve Posts (Approval Permission)
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      If ticked, this user has the authority to review submitted drafts and move them to the next approval stage or scheduled status.
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSendingInvite}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: isSendingInvite ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Sending Brand Invitation...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Brand Invitation</span>
                  </>
                )}
              </button>

              {/* Show Copyable Invite Link if generated */}
              {lastGeneratedInviteUrl && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e40af' }}>
                      🔗 Instant Testing Link (Created in Supabase)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={lastGeneratedInviteUrl}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '11.5px', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #93c5fd', color: '#1e3a8a' }}
                  />
                </div>
              )}
            </form>
          )}

          {/* TAB 2: CREATE NEW BRAND */}
          {activeTab === 'create_brand' && (
            <form onSubmit={handleCreateBrandSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                  Create a New Brand Workspace
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                  Each brand contains its own connected social accounts, team members, and approval rules.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Brand Name *
                </label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. NexusLife Brand"
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={newBrandDesc}
                  onChange={(e) => setNewBrandDesc(e.target.value)}
                  placeholder="Brief summary of this client or brand..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Brand Theme Color
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="color"
                    value={newBrandColor}
                    onChange={(e) => setNewBrandColor(e.target.value)}
                    style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#475569' }}>{newBrandColor}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingBrand}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: isCreatingBrand ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isCreatingBrand ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Create Brand Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: PENDING JOIN REQUESTS (From users who selected "Join Brand") */}
          {activeTab === 'pending_requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                    Review Pending Join Requests
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                    Review users requesting to join brand workspaces. Assign their role and approval capability before admitting.
                  </p>
                </div>
                {isOrgAdmin && dbBrands.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Filter Brand:</span>
                    <select
                      value={requestBrandFilter}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRequestBrandFilter(val);
                        loadRequests(val);
                      }}
                      style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 600 }}
                    >
                      <option value="all">All Brands ({dbBrands.length})</option>
                      {dbBrands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {isLoadingRequests ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                  <Loader2 size={16} className="animate-spin" /> Loading pending requests from Supabase...
                </div>
              ) : pendingRequests.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <Users size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>No Pending Join Requests</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    When team members choose "Join Brand" during registration, their requests appear here.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingRequests.map((req) => {
                    const applicant = req.users;
                    const isProcessing = processingRequestId === req.id;
                    const assignedRole = selectedRoles[req.id] || 'content_creator';
                    const canApprove = Boolean(approvalChecks[req.id]);
                    const targetBrandName = req.brands?.name || currentBrand.name;

                    return (
                      <div
                        key={req.id}
                        style={{
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                {applicant?.full_name || 'Applicant'}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px' }}>
                                Target: {targetBrandName}
                              </span>
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                              {applicant?.email}
                            </div>
                            {applicant?.phone_number && (
                              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                                Phone: {applicant.phone_number}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '10.5px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            Awaiting Approval
                          </span>
                        </div>

                        {/* Admin controls for assigning Role & Approval Checkbox */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px', backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                              Assign Role *
                            </label>
                            <select
                              value={assignedRole}
                              onChange={(e) => {
                                const newRole = e.target.value;
                                setSelectedRoles(prev => ({ ...prev, [req.id]: newRole }));
                                if (newRole === 'brand_admin' || newRole === 'approver') {
                                  setApprovalChecks(prev => ({ ...prev, [req.id]: true }));
                                } else {
                                  setApprovalChecks(prev => ({ ...prev, [req.id]: false }));
                                }
                              }}
                              style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                            >
                              <option value="brand_admin">Brand Admin (Full Control of Brand & Team)</option>
                              <option value="content_creator">Content Creator (Creates drafts; submits for approval)</option>
                              <option value="approver">Approver (Reviews, requests changes & approves)</option>
                              <option value="client_approver">Client Approver (Client sign-off portal)</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>
                              Approval Permission
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#0f172a', cursor: 'pointer', marginTop: '6px' }}>
                              <input
                                type="checkbox"
                                checked={canApprove}
                                onChange={(e) => setApprovalChecks(prev => ({ ...prev, [req.id]: e.target.checked }))}
                                style={{ accentColor: '#4f46e5', width: '15px', height: '15px' }}
                              />
                              <span>Can Approve Posts</span>
                            </label>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReviewRequest(req.id, 'rejected')}
                            style={{ padding: '6px 12px', backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReviewRequest(req.id, 'approved')}
                            style={{ padding: '6px 14px', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                          >
                            {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={14} />}
                            <span>Approve & Admit</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
