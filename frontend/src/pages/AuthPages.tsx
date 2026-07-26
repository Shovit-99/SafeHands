import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login2FA, setup2FA } from '../api/auth';
import toast from 'react-hot-toast';

// ─── Shared Auth Layout ───────────────────────────────────────────────────────
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center px-4 py-12">
    <div className="auth-bg" />
    {/* Decorative teal circle */}
    <div
      style={{
        position: 'fixed',
        top: '-10%',
        right: '-5%',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />
    <div
      style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-5%',
        width: '360px',
        height: '360px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}
    />
    {children}
  </div>
);

// ─── Logo Block ───────────────────────────────────────────────────────────────
const AuthLogo: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center gap-2.5 mb-5">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{
          background: 'var(--accent-gradient)',
          boxShadow: '0 0 24px rgba(124, 58, 237, 0.35)',
        }}
      >
        <Package size={20} style={{ color: '#ffffff' }} />
      </div>
      <span
        className="text-2xl font-bold gradient-text"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        LostHub
      </span>
    </div>
    <h1
      className="text-3xl font-bold text-white mb-2"
      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}
    >
      {title}
    </h1>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{subtitle}</p>
  </div>
);

// ─── Input Group ──────────────────────────────────────────────────────────────
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, icon, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label
      className="block font-medium"
      style={{ color: '#cbd5e1', fontSize: '0.9rem', paddingLeft: '0.25rem' }}
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
        {icon}
      </div>
      {children}
    </div>
  </div>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { login, persist2FA } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

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
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        <AuthLogo title="Welcome back" subtitle="Sign in to your campus account" />

        <div
          className="glass-card"
          style={{ border: '1px solid rgba(124,58,237,0.1)', padding: '2.5rem 2rem' }}
        >
          {requires2FA || requires2FASetup ? (
            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeInUp">
              {requires2FASetup && qrCodeUrl && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                    Setup 2FA by scanning this QR code in Google Authenticator or Authy.
                  </p>
                  <img src={qrCodeUrl} alt="2FA QR Code" style={{ borderRadius: '12px', margin: '0 auto 1rem', padding: '0.5rem', background: '#fff' }} />
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{secret}</p>
                </div>
              )}
              
              {!requires2FASetup && (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                  Your account is protected by two-factor authentication. Please enter the 6-digit code from your authenticator app.
                </p>
              )}
              
              <InputGroup label="Authentication Code" icon={<Lock size={18} />}>
                <input
                  type="text"
                  className="input-field input-with-icon-left"
                  placeholder="000000"
                  value={twoFaToken}
                  onChange={(e) => setTwoFaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  style={{ fontSize: '1.25rem', letterSpacing: '0.25em', textAlign: 'center', fontWeight: 700 }}
                  autoFocus
                />
              </InputGroup>
              <button
                type="submit"
                disabled={loading || twoFaToken.length !== 6}
                className="btn-primary w-full"
                style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                ) : (
                  <><span>Verify & Sign In</span><ArrowRight size={15} /></>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setRequires2FASetup(false);
                }}
                className="btn-ghost w-full py-2 mt-2"
                disabled={loading}
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <InputGroup label="Email Address" icon={<Mail size={18} />}>
                <input
                  type="email"
                  className="input-field input-with-icon-left"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  id="login-email"
                />
              </InputGroup>

              <InputGroup label="Password" icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field input-with-icon-left input-with-icon-right"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#94a3b8' }}
                  id="toggle-password"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputGroup>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                id="login-submit"
                style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                ) : (
                  <><span>Sign In</span><ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}

          {!requires2FA && !requires2FASetup && (
            <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold transition-colors hover-lift"
                  style={{ color: '#a78bfa', marginLeft: '0.25rem' }}
                >
                  Create one
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

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
        toast.success('Account created! Welcome to LostHub.');
        navigate('/', { replace: true });
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
      if (persist2FA) {
        persist2FA(data.token, data.user);
      }
      toast.success('2FA Setup Complete! Welcome to LostHub.');
      navigate('/', { replace: true });
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
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
        <AuthLogo title="Create account" subtitle="Join your campus lost & found network" />

        <div
          className="glass-card"
          style={{ border: '1px solid rgba(124,58,237,0.1)', padding: '2.5rem 2rem' }}
        >
          {requires2FASetup ? (
            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fadeInUp">
              <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
                  Secure your account by scanning this QR code in Google Authenticator or Authy.
                </p>
                <img src={qrCodeUrl} alt="2FA QR Code" style={{ borderRadius: '12px', margin: '0 auto 1rem', padding: '0.5rem', background: '#fff' }} />
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{secret}</p>
              </div>
              
              <InputGroup label="Authentication Code" icon={<Lock size={18} />}>
                <input
                  type="text"
                  className="input-field input-with-icon-left"
                  placeholder="000000"
                  value={twoFaToken}
                  onChange={(e) => setTwoFaToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  style={{ fontSize: '1.25rem', letterSpacing: '0.25em', textAlign: 'center', fontWeight: 700 }}
                  autoFocus
                />
              </InputGroup>
              <button
                type="submit"
                disabled={loading || twoFaToken.length !== 6}
                className="btn-primary w-full"
                style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                ) : (
                  <><span>Complete Setup</span><ArrowRight size={15} /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <InputGroup label="Full Name" icon={<User size={18} />}>
                <input
                  type="text"
                  className="input-field input-with-icon-left"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  id="register-name"
                />
              </InputGroup>

              <InputGroup label="College Email" icon={<Mail size={18} />}>
                <input
                  type="email"
                  className="input-field input-with-icon-left"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  id="register-email"
                />
              </InputGroup>

              <InputGroup label="Password" icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field input-with-icon-left input-with-icon-right"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  id="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#94a3b8' }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </InputGroup>

              <InputGroup label="Confirm Password" icon={<Lock size={18} />}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field input-with-icon-left"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                  id="register-confirm"
                />
              </InputGroup>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                id="register-submit"
                style={{ padding: '1rem', marginTop: '0.5rem', fontSize: '1rem' }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                ) : (
                  <><span>Create Account</span><ArrowRight size={15} /></>
                )}
              </button>
            </form>
          )}

          {!requires2FASetup && (
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold transition-colors hover-lift"
                style={{ color: '#a78bfa', marginLeft: '0.25rem' }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
