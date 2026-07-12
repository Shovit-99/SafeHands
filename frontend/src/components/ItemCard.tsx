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
      <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={32} className="text-slate-600" />
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={STATUS_CLASSES[item.status]}>{item.status}</span>
        </div>

        {/* Image count */}
        {item.images?.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            +{item.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1">
            {item.title}
          </h3>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
            {item.category}
          </span>
        </div>

        <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin size={11} />
            <span className="truncate max-w-[120px]">{item.locationName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
