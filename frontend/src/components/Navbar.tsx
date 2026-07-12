import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, Plus, LogOut, User, Shield, Bell } from 'lucide-react';
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
      className="sticky top-0 z-50 border-b border-white/[0.07]"
      style={{ background: 'rgba(13, 17, 23, 0.85)', backdropFilter: 'blur(16px)' }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <Package size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">LostHub</span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
              id="nav-browse"
            >
              <Search size={14} />
              Browse
            </Link>
            {isAuthenticated && (
              <Link
                to="/report"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
                id="nav-report"
              >
                <Plus size={14} />
                Report Item
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 text-sm font-medium transition-all"
                id="nav-admin"
              >
                <Shield size={14} />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  id="nav-notifications"
                >
                  <Bell size={18} />
                </button>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
                  id="nav-profile"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-300 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Sign out"
                  id="nav-logout"
                >
                  <LogOut size={16} />
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
