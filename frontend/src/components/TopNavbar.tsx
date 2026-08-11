import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const TopNavbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <header className="topnav" id="topnav">
      {/* Greeting */}
      <div style={{ flex: '0 0 auto', minWidth: 0 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, lineHeight: 1.3 }}>
          {getGreeting()},
        </p>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
        }}>
          {isAuthenticated ? `${firstName} 👋` : 'Welcome 👋'}
        </h2>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div className="search-bar" style={{ display: 'none' }} id="topnav-search">
        {/* Hidden on smaller screens, shown on large */}
      </div>
      <div className="search-bar" style={{
        flex: '0 1 400px',
      }} id="topnav-search-desktop">
        <Search size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Campus Search..."
          id="topnav-search-input"
        />
        <kbd style={{
          fontSize: '0.625rem',
          fontWeight: 600,
          padding: '0.125rem 0.375rem',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--text-tertiary)',
          border: '1px solid var(--border-subtle)',
          whiteSpace: 'nowrap',
        }}>
          ⌘K
        </kbd>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {/* Messages */}
        {isAuthenticated && (
          <Link to="/chat" className="btn-icon" title="Messages" id="topnav-messages">
            <MessageCircle size={20} />
          </Link>
        )}

        {/* Profile Avatar */}
        {isAuthenticated && user && (
          <Link
            to="/profile"
            className="avatar avatar-md"
            style={{
              marginLeft: '0.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 136, 255, 0.2)',
            }}
            title={user.name}
            id="topnav-profile"
          >
            {initials}
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopNavbar;
