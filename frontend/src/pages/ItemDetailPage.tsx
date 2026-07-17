import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowLeft, MessageCircle, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import type { Item } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES: Record<Item['status'], { bg: string; color: string; border: string }> = {
  Lost: { bg: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: 'rgba(239,68,68,0.22)' },
  Found: { bg: 'rgba(0,212,184,0.1)', color: '#5ff0de', border: 'rgba(0,212,184,0.25)' },
  Claimed: { bg: 'rgba(184,169,255,0.1)', color: '#c4b5fd', border: 'rgba(184,169,255,0.22)' },
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
    <div className="flex-1 page-container py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 transition-all group"
        style={{ color: '#4b5563', fontSize: '0.85rem' }}
        id="back-btn"
      >
        <ArrowLeft size={15} style={{ transition: 'transform 0.2s ease' }} className="group-hover:-translate-x-1" />
        <span className="group-hover:text-white transition-colors">Back</span>
      </button>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div
            className="aspect-[4/3] overflow-hidden relative"
            style={{
              borderRadius: '20px',
              background: 'rgba(11,15,23,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all disabled:opacity-30"
                      style={{ background: 'rgba(6,8,12,0.7)', backdropFilter: 'blur(8px)', color: '#fff' }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => Math.min(i + 1, images.length - 1))}
                      disabled={imgIndex === images.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all disabled:opacity-30"
                      style={{ background: 'rgba(6,8,12,0.7)', backdropFilter: 'blur(8px)', color: '#fff' }}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className="rounded-full transition-all"
                          style={{
                            width: i === imgIndex ? '20px' : '6px',
                            height: '6px',
                            background: i === imgIndex ? '#00d4b8' : 'rgba(255,255,255,0.3)',
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag size={48} style={{ color: '#1a2235' }} />
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                  style={{
                    border: i === imgIndex ? '2px solid #00d4b8' : '2px solid transparent',
                    boxShadow: i === imgIndex ? '0 0 10px rgba(0,212,184,0.3)' : 'none',
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="badge"
                style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}
              >
                {item.status}
              </span>
              <span
                className="tag-pill inactive"
                style={{ pointerEvents: 'none' }}
              >
                {item.category}
              </span>
            </div>
            <h1
              className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}
            >
              {item.title}
            </h1>
            <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.95rem' }}>{item.description}</p>
          </div>

          {/* Meta Card */}
          <div className="glass-card p-5 space-y-4">
            {[
              { icon: <MapPin size={14} style={{ color: '#00d4b8' }} />, label: 'Location', value: item.locationName },
              {
                icon: <Clock size={14} style={{ color: '#5ff0de' }} />,
                label: 'Reported',
                value: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              },
              {
                icon: <User size={14} style={{ color: '#00d4b8' }} />,
                label: 'Reported by',
                value: isOwner ? 'You' : item.reporterId?.name || 'Anonymous',
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(0,212,184,0.08)', border: '1px solid rgba(0,212,184,0.12)' }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#4b5563', marginBottom: '1px' }}>{label}</div>
                  <div className="text-white font-medium" style={{ fontSize: '0.9rem' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => navigate(`/chat?with=${item.reporterId._id}&peerName=${encodeURIComponent(item.reporterId.name)}&item=${item._id}`)}
              className="btn-primary w-full py-3.5"
              id="contact-btn"
            >
              <MessageCircle size={16} />
              Contact Reporter
            </button>
          )}

          {isOwner && (
            <div
              className="glass-card p-4 text-center"
              style={{ borderColor: 'rgba(0,212,184,0.1)' }}
            >
              <p style={{ color: '#4b5563', fontSize: '0.85rem' }}>
                This is your report. Manage it from your{' '}
                <button
                  onClick={() => navigate('/profile')}
                  style={{ color: '#00d4b8', fontWeight: 600 }}
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
