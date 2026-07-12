import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, ArrowLeft, MessageCircle, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import type { Item } from '../types';
import { useAuth } from '../context/AuthContext';

const STATUS_CLASSES: Record<Item['status'], string> = {
  Lost: 'badge badge-lost',
  Found: 'badge badge-found',
  Claimed: 'badge badge-claimed',
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

  return (
    <div className="flex-1 page-container py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors text-sm"
        id="back-btn"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] glass-card overflow-hidden relative">
            {images.length > 0 ? (
              <>
                <img
                  src={images[imgIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex((i) => Math.max(i - 1, 0))}
                      disabled={imgIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white disabled:opacity-30 hover:bg-black/70 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIndex((i) => Math.min(i + 1, images.length - 1))}
                      disabled={imgIndex === images.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full text-white disabled:opacity-30 hover:bg-black/70 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-4' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag size={48} className="text-slate-600" />
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
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    i === imgIndex ? 'border-blue-500' : 'border-transparent'
                  }`}
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
            <div className="flex items-center gap-3 mb-3">
              <span className={STATUS_CLASSES[item.status]}>{item.status}</span>
              <span className="text-xs text-slate-500 bg-white/5 px-2.5 py-1 rounded-full">
                {item.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{item.title}</h1>
            <p className="text-slate-400 leading-relaxed">{item.description}</p>
          </div>

          {/* Meta */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={15} className="text-blue-400 flex-shrink-0" />
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Location</div>
                <div className="text-white font-medium">{item.locationName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={15} className="text-violet-400 flex-shrink-0" />
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Reported</div>
                <div className="text-white font-medium">
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User size={15} className="text-green-400 flex-shrink-0" />
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Reported by</div>
                <div className="text-white font-medium">
                  {isOwner ? 'You' : item.reporterId?.name || 'Anonymous'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAuthenticated && !isOwner && (
            <button
              onClick={() => navigate(`/chat?with=${item.reporterId._id}&item=${item._id}`)}
              className="btn-primary w-full py-3"
              id="contact-btn"
            >
              <MessageCircle size={16} />
              Contact Reporter
            </button>
          )}

          {isOwner && (
            <div className="glass-card p-4">
              <p className="text-slate-400 text-sm text-center">
                This is your report. Manage it from your profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
