import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
        background: 'radial-gradient(circle, rgba(0,212,184,0.06) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(95,240,222,0.04) 0%, transparent 70%)',
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
          background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)',
          boxShadow: '0 0 24px rgba(0, 212, 184, 0.35)',
        }}
      >
        <Package size={20} style={{ color: '#06080c' }} />
      </div>
      <span
        className="text-2xl font-bold gradient-text"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        LostHub
      </span>
    </div>
    <h1
      className="text-3xl font-bold text-white mb-2"
      style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}
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
  <div>
    <label
      className="block text-sm font-medium mb-2"
      style={{ color: '#94a3b8' }}
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }}>
        {icon}
      </div>
      {children}
    </div>
  </div>
);

// ─── Login Page ───────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Login failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthLogo title="Welcome back" subtitle="Sign in to your campus account" />

        <div
          className="glass-card p-8"
          style={{ border: '1px solid rgba(0,212,184,0.1)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputGroup label="Email Address" icon={<Mail size={15} />}>
              <input
                type="email"
                className="input-field pl-10"
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                id="login-email"
              />
            </InputGroup>

            <InputGroup label="Password" icon={<Lock size={15} />}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#4b5563' }}
                id="toggle-password"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </InputGroup>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2"
              id="login-submit"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                <><span>Sign In</span><ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#475569' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#00d4b8' }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

// ─── Register Page ────────────────────────────────────────────────────────────
export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

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
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to LostHub.');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <AuthLogo title="Create account" subtitle="Join your campus lost & found network" />

        <div
          className="glass-card p-8"
          style={{ border: '1px solid rgba(0,212,184,0.1)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputGroup label="Full Name" icon={<User size={15} />}>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
                id="register-name"
              />
            </InputGroup>

            <InputGroup label="College Email" icon={<Mail size={15} />}>
              <input
                type="email"
                className="input-field pl-10"
                placeholder="you@college.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                id="register-email"
              />
            </InputGroup>

            <InputGroup label="Password" icon={<Lock size={15} />}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
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
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: '#4b5563' }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </InputGroup>

            <InputGroup label="Confirm Password" icon={<Lock size={15} />}>
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pl-10"
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
              className="btn-primary w-full py-3 mt-2"
              id="register-submit"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating account...</>
              ) : (
                <><span>Create Account</span><ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#475569' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold transition-colors"
              style={{ color: '#00d4b8' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
