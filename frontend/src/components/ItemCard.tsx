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
      className="item-card group glass-card hover-lift"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      style={{
        borderRadius: '1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'var(--bg-color)' }}>
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <Tag size={40} style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-60 transition-opacity group-hover:opacity-40"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
          }}
        />

        {/* Status badge overlay */}
        <div className="absolute top-4 left-4">
          <span className={STATUS_CLASSES[item.status]} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 800, backdropFilter: 'blur(8px)' }}>
            {item.status}
          </span>
        </div>

        {/* Image count */}
        {item.images?.length > 1 && (
          <div
            className="absolute top-4 right-4 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-sm"
            style={{
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            +{item.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-1" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--text-primary)' }}>
            {item.title}
          </h3>
          <span
            className="text-xs flex-shrink-0 px-2.5 py-1 rounded-full whitespace-nowrap font-bold"
            style={{
              background: 'var(--accent-light)',
              color: 'var(--accent-primary)',
            }}
          >
            {item.category}
          </span>
        </div>

        <p className="text-sm line-clamp-2 mb-4 leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderColor: 'var(--divider)', fontWeight: 600 }}>
          <div className="flex items-center gap-1.5">
            <MapPin size={14} style={{ color: 'var(--accent-primary)' }} />
            <span className="truncate max-w-[120px]">{item.locationName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
