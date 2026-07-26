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
    <div className="animate-fadeInUp">
      {/* ─── Header ─── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-light)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--accent-purple)',
            }}
          >
            <Sparkles size={12} />
            Campus Network
          </div>
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          marginBottom: '0.5rem',
        }}>
          Browse <span className="gradient-text">Lost & Found</span> Items
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 500 }}>
          Search campus items or report something new.
        </p>
      </div>

      {/* ─── Search Bar ─── */}
      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
        id="search-form"
      >
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
            }}
          />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.75rem', height: 44 }}
            placeholder="Search items, descriptions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            id="search-input"
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ height: 44, padding: '0 1.5rem' }}
          id="search-btn"
        >
          <Search size={16} />
          Search
        </button>
      </form>

      {/* ─── Filter Pills ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          scrollbarWidth: 'none',
        }}
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilters((f) => ({ ...f, status: f.status === s ? '' : s, page: 1 }))}
            className={`tag-pill ${filters.status === s ? 'active' : 'inactive'}`}
            id={`filter-status-${s}`}
          >
            {s}
          </button>
        ))}

        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0, margin: '0 0.25rem' }} />

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

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            id="clear-filters"
          >
            <X size={14} /> Clear
          </button>
        )}

        <span style={{
          marginLeft: 'auto',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {loading ? 'Searching...' : `${total} items`}
        </span>
      </div>

      {/* ─── Grid ─── */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="card"
              style={{ overflow: 'hidden' }}
            >
              <div style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.03)' }} />
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ height: 14, borderRadius: 'var(--radius-full)', width: '75%', background: 'rgba(255,255,255,0.04)' }} />
                <div style={{ height: 10, borderRadius: 'var(--radius-full)', width: '50%', background: 'rgba(255,255,255,0.03)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={32} style={{ color: 'var(--accent-purple)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No items found
            </h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: 320 }}>
              {hasActiveFilters
                ? "We couldn't find anything matching your filters."
                : 'Be the first to report a lost or found item on campus!'}
            </p>
            {!hasActiveFilters && (
              <button onClick={() => navigate('/report')} className="btn-primary">
                Report an Item <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onClick={() => navigate(`/items/${item._id}`)}
            />
          ))}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {pages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '2rem',
        }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ...(filters.page === i + 1
                  ? {
                      background: 'var(--accent-gradient)',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                    }
                  : {
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }),
              }}
              id={`page-${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
