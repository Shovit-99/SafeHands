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
    <div className="flex-1 transition-colors duration-300">
      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative pt-24 pb-20 px-6 text-center overflow-hidden">
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--mesh-bg)',
            opacity: 1,
            pointerEvents: 'none',
          }}
        />

        <div className="relative page-container">
          {/* Tag pill */}
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full shadow-sm glass-card hover-lift">
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Campus Lost &amp; Found Network
            </span>
          </div>

          <h1
            className="font-black mb-6 tracking-tight text-[var(--text-primary)]"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(3rem, 7vw, 5rem)',
              lineHeight: 1.05,
            }}
          >
            Lost something?<br />
            <span className="gradient-text">We'll help you find it.</span>
          </h1>

          <p className="mb-12 max-w-xl mx-auto font-medium" style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.6 }}>
            Report lost items, browse found objects, and connect with your campus community — all in one modern platform.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto" id="search-form">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="input-field pl-14 h-14 shadow-md font-medium text-lg hover-lift"
                style={{ borderRadius: '999px' }}
                placeholder="Search items, descriptions..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="search-input"
              />
            </div>
            <button type="submit" className="btn-primary px-8 h-14 text-base font-bold shadow-md hover-lift" id="search-btn">
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ─── Content ───────────────────────────────────────────────────────── */}
      <div className="page-container pb-24">

        {/* Filter Pills Row */}
        <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Status pills */}
          {STATUSES.map((s) => {
            const isActive = filters.status === s;
            return (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, status: f.status === s ? '' : s, page: 1 }))}
                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                }`}
                id={`filter-status-${s}`}
              >
                {s}
              </button>
            );
          })}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 flex-shrink-0 mx-1" />

          {/* Category pills */}
          {CATEGORIES.map((c) => {
            const isActive = filters.category === c;
            return (
              <button
                key={c}
                onClick={() => setFilters((f) => ({ ...f, category: f.category === c ? '' : c, page: 1 }))}
                className={`flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700'
                }`}
                id={`filter-cat-${c}`}
              >
                {c}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 ml-2"
              id="clear-filters"
            >
              <X size={14} /> Clear All
            </button>
          )}

          <span className="flex-shrink-0 ml-auto font-semibold px-2 text-sm text-slate-500 dark:text-slate-400">
            {loading ? 'Searching...' : `${total} items`}
          </span>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-transparent overflow-hidden animate-pulse" style={{ background: 'var(--card-bg)' }}>
                <div className="aspect-[4/3]" style={{ background: 'var(--divider)' }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded-full w-3/4" style={{ background: 'var(--divider)' }} />
                  <div className="h-3 rounded-full w-1/2" style={{ background: 'var(--divider)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 rounded-3xl" style={{ background: 'var(--card-bg)', border: '1px dashed var(--divider)' }}>
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'var(--accent-light)',
              }}
            >
              <Search size={32} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h3
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: 'var(--font-family-display)', color: 'var(--text-primary)' }}
            >
              No items found
            </h3>
            <p className="font-medium" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {hasActiveFilters ? "We couldn't find anything matching your filters." : 'Be the first to report a lost or found item on campus!'}
            </p>
            {!hasActiveFilters && (
              <button onClick={() => navigate('/report')} className="btn-primary px-8 h-12 text-base shadow-md mx-auto flex items-center">
                Report an Item <ArrowRight size={18} className="ml-2" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex justify-center gap-3 mt-16">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                className="w-12 h-12 rounded-full text-base font-black transition-all hover:scale-105"
                style={
                  filters.page === i + 1
                    ? {
                        background: 'var(--accent-gradient)',
                        color: '#ffffff',
                        boxShadow: '0 8px 24px var(--accent-light)',
                      }
                    : {
                        background: 'var(--card-bg)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--divider)',
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
