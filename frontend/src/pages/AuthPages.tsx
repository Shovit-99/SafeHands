import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Package, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login2FA, setup2FA } from '../api/auth';
import toast from 'react-hot-toast';

/* ─── colour tokens (dark metallic + cyan glow) ─── */
const C = {
  bg:        '#1e2532',
  bgCard:    '#1a222c',
  bgCard2:   '#2a3441',
  surface:   'rgba(255,255,255,0.05)',
  accent:    '#6bb8e3',
  accentDim: '#4a98c7',
  accentGlow: 'rgba(137, 207, 240, 0.4)',
  accentGlowStrong: 'rgba(137, 207, 240, 0.6)',
  text:      '#f4f7fa',
  textDim:   '#9ba8b8',
  textMuted: '#5a6b7c',
  border:    'rgba(255,255,255,0.1)',
  borderDim: 'rgba(255,255,255,0.05)',
  inputBg:   'rgba(0,0,0,0.2)',
  inputBorder: 'rgba(255,255,255,0.15)',
  inputFocus: 'rgba(137, 207, 240, 0.5)',
};

const AUTH_KEYFRAMES = `
@keyframes auth-fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes auth-glow{0%,100%{box-shadow:0 0 20px rgba(0,136,255,0.25),0 0 60px rgba(0,136,255,0.08)}50%{box-shadow:0 0 30px rgba(0,136,255,0.4),0 0 80px rgba(0,136,255,0.15)}}
@keyframes auth-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes auth-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
`;

/* ─── Shared Auth Layout ───────────────────────────────────────────────── */
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1rem',
    background: 'radial-gradient(ellipse at top right, #546a7b 0%, #2a3441 50%, #1e2532 100%)',
    fontFamily: "'Inter', system-ui, sans-serif",
    position: 'relative', overflow: 'hidden',
  }}>
    <style>{AUTH_KEYFRAMES}</style>

    {/* Background gradient glows */}
    <div style={{
      position: 'fixed', top: '-20%', right: '-10%',
      width: 600, height: 600, borderRadius: '50%',
      background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)`,
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'fixed', bottom: '-15%', left: '-10%',
      width: 500, height: 500, borderRadius: '50%',
      background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)`,
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
      width: 800, height: 800, borderRadius: '50%',
      background: `radial-gradient(circle, rgba(137,207,240,0.05) 0%, transparent 50%)`,
      pointerEvents: 'none',
    }} />

    {/* Metallic shine overlay */}
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%, rgba(255,255,255,0.02) 60%, transparent 100%)',
      pointerEvents: 'none',
    }} />

    {children}
  </div>
);

/* ─── Logo Block ───────────────────────────────────────────────────────── */
const AuthLogo: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: '1.5rem' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 24px ${C.accentGlow}`,
        animation: 'auth-float 4s ease-in-out infinite',
      }}>
        <Package size={22} color="#fff" />
      </div>
      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
        SafeHands
      </span>
    </Link>
    <h1 style={{
      fontSize: '2rem', fontWeight: 900, color: C.text,
      letterSpacing: '-0.03em', marginBottom: '0.5rem',
      animation: 'auth-fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) both',
    }}>
      {title}
    </h1>
    <p style={{
      color: C.textDim, fontSize: '0.95rem',
      animation: 'auth-fadeUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.05s both',
    }}>
      {subtitle}
    </p>
  </div>
);

/* ─── Input styling helper ─────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.9rem 1rem 0.9rem 2.85rem',
  backgroundColor: C.inputBg,
  border: `1.5px solid ${C.inputBorder}`,
  borderRadius: 14,
  color: C.text,
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.25s, box-shadow 0.25s',
};

const inputStyleRight: React.CSSProperties = {
  ...inputStyle,
  paddingRight: '2.85rem',
};

/* ─── Input Group ──────────────────────────────────────────────────────── */
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
    <label style={{
      color: C.textDim, fontSize: '0.85rem', fontWeight: 600,
      paddingLeft: '0.25rem', letterSpacing: '0.01em',
    }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        color: C.textMuted, display: 'flex', alignItems: 'center',
        pointerEvents: 'none',
      }}>
        {icon}
      </div>
      {children}
    </div>
  </div>
);

/* ─── Shared button styles ─────────────────────────────────────────────── */
const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.95rem 1.5rem',
  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  fontFamily: "'Inter', sans-serif",
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  transition: 'all 0.25s',
  boxShadow: `0 4px 20px ${C.accentGlow}`,
  animation: 'auth-glow 3s ease-in-out infinite',
  marginTop: '0.5rem',
};

const ghostBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem',
  background: 'transparent',
  color: C.textDim,
  border: `1px solid ${C.borderDim}`,
  borderRadius: 12,
  fontFamily: "'Inter', sans-serif",
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.25s',
  marginTop: '0.5rem',
};

/* ─── Login Page ───────────────────────────────────────────────────────── */
export const LoginPage: React.FC = () => {
  const { login, persist2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/explore';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [twoFaToken, setTwoFaToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data && data.requires2FA) {
        setRequires2FA(true);
        setTempToken(data.tempToken);
        toast.success('Please enter your 2FA code.');
      } else if (data && data.requires2FASetup) {
        setRequires2FASetup(true);
        setTempToken(data.tempToken);
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        toast.success('Please setup 2FA to continue.');
      } else {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaToken.length !== 6) return toast.error('Code must be 6 digits.');
    setLoading(true);
    try {
      let data;
      if (requires2FASetup) {
        data = await setup2FA(tempToken, twoFaToken);
      } else {
        data = await login2FA(tempToken, twoFaToken);
      }

      if (data.trustToken) {
        localStorage.setItem('safehands_trust_token', data.trustToken);
      }

      if (persist2FA) {
        persist2FA(data.token, data.user);
      }
      toast.success(requires2FASetup ? '2FA enabled! Welcome.' : 'Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Invalid 2FA code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{
        width: '100%', maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 2,
        animation: 'auth-fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) both',
      }}>
        <AuthLogo title="Welcome back" subtitle="Sign in to your campus account" />

        {/* Card */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 24, padding: '2.5rem 2rem',
          boxShadow: `0 16px 60px rgba(0,0,0,0.5), 0 0 40px ${C.accentGlow}`,
          backdropFilter: 'blur(20px)',
        }}>

          {/* Security badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: '1.75rem',
            padding: '0.35rem 0.9rem', borderRadius: 999,
            background: 'rgba(0,136,255,0.06)', border: `1px solid ${C.border}`,
            width: 'fit-content', margin: '0 auto 1.75rem',
          }}>
            <Shield size={12} color={C.accent} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.accent }}>End-to-end encrypted</span>
          </div>

          {requires2FA || requires2FASetup ? (
            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {requires2FASetup && qrCodeUrl && (
                <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ color: C.textDim, marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Setup 2FA by scanning this QR code in Google Authenticator or Authy.
                  </p>
                  <img src={qrCodeUrl} alt="2FA QR Code" style={{
                    borderRadius: 16, margin: '0 auto 0.75rem', padding: 8,
                    background: '#fff', display: 'block',
                  }} />
                  <p style={{ color: C.textMuted, fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{secret}</p>
                </div>
              )}

              {!requires2FASetup && (
                <p style={{ color: C.textDim, textAlign: 'center', marginBottom: '0.25rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Your account is protected by two-factor authentication. Enter the 6-digit code from your authenticator app.
                </p>
              )}

              <InputGroup label="Authentication Code" icon={<Lock size={18} />}>
                <input
                  type="text"
                  placeholder="000000"
                  value={twoFaToken}
                  onChange={(e) => setTwoFaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  style={{
                    ...inputStyle,
                    fontSize: '1.35rem', letterSpacing: '0.3em',
                    textAlign: 'center', fontWeight: 800,
                    paddingLeft: '1rem',
                  }}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
              </InputGroup>

              <button
                type="submit"
                disabled={loading || twoFaToken.length !== 6}
                style={{ ...submitBtnStyle, opacity: loading || twoFaToken.length !== 6 ? 0.5 : 1 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                ) : (
                  <><span>Verify & Sign In</span><ArrowRight size={15} /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setRequires2FA(false); setRequires2FASetup(false); }}
                style={ghostBtnStyle}
                disabled={loading}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.borderDim; e.currentTarget.style.color = C.textDim; }}
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InputGroup label="Email Address" icon={<Mail size={18} />}>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  id="login-email"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
              </InputGroup>

              <InputGroup label="Password" icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  id="login-password"
                  style={inputStyleRight}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  id="toggle-password"
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.accent}
                  onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputGroup>

              <button
                type="submit"
                disabled={loading}
                id="login-submit"
                style={{ ...submitBtnStyle, opacity: loading ? 0.5 : 1 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</>
                ) : (
                  <><span>Sign In</span><ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}

          {!requires2FA && !requires2FASetup && (
            <div style={{
              marginTop: '1.75rem', textAlign: 'center',
              borderTop: `1px solid ${C.borderDim}`, paddingTop: '1.25rem',
            }}>
              <p style={{ color: C.textMuted, fontSize: '0.9rem' }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: C.accent, fontWeight: 700, textDecoration: 'none',
                    marginLeft: 4, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Create one
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/"
            style={{
              color: C.textMuted, fontSize: '0.85rem', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

/* ─── Register Page ────────────────────────────────────────────────────── */
export const RegisterPage: React.FC = () => {
  const { register, persist2FA } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requires2FASetup, setRequires2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [twoFaToken, setTwoFaToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password);
      if (data && data.requires2FASetup) {
        setRequires2FASetup(true);
        setTempToken(data.tempToken);
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        toast.success('Account created! Please setup 2FA.');
      } else {
        toast.success('Account created! Welcome to SafeHands.');
        navigate('/explore', { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaToken.length !== 6) return toast.error('Code must be 6 digits.');
    setLoading(true);
    try {
      const data = await setup2FA(tempToken, twoFaToken);
      
      if (data.trustToken) {
        localStorage.setItem('safehands_trust_token', data.trustToken);
      }

      if (persist2FA) {
        persist2FA(data.token, data.user);
      }
      toast.success('2FA Setup Complete! Welcome to SafeHands.');
      navigate('/explore', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Invalid 2FA code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* Password strength indicator */
  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(form.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#EF4444', '#F59E0B', '#0088FF', '#0077DD'];

  return (
    <AuthLayout>
      <div style={{
        width: '100%', maxWidth: 460, margin: '0 auto', position: 'relative', zIndex: 2,
        animation: 'auth-fadeUp 0.6s cubic-bezier(0.4,0,0.2,1) both',
      }}>
        <AuthLogo title="Create account" subtitle="Join your campus lost & found network" />

        {/* Card */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 24, padding: '2.5rem 2rem',
          boxShadow: `0 16px 60px rgba(0,0,0,0.5), 0 0 40px ${C.accentGlow}`,
          backdropFilter: 'blur(20px)',
        }}>

          {/* Security badge */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginBottom: '1.75rem',
            padding: '0.35rem 0.9rem', borderRadius: 999,
            background: 'rgba(0,136,255,0.06)', border: `1px solid ${C.border}`,
            width: 'fit-content', margin: '0 auto 1.75rem',
          }}>
            <Shield size={12} color={C.accent} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.accent }}>Secure registration</span>
          </div>

          {requires2FASetup ? (
            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                <p style={{ color: C.textDim, marginBottom: '1rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Secure your account by scanning this QR code in Google Authenticator or Authy.
                </p>
                <img src={qrCodeUrl} alt="2FA QR Code" style={{
                  borderRadius: 16, margin: '0 auto 0.75rem', padding: 8,
                  background: '#fff', display: 'block',
                }} />
                <p style={{ color: C.textMuted, fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{secret}</p>
              </div>

              <InputGroup label="Authentication Code" icon={<Lock size={18} />}>
                <input
                  type="text"
                  placeholder="000000"
                  value={twoFaToken}
                  onChange={(e) => setTwoFaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoFocus
                  style={{
                    ...inputStyle,
                    fontSize: '1.35rem', letterSpacing: '0.3em',
                    textAlign: 'center', fontWeight: 800,
                    paddingLeft: '1rem',
                  }}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
              </InputGroup>

              <button
                type="submit"
                disabled={loading || twoFaToken.length !== 6}
                style={{ ...submitBtnStyle, opacity: loading || twoFaToken.length !== 6 ? 0.5 : 1 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                ) : (
                  <><span>Complete Setup</span><ArrowRight size={15} /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InputGroup label="Full Name" icon={<User size={18} />}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  id="register-name"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
              </InputGroup>

              <InputGroup label="College Email" icon={<Mail size={18} />}>
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  id="register-email"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
              </InputGroup>

              <InputGroup label="Password" icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  id="register-password"
                  style={inputStyleRight}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    color: C.textMuted, background: 'none', border: 'none', cursor: 'pointer',
                    padding: 4, display: 'flex', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.accent}
                  onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputGroup>

              {/* Password strength meter */}
              {form.password.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i < strength ? strengthColors[strength - 1] : C.borderDim,
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600,
                    color: strength > 0 ? strengthColors[strength - 1] : C.textMuted,
                    textAlign: 'right',
                  }}>
                    {strength > 0 ? strengthLabels[strength - 1] : 'Enter a password'}
                  </span>
                </div>
              )}

              <InputGroup label="Confirm Password" icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                  id="register-confirm"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.boxShadow = `0 0 0 3px ${C.inputFocus}`; }}
                  onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.boxShadow = 'none'; }}
                />
              </InputGroup>

              <button
                type="submit"
                disabled={loading}
                id="register-submit"
                style={{ ...submitBtnStyle, opacity: loading ? 0.5 : 1 }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              >
                {loading ? (
                  <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</>
                ) : (
                  <><span>Create Account</span><ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}

          {!requires2FASetup && (
            <div style={{
              marginTop: '1.75rem', textAlign: 'center',
              borderTop: `1px solid ${C.borderDim}`, paddingTop: '1.25rem',
            }}>
              <p style={{ color: C.textMuted, fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: C.accent, fontWeight: 700, textDecoration: 'none',
                    marginLeft: 4, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Back to home */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/"
            style={{
              color: C.textMuted, fontSize: '0.85rem', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.accent}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
