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
      className="item-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden" style={{ background: 'rgba(11,15,23,0.8)' }}>
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-400"
            style={{ transition: 'transform 0.4s ease' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={32} style={{ color: '#1a2235' }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(6,8,12,0.7) 0%, transparent 50%)',
          }}
        />

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={STATUS_CLASSES[item.status]}>{item.status}</span>
        </div>

        {/* Image count */}
        {item.images?.length > 1 && (
          <div
            className="absolute top-3 right-3 text-white text-xs px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(6,8,12,0.7)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            +{item.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {item.title}
          </h3>
          <span
            className="text-xs flex-shrink-0 px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: 'rgba(0,212,184,0.07)',
              color: '#5ff0de',
              border: '1px solid rgba(0,212,184,0.13)',
              fontSize: '0.7rem',
            }}
          >
            {item.category}
          </span>
        </div>

        <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: '#64748b' }}>
          {item.description}
        </p>

        <div className="flex items-center justify-between" style={{ fontSize: '0.72rem', color: '#475569' }}>
          <div className="flex items-center gap-1">
            <MapPin size={10} />
            <span className="truncate max-w-[110px]">{item.locationName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
