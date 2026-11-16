import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../services/supabase';
import { fetchBrandsForUser } from '../../services/organizationService';
import { APP_NAME } from '../../config/appConfig';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithRealUser, setCurrentView } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both your email address and password.');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Authenticate with real Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (authError || !authData.user) {
        setError(authError?.message || 'Invalid email or password. Please verify credentials.');
        setIsSubmitting(false);
        return;
      }

      // 2. Fetch user profile from public.users
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      const isOrgAdmin = userProfile?.is_org_admin === true;

      // 3. Fetch user's brand memberships
      let userBrands: any[] = [];
      let assignedRole = isOrgAdmin ? 'Brand Director' : 'Content Creator';

      const dbBrands = await fetchBrandsForUser(authData.user.id, isOrgAdmin);

      if (dbBrands && dbBrands.length > 0) {
        if (!isOrgAdmin) {
          assignedRole = (dbBrands[0] as any)?.brand_members?.[0]?.role || 'Content Creator';
        }
        userBrands = dbBrands.map((b: any) => ({
          id: b.id,
          name: b.name,
          logo: b.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
          tagline: b.brand_description || 'Active Brand',
          color: b.brand_color || '#4f46e5',
          users: (b.brand_members || []).map((m: any) => ({
            id: m.user_id,
            name: m.role,
            email: '',
            role: m.role,
            avatar: '',
            brandId: b.id
          })),
          accounts: []
        }));
      } else if (!isOrgAdmin) {
        // Check if user has a pending join request awaiting admin approval
        const { data: pendingRequests } = await supabase
          .from('brand_members')
          .select('brand_id, role, brands(name)')
          .eq('user_id', authData.user.id)
          .eq('status', 'pending_approval');

        // Immediately terminate the session so unapproved users cannot access the workspace
        await supabase.auth.signOut();

        if (pendingRequests && pendingRequests.length > 0) {
          const requestedBrand = (pendingRequests[0].brands as any)?.name || 'the brand';
          setError(`Your request to join "${requestedBrand}" is pending Admin approval. You will be able to log in once an administrator assigns your role and approves your access.`);
        } else {
          setError('Access restricted: You do not currently belong to any active brand. Please contact your administrator.');
        }
        setIsSubmitting(false);
        return;
      }

      const primaryBrand = userBrands[0] || null;

      loginWithRealUser({
        id: authData.user.id,
        name: userProfile?.full_name || authData.user.email?.split('@')[0] || 'User',
        email: authData.user.email || cleanEmail,
        role: assignedRole as any,
        is_org_admin: isOrgAdmin,
        avatar: userProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        brandId: primaryBrand?.id || ''
      }, userBrands);

      setIsSubmitting(false);
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', width: '100%' }}>
      {/* Left Hero Panel */}
      <div
        className="hide-on-mobile"
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #4f46e5 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          position: 'relative',
          overflow: 'hidden',
          color: '#ffffff'
        }}
      >
        {/* Glow ambient background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '360px',
            height: '360px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '-60px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Brand header */}
        <div 
          onClick={() => setCurrentView('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', zIndex: 1 }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(129,140,248,0.4)'
            }}
          >
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {APP_NAME}
            </span>
            <div style={{ fontSize: '11px', color: '#c7d2fe', fontWeight: 600, letterSpacing: '0.04em' }}>
              SAAS PLATFORM
            </div>
          </div>
        </div>

        {/* Hero Value Props */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '440px', zIndex: 1 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#e0e7ff',
                marginBottom: '16px'
              }}
            >
              <ShieldCheck size={14} /> Dev Sandbox Mode
            </div>
            <h1
              style={{
                fontSize: '34px',
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
                marginBottom: '14px'
              }}
            >
              Multi-channel social publishing, engineered for scale.
            </h1>
            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6 }}>
              Craft once, adapt per channel, and preview live across Instagram, Facebook, LinkedIn, and YouTube.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Multi-channel composer with platform-specific variations',
              'Real-time native live previews with hashtag & mention styling',
              'Instant draft autosaving with local workspace persistence',
              'Integrated mock workflows for Approval, Scheduling & Publishing'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: '#f1f5f9' }}>
                <CheckCircle2 size={16} color="#818cf8" style={{ flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          {APP_NAME} SaaS &bull; Workspace Access &bull; Version 1.0.0
        </div>
      </div>

      {/* Right Login Form */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          position: 'relative'
        }}
      >
        {/* Return to Public Landing Page Link */}
        <button
          type="button"
          onClick={() => setCurrentView('landing')}
          style={{
            position: 'absolute',
            top: '32px',
            left: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#6366f1',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '6px',
            transition: 'background-color 150ms ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f3ff')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <ArrowLeft size={16} />
          <span>Back to Crinoid Social</span>
        </button>

        <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header matching requirements */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Sparkles size={15} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {APP_NAME}
              </span>
            </div>

            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', marginBottom: '6px' }}>
              Welcome Back
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              Log in to continue to your workspace.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-failed-bg)',
                border: '1px solid var(--status-failed-border)',
                color: 'var(--status-failed-text)',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Log In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '13.5px', color: '#475569' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setCurrentView('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Register here &rarr;
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
            Protected by Supabase authentication &amp; Row Level Security.
          </div>
        </div>
      </div>
    </div>
  );
};
