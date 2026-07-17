import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Package, AlertTriangle, CheckCircle2, Loader2,
  Trash2, ExternalLink, Search, RefreshCw, Shield, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { deleteItem, updateItem } from '../api/items';
import type { Item, ItemStatus, ItemCategory } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats { total: number; lost: number; found: number; claimed: number; }

const CATEGORIES: (ItemCategory | '')[] = [
  '', 'Electronics', 'Clothing', 'Accessories', 'Books',
  'ID & Cards', 'Keys', 'Bags', 'Sports', 'Other',
];

const STATUSES: (ItemStatus | '')[] = ['', 'Lost', 'Found', 'Claimed'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, iconBg, icon, onClick, active }) => (
  <button
    onClick={onClick}
    className="glass-card p-5 text-left w-full transition-all"
    style={active ? { borderColor: 'rgba(0,212,184,0.3)', background: 'rgba(0,212,184,0.04)' } : {}}
    id={`stat-${label.toLowerCase().replace(' ', '-')}`}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <div
      className="text-3xl font-bold text-white mb-0.5"
      style={{ fontFamily: 'Space Grotesk, sans-serif' }}
    >
      {value}
    </div>
    <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>{label}</div>
  </button>
);

// ─── Delete Modal ─────────────────────────────────────────────────────────────
interface DeleteModalProps { item: Item; onConfirm: () => void; onCancel: () => void; }
const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(6,8,12,0.8)', backdropFilter: 'blur(8px)' }}>
    <div className="glass-card p-6 max-w-sm w-full space-y-4" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertTriangle size={18} style={{ color: '#fca5a5' }} />
        </div>
        <h3 className="font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Delete Item?</h3>
      </div>
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
        Permanently delete <strong className="text-white">"{item.title}"</strong>? This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm" id="admin-delete-cancel">Cancel</button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 text-sm font-semibold rounded-full transition-all"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          id="admin-delete-confirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ total: 0, lost: 0, found: 0, claimed: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ItemStatus | ''>('');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const LIMIT = 15;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (search.trim()) params.q = search.trim();
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      const { data } = await api.get('/items', { params });
      setItems(data.data);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch { toast.error('Failed to load items.'); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/items', { params: { limit: 1, page: 1 } });
      const { data: lostData } = await api.get('/items', { params: { status: 'Lost', limit: 1 } });
      const { data: foundData } = await api.get('/items', { params: { status: 'Found', limit: 1 } });
      const { data: claimedData } = await api.get('/items', { params: { status: 'Claimed', limit: 1 } });
      setStats({ total: data.pagination.total, lost: lostData.pagination.total, found: foundData.pagination.total, claimed: claimedData.pagination.total });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setStats((s) => ({ ...s, total: s.total - 1 }));
      toast.success('Item deleted.');
    } catch { toast.error('Delete failed.'); }
    finally { setDeleteTarget(null); }
  };

  const handleStatusChange = async (id: string, status: ItemStatus) => {
    try {
      const updated = await updateItem(id, { status });
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, status: updated.status } : i)));
      toast.success(`Status → ${status}`);
    } catch { toast.error('Update failed.'); }
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchItems(); };
  const clearFilters = () => { setSearch(''); setFilterStatus(''); setFilterCategory(''); setPage(1); };
  const hasFilters = !!(search || filterStatus || filterCategory);

  const statusSelectStyle = (s: ItemStatus) =>
    s === 'Lost'
      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }
      : s === 'Found'
      ? { background: 'rgba(0,212,184,0.1)', border: '1px solid rgba(0,212,184,0.25)', color: '#5ff0de' }
      : { background: 'rgba(184,169,255,0.1)', border: '1px solid rgba(184,169,255,0.22)', color: '#c4b5fd' };

  return (
    <>
      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      <div className="flex-1 page-container py-10">
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,212,184,0.1)' }}
              >
                <Shield size={14} style={{ color: '#00d4b8' }} />
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00d4b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Item Management
            </h1>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '4px' }}>
              Moderate reports, update statuses, and manage the marketplace.
            </p>
          </div>
          <button
            onClick={() => { void fetchItems(); void fetchStats(); }}
            className="btn-secondary text-xs px-4 py-2"
            id="admin-refresh"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* ─── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Items" value={stats.total}
            iconBg="rgba(0,212,184,0.1)" iconColor="#00d4b8"
            icon={<BarChart3 size={18} style={{ color: '#00d4b8' }} />}
            onClick={clearFilters}
          />
          <StatCard
            label="Lost" value={stats.lost}
            iconBg="rgba(239,68,68,0.1)" iconColor="#fca5a5"
            icon={<Package size={18} style={{ color: '#fca5a5' }} />}
            onClick={() => { setFilterStatus('Lost'); setPage(1); }}
            active={filterStatus === 'Lost'}
          />
          <StatCard
            label="Found" value={stats.found}
            iconBg="rgba(0,212,184,0.1)" iconColor="#5ff0de"
            icon={<CheckCircle2 size={18} style={{ color: '#5ff0de' }} />}
            onClick={() => { setFilterStatus('Found'); setPage(1); }}
            active={filterStatus === 'Found'}
          />
          <StatCard
            label="Claimed" value={stats.claimed}
            iconBg="rgba(184,169,255,0.1)" iconColor="#c4b5fd"
            icon={<CheckCircle2 size={18} style={{ color: '#c4b5fd' }} />}
            onClick={() => { setFilterStatus('Claimed'); setPage(1); }}
            active={filterStatus === 'Claimed'}
          />
        </div>

        {/* ─── Filters ────────────────────────────────────────────────────── */}
        <div className="glass-card p-4 mb-6" style={{ border: '1px solid rgba(0,212,184,0.07)' }}>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs mb-1.5 font-medium" style={{ color: '#4b5563' }}>Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4b5563' }} />
                <input
                  type="text"
                  className="input-field pl-9 h-9 text-sm"
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="admin-search"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: '#4b5563' }}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as ItemStatus | ''); setPage(1); }}
                className="input-field h-9 text-sm py-0 px-3 w-auto"
                id="admin-filter-status"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: '#4b5563' }}>Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value as ItemCategory | ''); setPage(1); }}
                className="input-field h-9 text-sm py-0 px-3 w-auto"
                id="admin-filter-category"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary h-9 px-5 text-sm" id="admin-search-btn">
              <Search size={13} /> Search
            </button>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn-secondary h-9 px-3 text-sm" id="admin-clear-filters">
                <X size={13} /> Clear
              </button>
            )}
          </form>
          <p style={{ fontSize: '0.75rem', color: '#374151', marginTop: '8px' }}>
            {loading ? '…' : `${totalItems} items found`}
          </p>
        </div>

        {/* ─── Table ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={30} className="animate-spin" style={{ color: '#00d4b8' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Package size={40} style={{ color: '#1a2235', margin: '0 auto 1rem' }} />
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>No items found</h3>
            <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden" style={{ border: '1px solid rgba(0,212,184,0.07)' }}>
            {/* Table header */}
            <div
              className="grid gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider"
              style={{
                gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                background: 'rgba(0,212,184,0.03)',
                borderBottom: '1px solid rgba(0,212,184,0.07)',
                color: '#374151',
              }}
            >
              <span>Item</span>
              <span>Category</span>
              <span>Status</span>
              <span>Reporter</span>
              <span>Actions</span>
            </div>

            {items.map((item) => (
              <div
                key={item._id}
                className="grid gap-4 px-5 py-4 items-center transition-all"
                style={{
                  gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,184,0.02)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {item.title}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: '#4b5563' }}>{item.locationName}</p>
                </div>

                <span
                  className="text-xs px-2.5 py-1 rounded-full w-fit"
                  style={{ background: 'rgba(0,212,184,0.07)', color: '#5ff0de', border: '1px solid rgba(0,212,184,0.13)' }}
                >
                  {item.category}
                </span>

                <select
                  value={item.status}
                  onChange={(e) => void handleStatusChange(item._id, e.target.value as ItemStatus)}
                  className="text-xs rounded-full px-2.5 py-1 outline-none cursor-pointer transition-colors"
                  style={statusSelectStyle(item.status)}
                  id={`admin-status-${item._id}`}
                >
                  {(['Lost', 'Found', 'Claimed'] as ItemStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: '#111827', color: '#e2e8f0' }}>{s}</option>
                  ))}
                </select>

                <span className="text-xs truncate" style={{ color: '#4b5563' }}>
                  {item.reporterId?.name || 'Unknown'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: '#374151' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#00d4b8'; (e.currentTarget as HTMLElement).style.background = 'rgba(0,212,184,0.08)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#374151'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    title="View"
                    id={`admin-view-${item._id}`}
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: '#374151' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fca5a5'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#374151'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    title="Delete"
                    id={`admin-del-${item._id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn-secondary text-sm px-4 py-2 disabled:opacity-30"
              id="admin-prev-page"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-9 h-9 rounded-full text-sm font-semibold transition-all"
                style={page === i + 1
                  ? { background: 'linear-gradient(135deg, #00bfa5, #5ff0de)', color: '#06080c', boxShadow: '0 4px 16px rgba(0,212,184,0.35)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.07)' }
                }
                id={`admin-page-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="btn-secondary text-sm px-4 py-2 disabled:opacity-30"
              id="admin-next-page"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPage;
