import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

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

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative page-container">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
            <MapPin size={12} className="text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">Campus Lost & Found Network</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 font-display">
            Lost something?<br />
            <span className="gradient-text">We&apos;ll help you find it.</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
            Report lost items, browse found objects, and connect with your campus community — all in one place.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto" id="search-form">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="input-field pl-12 h-12"
                placeholder="Search by title, description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                id="search-input"
              />
            </div>
            <button type="submit" className="btn-primary px-6 h-12" id="search-btn">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ─── Content ──────────────────────────────────────────────────────── */}
      <div className="page-container pb-16">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filters */}
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    status: f.status === s ? '' : s,
                    page: 1,
                  }))
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  filters.status === s
                    ? s === 'Lost'
                      ? 'bg-red-500/20 border-red-500/40 text-red-300'
                      : s === 'Found'
                      ? 'bg-green-500/20 border-green-500/40 text-green-300'
                      : 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
                id={`filter-status-${s}`}
              >
                {s}
              </button>
            ))}

            <div className="w-px h-4 bg-white/10" />

            {/* Category dropdown */}
            <select
              value={filters.category || ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  category: e.target.value as ItemCategory | '',
                  page: 1,
                }))
              }
              className="input-field h-8 text-xs py-0 px-3 w-auto"
              id="filter-category"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
                id="clear-filters"
              >
                <X size={11} />
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              {loading ? '...' : `${total} items`}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary text-xs px-3 py-1.5 h-8"
              id="toggle-filters"
            >
              <SlidersHorizontal size={13} />
              Filters
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="item-card animate-pulse">
                <div className="aspect-[4/3] bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-3/4" />
                  <div className="h-2 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
            <p className="text-slate-400 text-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters.'
                : 'Be the first to report a lost or found item!'}
            </p>
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
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  filters.page === i + 1
                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
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
