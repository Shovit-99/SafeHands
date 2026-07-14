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
interface Stats {
  total: number;
  lost: number;
  found: number;
  claimed: number;
}

const CATEGORIES: (ItemCategory | '')[] = [
  '', 'Electronics', 'Clothing', 'Accessories', 'Books',
  'ID & Cards', 'Keys', 'Bags', 'Sports', 'Other',
];

const STATUSES: (ItemStatus | '')[] = ['', 'Lost', 'Found', 'Claimed'];

const STATUS_BADGE: Record<ItemStatus, string> = {
  Lost: 'badge badge-lost',
  Found: 'badge badge-found',
  Claimed: 'badge badge-claimed',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon, onClick, active }) => (
  <button
    onClick={onClick}
    className={`glass-card p-5 text-left transition-all hover:scale-[1.02] w-full ${
      active ? 'border-blue-500/40 bg-blue-500/5' : ''
    }`}
    id={`stat-${label.toLowerCase()}`}
  >
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </button>
);

// ─── Delete confirm ───────────────────────────────────────────────────────────
interface DeleteModalProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="glass-card p-6 max-w-sm w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <h3 className="font-semibold text-white">Delete Item?</h3>
      </div>
      <p className="text-slate-400 text-sm">
        Permanently delete <strong className="text-white">"{item.title}"</strong>?
        This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm" id="admin-delete-cancel">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all"
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

  // Filters
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
      const itemList: Item[] = data.data;
      setItems(itemList);
      setTotalItems(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch {
      toast.error('Failed to load items.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus, filterCategory]);

  // Compute stats on all items (separate call without filters)
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/items', { params: { limit: 50, page: 1 } });
      const all: Item[] = data.data;
      // For real stats we'd want a backend aggregate, but we work with what we have
      const { data: lostData } = await api.get('/items', { params: { status: 'Lost', limit: 1 } });
      const { data: foundData } = await api.get('/items', { params: { status: 'Found', limit: 1 } });
      const { data: claimedData } = await api.get('/items', { params: { status: 'Claimed', limit: 1 } });
      setStats({
        total: data.pagination.total,
        lost: lostData.pagination.total,
        found: foundData.pagination.total,
        claimed: claimedData.pagination.total,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setStats((s) => ({ ...s, total: s.total - 1 }));
      toast.success('Item deleted.');
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (id: string, status: ItemStatus) => {
    try {
      const updated = await updateItem(id, { status });
      setItems((prev) => prev.map((i) => (i._id === id ? { ...i, status: updated.status } : i)));
      toast.success(`Status → ${status}`);
    } catch {
      toast.error('Update failed.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterCategory('');
    setPage(1);
  };

  const hasFilters = !!(search || filterStatus || filterCategory);

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex-1 page-container py-10">
        {/* ─── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Shield size={14} className="text-violet-400" />
              </div>
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                Admin Dashboard
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">Item Management</h1>
            <p className="text-slate-400 text-sm mt-1">
              Moderate reports, update statuses, and manage the marketplace.
            </p>
          </div>
          <button
            onClick={() => { fetchItems(); fetchStats(); }}
            className="btn-secondary text-xs px-4 py-2"
            id="admin-refresh"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {/* ─── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Items"
            value={stats.total}
            color="bg-blue-500/15"
            icon={<BarChart3 size={18} className="text-blue-400" />}
            onClick={clearFilters}
          />
          <StatCard
            label="Lost"
            value={stats.lost}
            color="bg-red-500/15"
            icon={<Package size={18} className="text-red-400" />}
            onClick={() => { setFilterStatus('Lost'); setPage(1); }}
            active={filterStatus === 'Lost'}
          />
          <StatCard
            label="Found"
            value={stats.found}
            color="bg-green-500/15"
            icon={<CheckCircle2 size={18} className="text-green-400" />}
            onClick={() => { setFilterStatus('Found'); setPage(1); }}
            active={filterStatus === 'Found'}
          />
          <StatCard
            label="Claimed"
            value={stats.claimed}
            color="bg-violet-500/15"
            icon={<CheckCircle2 size={18} className="text-violet-400" />}
            onClick={() => { setFilterStatus('Claimed'); setPage(1); }}
            active={filterStatus === 'Claimed'}
          />
        </div>

        {/* ─── Filters ───────────────────────────────────────────────────── */}
        <div className="glass-card p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Search</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
            {/* Status filter */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value as ItemStatus | ''); setPage(1); }}
                className="input-field h-9 text-sm py-0 px-3 w-auto"
                id="admin-filter-status"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s || 'All Statuses'}</option>
                ))}
              </select>
            </div>
            {/* Category filter */}
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value as ItemCategory | ''); setPage(1); }}
                className="input-field h-9 text-sm py-0 px-3 w-auto"
                id="admin-filter-category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c || 'All Categories'}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary h-9 px-5 text-sm" id="admin-search-btn">
              Search
            </button>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary h-9 px-3 text-sm"
                id="admin-clear-filters"
              >
                <X size={14} /> Clear
              </button>
            )}
          </form>
          <p className="text-xs text-slate-500 mt-2">
            {loading ? '…' : `${totalItems} items found`}
          </p>
        </div>

        {/* ─── Table ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={30} className="animate-spin text-blue-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Package size={40} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No items found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-white/3 border-b border-white/6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Item</span>
              <span>Category</span>
              <span>Status</span>
              <span>Reporter</span>
              <span>Actions</span>
            </div>

            {/* Rows */}
            {items.map((item) => (
              <div
                key={item._id}
                className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 border-b border-white/5 last:border-0 items-center hover:bg-white/2 transition-colors"
              >
                {/* Title + location */}
                <div className="min-w-0">
                  <p className="font-medium text-white text-sm truncate">{item.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.locationName}</p>
                </div>
                {/* Category */}
                <span className="text-xs text-slate-400 bg-white/5 px-2.5 py-1 rounded-full w-fit">
                  {item.category}
                </span>
                {/* Status change */}
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item._id, e.target.value as ItemStatus)}
                  className={`text-xs rounded-full px-2.5 py-1 outline-none border cursor-pointer transition-colors ${
                    item.status === 'Lost'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : item.status === 'Found'
                      ? 'bg-green-500/10 border-green-500/30 text-green-300'
                      : 'bg-violet-500/10 border-violet-500/30 text-violet-300'
                  }`}
                  id={`admin-status-${item._id}`}
                >
                  {(['Lost', 'Found', 'Claimed'] as ItemStatus[]).map((s) => (
                    <option key={s} value={s} className="bg-surface-800 text-slate-200">{s}</option>
                  ))}
                </select>
                {/* Reporter */}
                <span className="text-xs text-slate-400 truncate">
                  {item.reporterId?.name || 'Unknown'}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate(`/items/${item._id}`)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="View"
                    id={`admin-view-${item._id}`}
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
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

        {/* ─── Pagination ────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
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
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  page === i + 1
                    ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
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
