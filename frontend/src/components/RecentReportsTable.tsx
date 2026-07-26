import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Eye, Pencil, Trash2, Tag, ImageIcon } from 'lucide-react';
import type { Item, ItemStatus } from '../types';

interface RecentReportsTableProps {
  items: Item[];
  onStatusChange?: (id: string, status: ItemStatus) => void;
  onDelete?: (item: Item) => void;
  loading?: boolean;
}

const STATUS_BADGE: Record<ItemStatus, string> = {
  Lost: 'badge badge-lost',
  Found: 'badge badge-found',
  Claimed: 'badge badge-claimed',
};

const RecentReportsTable: React.FC<RecentReportsTableProps> = ({
  items,
  onStatusChange,
  onDelete,
  loading,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.25rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Recent Reports</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 56,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.03)',
                animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Recent Reports
        </h3>
        <button
          className="btn-ghost"
          onClick={() => navigate('/')}
          style={{ fontSize: '0.75rem' }}
        >
          View All
        </button>
      </div>

      {/* Desktop table */}
      <div style={{ overflowX: 'auto' }} className="hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 52 }}></th>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ width: 120, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item._id}
                style={{
                  cursor: 'pointer',
                  animation: `fadeInUp 0.4s ease ${index * 0.05}s both`,
                }}
                onClick={() => navigate(`/items/${item._id}`)}
              >
                <td>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <ImageIcon size={16} style={{ color: 'var(--text-tertiary)' }} />
                    )}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.title}
                </td>
                <td>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-secondary)',
                  }}>
                    {item.category}
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MapPin size={12} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="truncate" style={{ maxWidth: 120 }}>
                      {item.locationName}
                    </span>
                  </span>
                </td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </td>
                <td>
                  <span className={STATUS_BADGE[item.status]}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      justifyContent: 'flex-end',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn-icon"
                      style={{ width: 32, height: 32 }}
                      title="View"
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      <Eye size={14} />
                    </button>
                    {onStatusChange && (
                      <button
                        className="btn-icon"
                        style={{ width: 32, height: 32 }}
                        title="Edit Status"
                        onClick={() => {
                          const next: ItemStatus = item.status === 'Lost' ? 'Found' : item.status === 'Found' ? 'Claimed' : 'Lost';
                          onStatusChange(item._id, next);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn-icon"
                        style={{ width: 32, height: 32, color: 'var(--color-danger)' }}
                        title="Delete"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden" style={{ padding: '0.75rem' }}>
        {items.map((item, index) => (
          <div
            key={item._id}
            className="card-interactive"
            style={{
              padding: '1rem',
              marginBottom: '0.5rem',
              animation: `fadeInUp 0.4s ease ${index * 0.05}s both`,
            }}
            onClick={() => navigate(`/items/${item._id}`)}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.images?.[0] ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <Tag size={20} style={{ color: 'var(--text-tertiary)' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 className="truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</h4>
                  <span className={STATUS_BADGE[item.status]} style={{ flexShrink: 0 }}>{item.status}</span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '0.375rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={11} /> {item.locationName}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={11} /> {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && !loading && (
        <div className="empty-state" style={{ padding: '2rem' }}>
          <div className="empty-state-icon">
            <Tag size={32} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>No reports yet</h4>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Lost or found something? Report it now.
          </p>
          <button className="btn-primary" onClick={() => navigate('/report')}>
            Report your first item
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentReportsTable;
