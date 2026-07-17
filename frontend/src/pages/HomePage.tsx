import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import api from '../api/axios';
import type { Item, ItemFilters, ItemCategory, ItemStatus } from '../types';
import ItemCard from '../components/ItemCard';

const CATEGORIES: ItemCategory[] = [
  'Electronics', 'Clothing', 'Accessories', 'Books',
  'ID & Cards', 'Keys', 'Bags', 'Sports', 'Other',
];

const STATUSES: ItemStatus[] = ['Lost', 'Found', 'Claimed'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ItemFilters>({ page: 1, limit: 12 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {};
      if (filters.q) params.q = filters.q;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      params.page = filters.page ?? 1;
      params.limit = filters.limit ?? 12;

      const { data } = await api.get('/items', { params });
      setItems(data.data);
      setTotal(data.pagination.total);
      setPages(data.pagination.pages);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, q: searchInput.trim(), page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 12 });
    setSearchInput('');
  };

  const hasActiveFilters = !!(filters.q || filters.category || filters.status);

  return (
    <div className="flex-1">
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative py-20 px-4 text-center overflow-hidden">
        {/* Teal ambient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(0,212,184,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="relative page-container">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(0,212,184,0.07)',
              border: '1px solid rgba(0,212,184,0.15)',
            }}
          >
            <Sparkles size={12} style={{ color: '#00d4b8' }} />
            <span style={{ fontSize: '0.78rem', color: '#5ff0de', fontWeight: 600 }}>
              Campus Lost &amp; Found Network
            </span>
          </div>

          <h1
            className="font-bold text-white mb-5"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Lost something?<br />
            <span className="gradient-text">We&apos;ll help you find it.</span>
          </h1>

          <p className="mb-10 max-w-lg mx-auto" style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Report lost items, browse found objects, and connect with your campus community — all in one place.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto" id="search-form">
            <div className="relative flex-1">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
              <input
                type="text"
                className="input-field pl-12 h-12"
                style={{ borderRadius: '999px' }}
                placeholder="Search items, descriptions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="search-input"
              />
            </div>
            <button type="submit" className="btn-primary px-6 h-12" id="search-btn">
              <Search size={15} />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <div className="page-container pb-16">

        {/* Filter Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status pills */}
            {STATUSES.map((s) => {
              const isActive = filters.status === s;
              const color =
                s === 'Lost' ? 'rgba(239,68,68,0.12)' :
                s === 'Found' ? 'rgba(0,212,184,0.12)' :
                'rgba(184,169,255,0.12)';
              const activeColor =
                s === 'Lost' ? '#fca5a5' :
                s === 'Found' ? '#5ff0de' :
                '#c4b5fd';
              const activeBorder =
                s === 'Lost' ? 'rgba(239,68,68,0.35)' :
                s === 'Found' ? 'rgba(0,212,184,0.35)' :
                'rgba(184,169,255,0.3)';

              return (
                <button
                  key={s}
                  onClick={() => setFilters((f) => ({ ...f, status: f.status === s ? '' : s, page: 1 }))}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  style={isActive
                    ? { background: color, borderColor: activeBorder, color: activeColor }
                    : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)', color: '#64748b' }
                  }
                  id={`filter-status-${s}`}
                >
                  {s}
                </button>
              );
            })}

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilters((f) => ({ ...f, category: f.category === c ? '' : c, page: 1 }))}
                  className={`tag-pill ${filters.category === c ? 'active' : 'inactive'}`}
                  id={`filter-cat-${c}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.18)',
                  color: '#fca5a5',
                }}
                id="clear-filters"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>

          <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>
            {loading ? '...' : `${total} items`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="item-card animate-pulse">
                <div className="aspect-[4/3]" style={{ background: 'rgba(255,255,255,0.03)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <div className="h-2 rounded-full w-1/2" style={{ background: 'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{
                background: 'rgba(0,212,184,0.06)',
                border: '1px solid rgba(0,212,184,0.12)',
              }}
            >
              <Search size={28} style={{ color: '#00d4b8', opacity: 0.5 }} />
            </div>
            <h3
              className="text-xl font-bold text-white mb-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              No items found
            </h3>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {hasActiveFilters ? 'Try adjusting your filters.' : 'Be the first to report a lost or found item!'}
            </p>
            {!hasActiveFilters && (
              <button onClick={() => navigate('/report')} className="btn-primary px-6">
                Report an Item <ArrowRight size={15} />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                onClick={() => navigate(`/items/${item._id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                className="w-9 h-9 rounded-full text-sm font-semibold transition-all"
                style={
                  filters.page === i + 1
                    ? {
                        background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)',
                        color: '#06080c',
                        boxShadow: '0 4px 16px rgba(0,212,184,0.35)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        color: '#64748b',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }
                }
                id={`page-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
