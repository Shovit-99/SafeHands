import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, Search, Plus, LogOut, Shield, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--divider)',
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group hover-lift" id="nav-logo">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-3 shadow-lg"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 8px 24px var(--accent-light)',
              }}
            >
              <Package size={20} style={{ color: '#ffffff' }} />
            </div>
            <span
              className="text-xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-family-display)', color: 'var(--text-primary)' }}
            >
              SafeHands
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover-lift ${isActive('/') ? 'glass-card border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)]' : 'bg-transparent border border-transparent text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:border-[var(--divider)] hover:text-[var(--text-primary)]'}`}
              id="nav-browse"
            >
              <Search size={16} />
              Browse
            </Link>
            {isAuthenticated && (
              <Link
                to="/report"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover-lift ${isActive('/report') ? 'glass-card border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)]' : 'bg-transparent border border-transparent text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:border-[var(--divider)] hover:text-[var(--text-primary)]'}`}
                id="nav-report"
              >
                <Plus size={16} />
                Report
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/chat"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover-lift ${isActive('/chat') ? 'glass-card border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)]' : 'bg-transparent border border-transparent text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:border-[var(--divider)] hover:text-[var(--text-primary)]'}`}
                id="nav-chat"
              >
                <MessageCircle size={16} />
                Messages
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover-lift ${isActive('/admin') ? 'glass-card border-[var(--accent-primary)] bg-[var(--accent-light)] text-[var(--accent-primary)]' : 'bg-transparent border border-transparent text-[var(--text-secondary)] hover:bg-[var(--card-bg)] hover:border-[var(--divider)] hover:text-[var(--text-primary)]'}`}
                id="nav-admin"
              >
                <Shield size={16} />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all border border-transparent hover:border-[var(--divider)]"
                  id="nav-profile"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-sm"
                    style={{
                      background: 'var(--accent-gradient)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-family-display)',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-bold text-[var(--text-primary)] max-w-[120px] truncate" style={{ fontFamily: 'var(--font-family-display)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-xl text-[var(--text-secondary)] hover:text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10 hover:shadow-sm"
                  title="Sign out"
                  id="nav-logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2.5 rounded-xl font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all" id="nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary hover-lift" id="nav-register">
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
