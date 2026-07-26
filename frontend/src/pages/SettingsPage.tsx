import React, { useState } from 'react';
import { User, Lock, Save, Loader2, ShieldCheck, ShieldAlert, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { updateProfile, updatePassword } from '../api/settings';
import { generate2FA, verify2FA } from '../api/auth';

const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  const [is2FAEnabled] = useState(true); // 2FA is now mandatory

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty.');
    
    setProfileLoading(true);
    try {
      const updatedUser = await updateProfile(name);
      
      // Update local storage and context
      updateUser(updatedUser); 
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters.');
    }

    setSecurityLoading(true);
    try {
      const msg = await updatePassword(currentPassword, newPassword);
      toast.success(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update password.';
      toast.error(msg);
    } finally {
      setSecurityLoading(false);
    }
  };



  return (
    <div className="flex-1 page-container py-10 animate-fadeInUp">
      <div className="mb-10">
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
          }}
        >
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your account settings and preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Profile Details Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <User size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Profile Details
            </h2>
          </div>

          <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                title="Email cannot be changed"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                Your email address is used for login and cannot be changed.
              </p>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={profileLoading}
              style={{ padding: '0.875rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              {profileLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Profile
            </button>
          </form>
        </div>

        {/* Security Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22C55E',
              }}
            >
              <Lock size={20} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Security
            </h2>
          </div>

          <form onSubmit={handleSecurityUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Current Password
              </label>
              <input
                type="password"
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={securityLoading}
              style={{
                padding: '0.875rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                background: 'rgba(34, 197, 94, 0.1)',
                color: '#22C55E',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                boxShadow: 'none',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.background = 'rgba(34, 197, 94, 0.2)';
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.background = 'rgba(34, 197, 94, 0.1)';
              }}
            >
              {securityLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
              Update Password
            </button>
          </form>
        </div>

        {/* 2FA Card */}
        <div className="card" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: is2FAEnabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: is2FAEnabled ? '#22C55E' : '#EF4444',
              }}
            >
              {is2FAEnabled ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Two-Factor Authentication (2FA)
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                Add an extra layer of security to your account.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <ShieldCheck size={24} color="#22C55E" />
            <div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>2FA is active</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your account is protected by mandatory two-factor authentication.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
