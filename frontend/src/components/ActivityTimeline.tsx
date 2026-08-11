import React, { useState, useEffect } from 'react';
import { MessageSquare, Bell as BellIcon, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/axios';

interface Notification {
  _id: string;
  type: 'message' | 'system' | 'alert';
  title: string;
  message: string;
  createdAt: string;
}

const getIconConfig = (type: Notification['type']) => {
  switch (type) {
    case 'message':
      return { icon: MessageSquare, bg: 'rgba(0, 136, 255, 0.15)', color: '#0088FF' };
    case 'alert':
      return { icon: AlertTriangle, bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
    case 'system':
    default:
      return { icon: BellIcon, bg: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' };
  }
};

const ActivityTimeline: React.FC = () => {
  const [activities, setActivities] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        // Assume data is an array of notifications
        const data = res.data.data || res.data;
        setActivities(data.slice(0, 5)); // show latest 5
      })
      .catch((err) => console.error('Failed to load activities', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
      }}>
        Activity Timeline
      </h3>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <Loader2 className="animate-spin text-tertiary" size={24} />
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>
          <p style={{ fontSize: '0.875rem' }}>No recent activity</p>
        </div>
      ) : (
        <div>
          {activities.map((activity, index) => {
            const config = getIconConfig(activity.type);
            const Icon = config.icon;

            return (
              <div
                key={activity._id}
                className="timeline-item animate-fadeInUp"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div
                  className="timeline-dot"
                  style={{ background: config.bg }}
                >
                  <Icon size={16} style={{ color: config.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.125rem',
                  }}>
                    {activity.title}
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.4,
                  }}>
                    {activity.message}
                  </p>
                  <p style={{
                    fontSize: '0.6875rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.25rem',
                  }}>
                    {new Date(activity.createdAt).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
