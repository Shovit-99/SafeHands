import React from 'react';
import type { Item } from '../types';
import { MapPin, Clock, Tag } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
}

const STATUS_CLASSES: Record<Item['status'], string> = {
  Lost: 'badge badge-lost',
  Found: 'badge badge-found',
  Claimed: 'badge badge-claimed',
};

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div
      className="card-interactive group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{ overflow: 'hidden' }}
    >
      {/* Image */}
      <div
        style={{
          aspectRatio: '4/3',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}
      >
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
            }}
            loading="lazy"
            onMouseEnter={(e) => {
              (e.target as HTMLImageElement).style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLImageElement).style.transform = 'scale(1)';
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Tag size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
            opacity: 0.7,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Status badge */}
        <div style={{ position: 'absolute', top: 12, left: 12 }}>
          <span
            className={STATUS_CLASSES[item.status]}
            style={{
              backdropFilter: 'blur(8px)',
              fontSize: '0.6875rem',
              fontWeight: 700,
            }}
          >
            {item.status}
          </span>
        </div>

        {/* Image count */}
        {item.images?.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.125rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            +{item.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <h3
            className="line-clamp-1"
            style={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            {item.title}
          </h3>
          <span
            style={{
              fontSize: '0.6875rem',
              flexShrink: 0,
              padding: '0.125rem 0.5rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-light)',
              color: 'var(--accent-purple)',
              fontWeight: 600,
            }}
          >
            {item.category}
          </span>
        </div>

        <p
          className="line-clamp-2"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-tertiary)',
            marginBottom: '0.75rem',
            lineHeight: 1.5,
          }}
        >
          {item.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={12} style={{ color: 'var(--accent-purple)' }} />
            <span className="truncate" style={{ maxWidth: 110 }}>{item.locationName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={12} style={{ color: 'var(--accent-purple)' }} />
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
