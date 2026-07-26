import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, PlusCircle, MessageCircle, Bell,
  BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/profile', requireAuth: true },
  { icon: Search, label: 'Browse Items', path: '/' },
  { icon: PlusCircle, label: 'Report Item', path: '/report', requireAuth: true },
  { icon: MessageCircle, label: 'Messages', path: '/chat', requireAuth: true },
  { icon: BarChart3, label: 'Analytics', path: '/admin', requireAdmin: true },
  { icon: Settings, label: 'Settings', path: '/settings', requireAuth: true },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const filteredItems = NAV_ITEMS.filter(item => {
    if (item.requireAdmin && !isAdmin) return false;
    if (item.requireAuth && !isAuthenticated) return false;
    return true;
  });

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  // Mobile bottom navigation
  if (isMobile) {
    const mobileItems = filteredItems.filter(item => !item.path.startsWith('#')).slice(0, 5);
    return (
      <nav className="bottom-nav" id="bottom-nav">
        {mobileItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
      id="sidebar"
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          }}
        >
          <Package size={18} color="#fff" />
        </div>
        {!collapsed && (
          <span
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary)',
            }}
          >
            LostHub
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '0 0.75rem' }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
        {filteredItems.map((item) => {
          const active = isActive(item.path);
          const isPlaceholder = item.path.startsWith('#');

          if (isPlaceholder) {
            return (
              <button
                key={item.path}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                style={{ cursor: 'default', opacity: 0.5 }}
                disabled
              >
                <span className="sidebar-nav-icon">
                  <item.icon size={20} />
                </span>
                <span className="sidebar-nav-label">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-nav-icon">
                <item.icon size={20} />
              </span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
        {/* Profile */}
        {isAuthenticated && user && (
          <Link
            to="/profile"
            className="sidebar-nav-item"
            title={collapsed ? user.name : undefined}
            style={{ marginBottom: '0.25rem' }}
          >
            <div className="avatar avatar-sm" style={{ flexShrink: 0 }}>
              {initials}
            </div>
            <span className="sidebar-nav-label" style={{ fontWeight: 600 }}>
              {user.name.split(' ')[0]}
            </span>
          </Link>
        )}

        {/* Logout */}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="sidebar-nav-item"
            title={collapsed ? 'Sign out' : undefined}
            style={{ color: 'var(--text-tertiary)' }}
            id="sidebar-logout"
          >
            <span className="sidebar-nav-icon">
              <LogOut size={20} />
            </span>
            <span className="sidebar-nav-label">Sign Out</span>
          </button>
        )}

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="sidebar-nav-item"
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
          id="sidebar-toggle"
        >
          <span className="sidebar-nav-icon">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </span>
          <span className="sidebar-nav-label">Collapse</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
