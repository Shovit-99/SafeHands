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
    className="p-5 text-left w-full transition-all shadow-sm rounded-3xl"
    style={{
      background: active ? 'var(--accent-light)' : 'var(--card-bg)',
      border: active ? '1px solid var(--accent-primary)' : '1px solid var(--divider)',
    }}
    id={`stat-${label.toLowerCase().replace(' ', '-')}`}
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <div
      className="text-3xl font-black text-[var(--text-primary)] mb-1"
      style={{ fontFamily: 'var(--font-family-display)' }}
    >
      {value}
    </div>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</div>
  </button>
);

// ─── Delete Modal ─────────────────────────────────────────────────────────────
interface DeleteModalProps { item: Item; onConfirm: () => void; onCancel: () => void; }
const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
    <div className="p-8 max-w-sm w-full space-y-5 rounded-3xl shadow-lg" style={{ background: 'var(--card-bg)', border: '1px solid rgba(239,68,68,0.3)' }}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertTriangle size={20} style={{ color: '#ef4444' }} />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-family-display)' }}>Delete Item?</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
        Permanently delete <strong className="text-[var(--text-primary)]">"{item.title}"</strong>? This cannot be undone.
      </p>
      <div className="flex gap-4 pt-2">
        <button onClick={onCancel} className="px-6 py-3 rounded-2xl font-bold border transition-all hover:bg-black/5 dark:hover:bg-white/5 flex-1" style={{ color: 'var(--text-secondary)', borderColor: 'var(--divider)' }} id="admin-delete-cancel">Cancel</button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 text-sm font-bold rounded-2xl transition-all shadow-md"
          style={{ background: '#ef4444', color: '#ffffff' }}
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
      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }
      : s === 'Found'
      ? { background: 'var(--accent-light)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }
      : { background: 'rgba(184,169,255,0.1)', border: '1px solid rgba(184,169,255,0.22)', color: '#8b5cf6' };

  return (
    <>
      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      <div className="flex-1 page-container py-12 transition-colors duration-300">
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent-light)' }}
              >
                <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-black text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-family-display)' }}>
              Item Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px', fontWeight: 500 }}>
              Moderate reports, update statuses, and manage the marketplace.
            </p>
          </div>
          <button
            onClick={() => { void fetchItems(); void fetchStats(); }}
            className="btn-secondary text-sm px-5 py-2.5 font-bold shadow-sm"
            id="admin-refresh"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* ─── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Items" value={stats.total}
            iconBg="var(--accent-light)" iconColor="var(--accent-primary)"
            icon={<BarChart3 size={20} style={{ color: 'var(--accent-primary)' }} />}
            onClick={clearFilters}
          />
          <StatCard
            label="Lost" value={stats.lost}
            iconBg="rgba(239,68,68,0.1)" iconColor="#ef4444"
            icon={<Package size={20} style={{ color: '#ef4444' }} />}
            onClick={() => { setFilterStatus('Lost'); setPage(1); }}
            active={filterStatus === 'Lost'}
          />
          <StatCard
            label="Found" value={stats.found}
            iconBg="var(--accent-light)" iconColor="var(--accent-primary)"
            icon={<CheckCircle2 size={20} style={{ color: 'var(--accent-primary)' }} />}
            onClick={() => { setFilterStatus('Found'); setPage(1); }}
            active={filterStatus === 'Found'}
          />
          <StatCard
            label="Claimed" value={stats.claimed}
            iconBg="rgba(139,92,246,0.1)" iconColor="#8b5cf6"
            icon={<CheckCircle2 size={20} style={{ color: '#8b5cf6' }} />}
            onClick={() => { setFilterStatus('Claimed'); setPage(1); }}
            active={filterStatus === 'Claimed'}
          />
        </div>

        {/* ─── Filters ────────────────────────────────────────────────────── */}
        <div className="p-6 mb-8 rounded-3xl shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--divider)' }}>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs mb-2 font-bold" style={{ color: 'var(--text-secondary)' }}>Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  className="input-field pl-11 h-11 text-sm rounded-xl shadow-sm"
                  style={{ background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  id="admin-search"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs mb-2 font-bold" style={{ color: 'var(--text-secondary)' }}>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as ItemStatus | ''); setPage(1); }}
                className="input-field h-11 text-sm py-0 px-4 w-auto rounded-xl shadow-sm"
                style={{ background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
                id="admin-filter-status"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-2 font-bold" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value as ItemCategory | ''); setPage(1); }}
                className="input-field h-11 text-sm py-0 px-4 w-auto rounded-xl shadow-sm"
                style={{ background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
                id="admin-filter-category"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary h-11 px-6 text-sm font-bold shadow-md rounded-xl" id="admin-search-btn">
              <Search size={16} className="mr-1.5" /> Search
            </button>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="btn-secondary h-11 px-5 text-sm font-bold shadow-sm rounded-xl" id="admin-clear-filters">
                <X size={16} className="mr-1.5" /> Clear
              </button>
            )}
          </form>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 600 }}>
            {loading ? '…' : `${totalItems} items found`}
          </p>
        </div>

        {/* ─── Table ──────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 rounded-3xl shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--divider)' }}>
            <Package size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1.5rem', opacity: 0.5 }} />
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>No items found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl shadow-sm" style={{ background: 'var(--card-bg)', border: '1px solid var(--divider)' }}>
            {/* Table header */}
            <div
              className="grid gap-4 px-6 py-4 text-[0.75rem] font-bold uppercase tracking-wider"
              style={{
                gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                background: 'var(--bg-color)',
                borderBottom: '1px solid var(--divider)',
                color: 'var(--text-secondary)',
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
                className="grid gap-4 px-6 py-5 items-center transition-all group"
                style={{
                  gridTemplateColumns: '3fr 1fr 1fr 1fr auto',
                  borderBottom: '1px solid var(--divider)',
                }}
              >
                <div className="min-w-0">
                  <p className="font-bold text-[var(--text-primary)] text-sm truncate" style={{ fontFamily: 'var(--font-family-display)' }}>
                    {item.title}
                  </p>
                  <p className="text-xs truncate mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>{item.locationName}</p>
                </div>

                <span
                  className="text-xs px-3 py-1.5 rounded-full w-fit font-bold shadow-sm"
                  style={{ background: 'var(--bg-color)', color: 'var(--text-secondary)', border: '1px solid var(--divider)' }}
                >
                  {item.category}
                </span>

                <select
                  value={item.status}
                  onChange={(e) => void handleStatusChange(item._id, e.target.value as ItemStatus)}
                  className="text-xs rounded-full px-3 py-1.5 outline-none cursor-pointer transition-colors font-bold shadow-sm"
                  style={statusSelectStyle(item.status)}
                  id={`admin-status-${item._id}`}
                >
                  {(['Lost', 'Found', 'Claimed'] as ItemStatus[]).map((s) => (
                    <option key={s} value={s} style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>{s}</option>
                  ))}
                </select>

                <span className="text-xs truncate font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {item.reporterId?.name || 'Unknown'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="p-2 rounded-xl transition-all shadow-sm"
                    style={{ color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--divider)'; }}
                    title="View"
                    id={`admin-view-${item._id}`}
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 rounded-xl transition-all shadow-sm"
                    style={{ color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--divider)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#ef4444'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--divider)'; }}
                    title="Delete"
                    id={`admin-del-${item._id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Pagination ─────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-2xl font-bold border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 text-sm disabled:opacity-30 disabled:pointer-events-none"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--divider)' }}
              id="admin-prev-page"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-10 h-10 rounded-full text-sm font-black transition-all shadow-sm"
                style={page === i + 1
                  ? { background: 'var(--accent-gradient)', color: '#ffffff', boxShadow: '0 4px 16px var(--accent-light)' }
                  : { background: 'var(--card-bg)', color: 'var(--text-secondary)', border: '1px solid var(--divider)' }
                }
                id={`admin-page-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-2xl font-bold border flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 text-sm disabled:opacity-30 disabled:pointer-events-none"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--divider)' }}
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
