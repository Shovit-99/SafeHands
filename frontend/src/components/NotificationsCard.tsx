import React from 'react';
import { MessageCircle, Info, Bell, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { markNotificationAsRead } from '../api/notifications';
import type { AppNotification } from '../api/notifications';

const NotificationsCard: React.FC = () => {
  const { notifications, unreadCount, setNotifications } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle size={16} color="#3B82F6" />;
      case 'alert': return <Bell size={16} color="#EF4444" />;
      default: return <Info size={16} color="#22C55E" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'message': return 'rgba(59, 130, 246, 0.12)';
      case 'alert': return 'rgba(239, 68, 68, 0.12)';
      default: return 'rgba(34, 197, 94, 0.12)';
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem' }} id="notifications">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Notifications
        </h3>
        {unreadCount > 0 && (
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '0.125rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent-light)',
            color: 'var(--accent-purple)',
          }}>
            {unreadCount} new
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            You're all caught up!
          </div>
        ) : (
          notifications.map((notif, index) => (
            <div
              key={notif._id}
              className="animate-fadeInUp"
              onClick={() => handleNotificationClick(notif)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.625rem 0.5rem',
                borderRadius: 'var(--radius-md)',
                background: notif.read ? 'transparent' : 'rgba(124, 58, 237, 0.04)',
                transition: 'background 0.2s ease',
                cursor: 'pointer',
                animationDelay: `${index * 0.05}s`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = notif.read
                  ? 'transparent'
                  : 'rgba(124, 58, 237, 0.04)';
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: getIconBg(notif.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getIcon(notif.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <p style={{
                    fontSize: '0.8125rem',
                    fontWeight: notif.read ? 500 : 600,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                  }}>
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-purple)',
                      flexShrink: 0,
                      marginTop: 5,
                    }} />
                  )}
                </div>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  marginTop: '0.125rem',
                  lineHeight: 1.4,
                }}>
                  {notif.message}
                </p>
                <p style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                }}>
                  {new Date(notif.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsCard;
