import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Package, Clock, MapPin, Tag,
  Pencil, Trash2, CheckCircle, Loader2, X, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { updateItem, deleteItem } from '../api/items';
import type { Item, ItemStatus } from '../types';

// ─── Status badge helper ──────────────────────────────────────────────────────
const STATUS_BADGE: Record<ItemStatus, string> = {
  Lost: 'badge badge-lost',
  Found: 'badge badge-found',
  Claimed: 'badge badge-claimed',
};

const STATUS_OPTIONS: ItemStatus[] = ['Lost', 'Found', 'Claimed'];

// ─── Profile Avatar ───────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 flex-shrink-0">
      {initials}
    </div>
  );
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
interface DeleteModalProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="glass-card p-6 max-w-sm w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <h3 className="font-semibold text-white">Delete Report?</h3>
      </div>
      <p className="text-slate-400 text-sm">
        This will permanently delete <strong className="text-white">"{item.title}"</strong>. This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm" id="delete-cancel">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-all"
          id="delete-confirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Item Row in list ─────────────────────────────────────────────────────────
interface ItemRowProps {
  item: Item;
  onStatusChange: (id: string, status: ItemStatus) => void;
  onDelete: (item: Item) => void;
  isAdmin: boolean;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onStatusChange, onDelete, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-4 flex gap-4 items-start hover:border-white/14 transition-all">
      {/* Thumbnail */}
      <div
        className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 cursor-pointer"
        onClick={() => navigate(`/items/${item._id}`)}
      >
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={20} className="text-slate-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-white text-sm truncate cursor-pointer hover:text-blue-300 transition-colors"
            onClick={() => navigate(`/items/${item._id}`)}
          >
            {item.title}
          </h3>
          <span className={STATUS_BADGE[item.status]}>{item.status}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={10} /> {item.locationName}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          {/* Status quick-change */}
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item._id, e.target.value as ItemStatus)}
            className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 outline-none hover:border-white/20 transition-colors"
            id={`status-select-${item._id}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {/* Delete */}
          <button
            onClick={() => onDelete(item)}
            className="ml-auto flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
            id={`delete-item-${item._id}`}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'claimed'>('active');
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch my items
  useEffect(() => {
    setLoadingItems(true);
    api.get('/items/mine')
      .then(({ data }) => setMyItems(data.data as Item[]))
      .catch(() => toast.error('Failed to load your items.'))
      .finally(() => setLoadingItems(false));
  }, []);

  const activeItems = myItems.filter((i) => i.status !== 'Claimed');
  const claimedItems = myItems.filter((i) => i.status === 'Claimed');

  // ─── Status change ────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: ItemStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateItem(id, { status });
      setMyItems((prev) => prev.map((i) => (i._id === id ? { ...i, status: updated.status } : i)));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id);
      setMyItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      toast.success('Report deleted.');
    } catch {
      toast.error('Failed to delete. Admin permission required.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!user) return null;

  const displayItems = activeTab === 'active' ? activeItems : claimedItems;

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex-1 page-container py-10 max-w-3xl">
        {/* ─── Profile Card ─────────────────────────────────────────────── */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center gap-5">
            <Avatar name={user.name} />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                <Mail size={13} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                    isAdmin
                      ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                      : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                  }`}
                >
                  <Shield size={11} />
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
                <span className="text-xs text-slate-500 bg-white/5 px-2.5 py-1 rounded-full">
                  {myItems.length} reports
                </span>
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="btn-secondary text-xs px-4 py-2 self-start"
              id="logout-btn"
            >
              Sign out
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/6">
            {[
              { label: 'Total Reports', value: myItems.length, icon: Package, color: 'text-blue-400' },
              { label: 'Active', value: activeItems.length, icon: Clock, color: 'text-amber-400' },
              { label: 'Resolved', value: claimedItems.length, icon: CheckCircle, color: 'text-green-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon size={18} className={`${color} mx-auto mb-1`} />
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-5 p-1 bg-white/4 rounded-xl border border-white/6 w-fit">
          {[
            { key: 'active', label: 'My Reports', count: activeItems.length },
            { key: 'claimed', label: 'Resolved', count: claimedItems.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'active' | 'claimed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === key
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              id={`tab-${key}`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === key ? 'bg-blue-500/30 text-blue-300' : 'bg-white/6 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ─── Items List ───────────────────────────────────────────────── */}
        {loadingItems ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-blue-400" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Package size={40} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {activeTab === 'active' ? 'No active reports' : 'No resolved items'}
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              {activeTab === 'active'
                ? 'Lost or found something? Report it now.'
                : 'Items you resolve will appear here.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => navigate('/report')}
                className="btn-primary px-6"
                id="go-report"
              >
                Report an Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {updatingId && (
              <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
                <Loader2 size={12} className="animate-spin" /> Updating…
              </div>
            )}
            {displayItems.map((item) => (
              <ItemRow
                key={item._id}
                item={item}
                onStatusChange={handleStatusChange}
                onDelete={setDeleteTarget}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/report')}
            className="btn-primary px-8"
            id="profile-report-btn"
          >
            + Report Another Item
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
