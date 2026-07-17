import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, Plus, LogOut, User, Shield, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(6, 8, 12, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 212, 184, 0.08)',
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)',
                boxShadow: '0 0 16px rgba(0, 212, 184, 0.3)',
              }}
            >
              <Package size={15} style={{ color: '#06080c' }} />
            </div>
            <span
              className="text-lg font-bold gradient-text"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              LostHub
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-all hover:bg-white/5"
              id="nav-browse"
            >
              <Search size={13} />
              Browse
            </Link>
            {isAuthenticated && (
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-all hover:bg-white/5"
                id="nav-report"
              >
                <Plus size={13} />
                Report Item
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/chat"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-slate-400 hover:text-white text-sm font-medium transition-all hover:bg-white/5"
                id="nav-chat"
              >
                <MessageCircle size={13} />
                Messages
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{ color: '#00d4b8' }}
                id="nav-admin"
              >
                <Shield size={13} />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all"
                  id="nav-profile"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)',
                      color: '#06080c',
                      fontFamily: 'Space Grotesk, sans-serif',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-slate-500 hover:text-red-400 transition-all hover:bg-red-500/10"
                  title="Sign out"
                  id="nav-logout"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm px-4 py-2" id="nav-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2" id="nav-register">
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
