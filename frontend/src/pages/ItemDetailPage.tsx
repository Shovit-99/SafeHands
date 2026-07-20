import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowLeft, MessageCircle, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import type { Item } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES: Record<Item['status'], { bg: string; color: string; border: string }> = {
  Lost: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.22)' },
  Found: { bg: 'var(--accent-light)', color: 'var(--accent-primary)', border: 'var(--accent-primary)' },
  Claimed: { bg: 'rgba(184,169,255,0.1)', color: '#8b5cf6', border: 'rgba(184,169,255,0.22)' },
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
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  if (!item) return null;

  const images = item.images?.length ? item.images : [];
  const isOwner = user?.id === item.reporterId?._id;
  const statusStyle = STATUS_STYLES[item.status];

  return (
    <div className="flex-1 page-container py-12 transition-colors duration-300">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-10 transition-all group w-max"
        style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600 }}
        id="back-btn"
      >
        <div className="p-2 rounded-full bg-[var(--card-bg)] border border-[var(--divider)] shadow-sm group-hover:scale-105 transition-all">
          <ArrowLeft size={16} />
        </div>
        <span className="group-hover:text-[var(--text-primary)] transition-colors">Back to items</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div
            className="aspect-[4/3] overflow-hidden relative shadow-sm group"
            style={{
              borderRadius: '24px',
              background: 'var(--card-bg)',
              border: '1px solid var(--divider)',
            }}
          >
            {images.length > 0 ? (
              <>
                <img
                  src={images[imgIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  style={{ transition: 'opacity 0.2s ease' }}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => Math.max(i - 1, 0))}
                      disabled={imgIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all disabled:opacity-0 opacity-0 group-hover:opacity-100 disabled:pointer-events-none hover:scale-110 shadow-md"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => Math.min(i + 1, images.length - 1))}
                      disabled={imgIndex === images.length - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all disabled:opacity-0 opacity-0 group-hover:opacity-100 disabled:pointer-events-none hover:scale-110 shadow-md"
                      style={{ background: 'rgba(255,255,255,0.9)', color: '#000' }}
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className="rounded-full transition-all"
                          style={{
                            width: i === imgIndex ? '24px' : '8px',
                            height: '8px',
                            background: i === imgIndex ? 'var(--accent-primary)' : 'rgba(255,255,255,0.5)',
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag size={64} style={{ color: 'var(--text-secondary)', opacity: 0.2 }} />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all shadow-sm"
                  style={{
                    border: i === imgIndex ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    opacity: i === imgIndex ? 1 : 0.6,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
              >
                {item.status}
              </span>
              <span
                className="px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--divider)', pointerEvents: 'none' }}
              >
                {item.category}
              </span>
            </div>
            <h1
              className="text-4xl font-black mb-4 tracking-tight"
              style={{ fontFamily: 'var(--font-family-display)', color: 'var(--text-primary)' }}
            >
              {item.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', fontWeight: 500 }}>{item.description}</p>
          </div>

          {/* Meta Card */}
          <div className="p-6 rounded-3xl space-y-5 shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--divider)' }}>
            {[
              { icon: <MapPin size={18} style={{ color: 'var(--accent-primary)' }} />, label: 'Location', value: item.locationName },
              {
                icon: <Clock size={18} style={{ color: 'var(--accent-primary)' }} />,
                label: 'Reported',
                value: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              },
              {
                icon: <User size={18} style={{ color: 'var(--accent-primary)' }} />,
                label: 'Reported by',
                value: isOwner ? 'You' : item.reporterId?.name || 'Anonymous',
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-light)', border: '1px solid rgba(0,212,184,0.1)' }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2px', fontWeight: 600 }}>{label}</div>
                  <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => navigate(`/chat?with=${item.reporterId._id}&peerName=${encodeURIComponent(item.reporterId.name)}&item=${item._id}`)}
              className="btn-primary w-full py-4 text-lg font-bold shadow-md hover:shadow-lg rounded-2xl flex items-center justify-center"
              id="contact-btn"
            >
              <MessageCircle size={20} className="mr-2" />
              Contact Reporter
            </button>
          )}

          {isOwner && (
            <div
              className="p-5 text-center rounded-2xl"
              style={{ background: 'var(--accent-light)', border: '1px dashed var(--accent-primary)' }}
            >
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                This is your report. Manage it from your{' '}
                <button
                  onClick={() => navigate('/profile')}
                  style={{ color: 'var(--accent-primary)', fontWeight: 800, textDecoration: 'underline' }}
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
