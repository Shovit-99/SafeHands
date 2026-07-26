import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowLeft, MessageCircle, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import type { Item } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES: Record<Item['status'], { bg: string; color: string; border: string }> = {
  Lost: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' },
  Found: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' },
  Claimed: { bg: 'rgba(124, 58, 237, 0.1)', color: '#A78BFA', border: 'rgba(124, 58, 237, 0.2)' },
};

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    api.get(`/items/${id}`)
      .then(({ data }) => setItem(data.item))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!item) return null;

  const images = item.images?.length ? item.images : [];
  const isOwner = user?.id === item.reporterId?._id;
  const statusStyle = STATUS_STYLES[item.status];

  return (
    <div className="animate-fadeInUp" style={{ padding: '2rem 0', maxWidth: 1080, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-ghost"
        style={{ marginBottom: '2rem', padding: '0.5rem 1rem', display: 'inline-flex' }}
        id="back-btn"
      >
        <ArrowLeft size={16} />
        Back to items
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
      }}>
        {/* Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            className="card"
            style={{
              aspectRatio: '4/3',
              overflow: 'hidden',
              position: 'relative',
              padding: 0,
            }}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[imgIndex]}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => Math.max(i - 1, 0))}
                      disabled={imgIndex === 0}
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        border: 'none',
                        cursor: imgIndex === 0 ? 'not-allowed' : 'pointer',
                        opacity: imgIndex === 0 ? 0.3 : 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { if (imgIndex !== 0) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.8)'; }}
                      onMouseLeave={(e) => { if (imgIndex !== 0) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.6)'; }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => Math.min(i + 1, images.length - 1))}
                      disabled={imgIndex === images.length - 1}
                      style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: '0.5rem',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        border: 'none',
                        cursor: imgIndex === images.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: imgIndex === images.length - 1 ? 0.3 : 1,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => { if (imgIndex !== images.length - 1) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.8)'; }}
                      onMouseLeave={(e) => { if (imgIndex !== images.length - 1) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.6)'; }}
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '0.375rem',
                      padding: '0.375rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(8px)',
                    }}>
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          style={{
                            width: i === imgIndex ? 20 : 6,
                            height: 6,
                            borderRadius: 'var(--radius-full)',
                            background: i === imgIndex ? 'var(--accent-purple)' : 'rgba(255,255,255,0.4)',
                            border: 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Tag size={64} style={{ color: 'var(--text-tertiary)', opacity: 0.3 }} />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="custom-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  style={{
                    flexShrink: 0,
                    width: 72,
                    height: 72,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: i === imgIndex ? '2px solid var(--accent-purple)' : '2px solid transparent',
                    opacity: i === imgIndex ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    background: 'var(--bg-card)',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                }}
              >
                {item.status}
              </span>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {item.category}
              </span>
            </div>
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                fontWeight: 800,
                marginBottom: '1rem',
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {item.title}
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              fontSize: '1rem',
              fontWeight: 500,
            }}>
              {item.description}
            </p>
          </div>

          {/* Meta Card */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { icon: <MapPin size={18} style={{ color: 'var(--accent-purple)' }} />, label: 'Location', value: item.locationName },
              {
                icon: <Clock size={18} style={{ color: 'var(--accent-purple)' }} />,
                label: 'Reported',
                value: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              },
              {
                icon: <User size={18} style={{ color: 'var(--accent-purple)' }} />,
                label: 'Reported by',
                value: isOwner ? 'You' : item.reporterId?.name || 'Anonymous',
              },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: 'var(--accent-light)',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.125rem', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => navigate(`/chat?with=${item.reporterId._id}&peerName=${encodeURIComponent(item.reporterId.name)}&item=${item._id}`)}
              className="btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
              id="contact-btn"
            >
              <MessageCircle size={20} />
              Contact Reporter
            </button>
          )}

          {isOwner && (
            <div
              style={{
                padding: '1.25rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(124, 58, 237, 0.08)',
                border: '1px dashed rgba(124, 58, 237, 0.3)',
              }}
            >
              <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                This is your report. Manage it from your{' '}
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    color: 'var(--accent-purple)',
                    fontWeight: 800,
                    textDecoration: 'underline',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  profile
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
