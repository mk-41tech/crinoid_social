import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../config/appConfig';
import { getInvitationByToken, acceptInvitationAndCompleteProfile } from '../../services/organizationService';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Lock, 
  Phone, 
  Briefcase, 
  ArrowRight, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface InviteAcceptViewProps {
  token: string;
}

export const InviteAcceptView: React.FC<InviteAcceptViewProps> = ({ token }) => {
  const { setCurrentView, showToast } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [invite, setInvite] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getInvitationByToken(token);
        if (!data) {
          setError('This invitation link is invalid or has already been used.');
        } else {
          setInvite(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify invitation.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const assignedRoleTitle = invite?.role === 'brand_admin' 
    ? 'Brand Admin'
    : invite?.role === 'content_creator'
    ? 'Content Creator'
    : invite?.role === 'approver'
    ? 'Approver'
    : invite?.role === 'client_approver'
    ? 'Client Approver'
    : (invite?.role ? invite.role.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Team Member');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!fullName.trim() || !password.trim()) {
        throw new Error('Please fill in your name and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      await acceptInvitationAndCompleteProfile({
        token,
        fullName,
        password,
        phoneNumber: phone,
        jobTitle: assignedRoleTitle
      });

      showToast('success', 'Invitation accepted! Your account is ready.');
      setIsCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete account setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <Loader2 size={32} className="animate-spin" color="#4f46e5" />
        <span style={{ fontSize: '14px', color: '#64748b' }}>Verifying your invitation...</span>
      </div>
    );
  }

  const roleName = invite?.role ? invite.role.replace(/_/g, ' ').toUpperCase() : 'TEAM MEMBER';
  const brandName = invite?.brands?.name || 'Workspace';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', width: '100%' }}>
      {/* Left Hero */}
      <div
        className="hide-on-mobile"
        style={{
          flex: '0 0 40%',
          background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #4f46e5 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>{APP_NAME}</span>
            <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 600 }}>TEAM ONBOARDING</div>
          </div>
        </div>

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', fontSize: '12px', fontWeight: 600, color: '#e0e7ff', marginBottom: '16px' }}>
            <ShieldCheck size={14} /> Official Invitation
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, lineHeight: 1.25, marginBottom: '14px' }}>
            Join {brandName} on Crinoid Social
          </h1>
          <p style={{ fontSize: '14.5px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Set up your credentials to access publishing, multi-channel composer, and approval workflows.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          &copy; {new Date().getFullYear()} {APP_NAME}
        </div>
      </div>

      {/* Right Form */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {error && !invite ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Invalid Invitation</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>{error}</p>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Go to Login
              </button>
            </div>
          ) : isCompleted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Setup Complete!</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                Your account is active and you have been added to <strong>{brandName}</strong> with role <strong>{roleName}</strong>. You can now log in.
              </p>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                style={{ padding: '12px 28px', backgroundColor: '#4f46e5', color: '#ffffff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Log In to Workspace &rarr;
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px' }}>
                    INVITED AS {roleName}
                  </span>
                  {invite?.can_approve && (
                    <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px' }}>
                      CAN APPROVE POSTS
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  Complete Your Profile
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b' }}>
                  Enter your details to join <strong>{brandName}</strong>.
                </p>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={invite?.email || ''}
                  disabled
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '13.5px', cursor: 'not-allowed' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Your Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Create Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Assigned Role
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ShieldCheck size={16} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#4f46e5' }} />
                    <input
                      type="text"
                      value={assignedRoleTitle}
                      disabled
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '8px',
                        border: '1px solid #c7d2fe',
                        backgroundColor: '#eef2ff',
                        color: '#3730a3',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Phone Number (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Activating Account in Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Accept & Enter Workspace</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
