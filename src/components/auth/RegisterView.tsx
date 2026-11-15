import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { APP_NAME } from '../../config/appConfig';
import { 
  registerOrgAdminAndOrganization, 
  fetchAvailableBrands, 
  requestToJoinBrand 
} from '../../services/organizationService';
import { 
  Building2, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Briefcase,
  Loader2,
  ShieldCheck,
  Check,
  Clock
} from 'lucide-react';

export const RegisterView: React.FC = () => {
  const { setCurrentView, showToast } = useApp();

  // Mode: 'choose' | 'create_org' | 'join_brand' | 'success'
  const [mode, setMode] = useState<'choose' | 'create_org' | 'join_brand' | 'success'>('choose');
  const [registrationType, setRegistrationType] = useState<'create_org' | 'join_brand'>('create_org');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form states - Create Org
  const [orgName, setOrgName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Form states - Join Brand
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [searchBrandQuery, setSearchBrandQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null);
  const [joinNote, setJoinNote] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available brands when user switches to 'join_brand' mode
  useEffect(() => {
    if (mode === 'join_brand') {
      setIsLoadingBrands(true);
      fetchAvailableBrands()
        .then(data => setAvailableBrands(data))
        .catch(err => console.error('Failed to load brands', err))
        .finally(() => setIsLoadingBrands(false));
    }
  }, [mode]);

  // Filtered brands
  const filteredBrands = availableBrands.filter(b => 
    b.name.toLowerCase().includes(searchBrandQuery.toLowerCase()) ||
    (b.brand_description && b.brand_description.toLowerCase().includes(searchBrandQuery.toLowerCase()))
  );

  // Handler: Create Organization & Admin
  const handleCreateOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!orgName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
        throw new Error('Please fill in all required fields.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      const result = await registerOrgAdminAndOrganization({
        orgName,
        fullName,
        email,
        password,
        phoneNumber: phone,
        jobTitle
      });

      showToast('success', `Organization "${result.organization.name}" created successfully!`);
      setSuccessMessage(`Welcome, ${fullName}! Your organization "${result.organization.name}" has been registered in Supabase. You can now log in and set up your brands.`);
      setRegistrationType('create_org');
      setMode('success');
    } catch (err: any) {
      setError(err.message || 'Failed to create organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Join Brand Request
  const handleJoinBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!selectedBrand) {
        throw new Error('Please select a brand from the list.');
      }
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        throw new Error('Please fill in your name, email, and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      await requestToJoinBrand({
        brandId: selectedBrand.id,
        fullName,
        email,
        password,
        phoneNumber: phone,
        jobTitle,
        note: joinNote
      });

      showToast('success', 'Join request submitted successfully!');
      setSuccessMessage(`Your request to join "${selectedBrand.name}" has been sent to the Brand Admin and Organization Admin. Once they review your details, assign your role, and approve your access, you will be notified!`);
      setRegistrationType('join_brand');
      setMode('success');
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', width: '100%' }}>
      {/* Left Branding Hero Panel */}
      <div
        className="hide-on-mobile"
        style={{
          flex: '0 0 40%',
          background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4338ca 70%, #4f46e5 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px',
          color: '#ffffff',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
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
              ORGANIZATION & BRAND WORKSPACES
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '420px', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: 600, color: '#e0e7ff', marginBottom: '16px' }}>
            <ShieldCheck size={14} /> Zoho Social-Style Architecture
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em', marginBottom: '14px' }}>
            {mode === 'create_org' ? 'Build your Agency Hub' : mode === 'join_brand' ? 'Collaborate with your Team' : 'Choose how you want to join'}
          </h1>
          <p style={{ fontSize: '14.5px', color: '#cbd5e1', lineHeight: 1.6 }}>
            Unified multi-channel management with granular approval hierarchies, brand admin invitations, and real-time social analytics.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          &copy; {new Date().getFullYear()} {APP_NAME} &bull; PostgreSQL & Supabase Powered
        </div>
      </div>

      {/* Right Registration Content */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          overflowY: 'auto'
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Top Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {mode !== 'choose' && mode !== 'success' ? (
              <button
                type="button"
                onClick={() => { setMode('choose'); setError(null); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                <ArrowLeft size={16} /> Back to options
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#6366f1', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                <ArrowLeft size={16} /> Back to Login
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}
            >
              Public Home &rarr;
            </button>
          </div>

          {/* ======================================================== */}
          {/* SCREEN 1: CHOOSE REGISTRATION TYPE                       */}
          {/* ======================================================== */}
          {mode === 'choose' && (
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Join Crinoid Social
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                Select an option below to set up your account:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Option 1: Create Organization */}
                <div
                  onClick={() => { setMode('create_org'); setError(null); }}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#4f46e5';
                    e.currentTarget.style.backgroundColor = '#faf5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', flexShrink: 0 }}>
                    <Building2 size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Create an Organization</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 7px', borderRadius: '4px' }}>ORG ADMIN</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                      For agency founders & directors. Register the single organization, create client brands, and invite brand admins.
                    </p>
                  </div>
                  <ArrowRight size={18} color="#94a3b8" style={{ marginTop: '4px' }} />
                </div>

                {/* Option 2: Join a Brand */}
                <div
                  onClick={() => { setMode('join_brand'); setError(null); }}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0ea5e9';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
                    <Users size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Join a Brand</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: '4px' }}>TEAM MEMBER</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                      Search existing brands and send a join request. The Brand Admin will review your profile, assign your role, and grant access.
                    </p>
                  </div>
                  <ArrowRight size={18} color="#94a3b8" style={{ marginTop: '4px' }} />
                </div>
              </div>

              <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Log in here
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 2: CREATE ORGANIZATION FORM                       */}
          {/* ======================================================== */}
          {mode === 'create_org' && (
            <form onSubmit={handleCreateOrgSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  Register Organization
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b' }}>
                  Set up your parent agency. You will be registered as the Organization Admin.
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
                  Organization / Agency Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Crinoid Media Agency"
                    required
                    style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
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
                    placeholder="e.g. Muthukumar"
                    required
                    style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@crinoid.social"
                    required
                    style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Password *
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

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Job Title (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={15} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Managing Director"
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
                  marginTop: '10px',
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
                    <span>Creating Organization in Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Create Organization & Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* SCREEN 3: JOIN BRAND SEARCH & REQUEST FORM               */}
          {/* ======================================================== */}
          {mode === 'join_brand' && (
            <form onSubmit={handleJoinBrandSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  Join an Existing Brand
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b' }}>
                  Search for your brand and send a request. Role and approval permissions are assigned by the Brand Admin.
                </p>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Select Brand */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Step 1: Search & Select Brand *
                </label>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchBrandQuery}
                    onChange={(e) => setSearchBrandQuery(e.target.value)}
                    placeholder="Search brand name..."
                    style={{ width: '100%', padding: '9px 12px 9px 38px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  />
                </div>

                {/* Brands List Container */}
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {isLoadingBrands ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Loader2 size={14} className="animate-spin" /> Loading brands from Supabase...
                    </div>
                  ) : filteredBrands.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8' }}>
                      {searchBrandQuery ? `No brands matched "${searchBrandQuery}"` : 'No brands created yet in database. Register as Org Admin first to create a brand.'}
                    </div>
                  ) : (
                    filteredBrands.map((b) => {
                      const isSelected = selectedBrand?.id === b.id;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBrand(b)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            border: `1px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: b.brand_color || '#4f46e5', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                              {b.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{b.name}</div>
                              {b.brand_description && (
                                <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {b.brand_description}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check size={16} color="#3b82f6" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 2: Personal Profile Inputs */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                  Step 2: Enter Your Information
                </span>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@crinoid.social"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Content Writer"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', fontSize: '11.5px', color: '#64748b', border: '1px solid #e2e8f0' }}>
                  ℹ️ <strong>Note on Permissions:</strong> Your role and approval rights will be designated by the Brand Admin upon reviewing this request.
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedBrand}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: !selectedBrand ? '#94a3b8' : '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isSubmitting || !selectedBrand ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Send Join Request {selectedBrand ? `to ${selectedBrand.name}` : ''}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ======================================================== */}
          {/* SCREEN 4: SUCCESS CONFIRMATION                           */}
          {/* ======================================================== */}
          {mode === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {registrationType === 'join_brand' ? (
                <>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Clock size={30} />
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', backgroundColor: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700, marginBottom: '12px' }}>
                    AWAITING ADMIN APPROVAL
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Join Request Under Review
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                    {successMessage}
                  </p>

                  <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '13px', textAlign: 'left', marginBottom: '24px', lineHeight: 1.5 }}>
                    <strong>Access Note:</strong> Your account login is currently locked. The Brand Admin or Organization Admin must first review your application, select your role, and approve your access before you can enter the workspace.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentView('landing')}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Return to Homepage
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    Organization Registered!
                  </h3>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                    {successMessage}
                  </p>

                  <button
                    type="button"
                    onClick={() => setCurrentView('login')}
                    style={{
                      padding: '11px 24px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Log In as Organization Admin &rarr;
                  </button>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
