import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';

interface ConversationData {
  chatId: string;
  peerId: string;
  peerName: string;
  lastMessage: {
    messageText: string;
    createdAt: string;
  };
  unreadCount: number;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
};

const MessagesPreview: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages/conversations')
      .then((res) => {
        setConversations(res.data.data || []);
      })
      .catch((err) => console.error('Failed to load conversations', err))
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <Loader2 className="animate-spin text-tertiary" size={24} />
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: '0.875rem' }}>No messages yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {conversations.slice(0, 3).map((conv, index) => (
            <Link
              key={conv.chatId}
              to={`/chat/${conv.chatId}`}
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
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className="avatar avatar-sm">
                  {getInitials(conv.peerName)}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.8125rem',
                    fontWeight: conv.unreadCount > 0 ? 700 : 500,
                    color: 'var(--text-primary)',
                  }}>
                    {conv.peerName}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {new Date(conv.lastMessage?.createdAt || Date.now()).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                <p
                  className="truncate"
                  style={{
                    fontSize: '0.75rem',
                    color: conv.unreadCount > 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    marginTop: '0.125rem',
                  }}
                >
                  {conv.lastMessage?.messageText || ''}
                </p>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
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
                  {conv.unreadCount}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPreview;
