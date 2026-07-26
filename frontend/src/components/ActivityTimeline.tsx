import React from 'react';
import { FileText, GitMerge, Bell as BellIcon, CheckCircle2 } from 'lucide-react';

interface TimelineEvent {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}

const MOCK_EVENTS: TimelineEvent[] = [
  {
    id: '1',
    icon: FileText,
    iconBg: 'rgba(124, 58, 237, 0.15)',
    iconColor: '#7C3AED',
    title: 'New item reported',
    description: 'You reported a lost wallet near the library',
    time: '2 hours ago',
  },
  {
    id: '2',
    icon: GitMerge,
    iconBg: 'rgba(236, 72, 153, 0.15)',
    iconColor: '#EC4899',
    title: 'Potential match found',
    description: 'A found wallet matches your description',
    time: '1 hour ago',
  },
  {
    id: '3',
    icon: BellIcon,
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#3B82F6',
    title: 'Owner notified',
    description: 'The item owner has been notified via message',
    time: '45 min ago',
  },
  {
    id: '4',
    icon: CheckCircle2,
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#22C55E',
    title: 'Item claimed',
    description: 'Wallet successfully returned to owner',
    time: '30 min ago',
  },
];

const ActivityTimeline: React.FC = () => {
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

      <div>
        {MOCK_EVENTS.map((event, index) => (
          <div
            key={event.id}
            className="timeline-item animate-fadeInUp"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div
              className="timeline-dot"
              style={{ background: event.iconBg }}
            >
              <event.icon size={16} style={{ color: event.iconColor }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.125rem',
              }}>
                {event.title}
              </p>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                lineHeight: 1.4,
              }}>
                {event.description}
              </p>
              <p style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
              }}>
                {event.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
