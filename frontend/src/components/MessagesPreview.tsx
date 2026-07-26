import React from 'react';
import { Link } from 'react-router-dom';

interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Aarav Mehta',
    initials: 'AM',
    lastMessage: 'Hey, I think I found your wallet!',
    time: '5m ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Priya Singh',
    initials: 'PS',
    lastMessage: 'Can you describe the bag color?',
    time: '1h ago',
    unread: 0,
    online: true,
  },
  {
    id: '3',
    name: 'Rohan Das',
    initials: 'RD',
    lastMessage: 'Thanks for returning my keys!',
    time: '3h ago',
    unread: 0,
    online: false,
  },
];

const MessagesPreview: React.FC = () => {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Messages
        </h3>
        <Link
          to="/chat"
          className="btn-ghost"
          style={{ fontSize: '0.75rem', textDecoration: 'none' }}
        >
          View All
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        {MOCK_CONVERSATIONS.map((conv, index) => (
          <Link
            key={conv.id}
            to="/chat"
            className="animate-fadeInUp"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'background 0.2s ease',
              animationDelay: `${index * 0.05}s`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {/* Avatar with online dot */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="avatar avatar-sm">
                {conv.initials}
              </div>
              {conv.online && (
                <div
                  className="online-dot"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    right: -1,
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: conv.unread > 0 ? 700 : 500,
                  color: 'var(--text-primary)',
                }}>
                  {conv.name}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {conv.time}
                </span>
              </div>
              <p
                className="truncate"
                style={{
                  fontSize: '0.75rem',
                  color: conv.unread > 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                  marginTop: '0.125rem',
                }}
              >
                {conv.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                color: '#fff',
                fontSize: '0.625rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {conv.unread}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MessagesPreview;
