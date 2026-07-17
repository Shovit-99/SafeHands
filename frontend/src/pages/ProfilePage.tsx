import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Package, Clock, MapPin, Tag,
  Trash2, CheckCircle, Loader2, X, AlertTriangle, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { updateItem, deleteItem } from '../api/items';
import type { Item, ItemStatus } from '../types';

const STATUS_BADGE: Record<ItemStatus, string> = {
  Lost: 'badge badge-lost',
  Found: 'badge badge-found',
  Claimed: 'badge badge-claimed',
};

const STATUS_OPTIONS: ItemStatus[] = ['Lost', 'Found', 'Claimed'];

// ─── Profile Avatar ───────────────────────────────────────────────────────────
const Avatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
      style={{
        fontFamily: 'Space Grotesk, sans-serif',
        background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)',
        color: '#06080c',
        boxShadow: '0 0 32px rgba(0,212,184,0.25)',
      }}
    >
      {initials}
    </div>
  );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
interface DeleteModalProps { item: Item; onConfirm: () => void; onCancel: () => void; }
const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(6,8,12,0.75)', backdropFilter: 'blur(8px)' }}>
    <div className="glass-card p-6 max-w-sm w-full space-y-4" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <AlertTriangle size={18} style={{ color: '#fca5a5' }} />
        </div>
        <h3 className="font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Delete Report?</h3>
      </div>
      <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
        This will permanently delete <strong className="text-white">"{item.title}"</strong>. This cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm" id="delete-cancel">Cancel</button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 text-sm font-semibold rounded-full transition-all"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          id="delete-confirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Item Row ─────────────────────────────────────────────────────────────────
interface ItemRowProps { item: Item; onStatusChange: (id: string, status: ItemStatus) => void; onDelete: (item: Item) => void; isAdmin: boolean; }
const ItemRow: React.FC<ItemRowProps> = ({ item, onStatusChange, onDelete, isAdmin: _isAdmin }) => {
  const navigate = useNavigate();
  return (
    <div
      className="glass-card p-4 flex gap-4 items-start transition-all"
      style={{ borderRadius: 16 }}
    >
      <div
        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
        style={{ background: 'rgba(11,15,23,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
        onClick={() => navigate(`/items/${item._id}`)}
      >
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tag size={20} style={{ color: '#1a2235' }} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-semibold text-white text-sm truncate cursor-pointer transition-colors hover:text-teal-400"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            onClick={() => navigate(`/items/${item._id}`)}
          >
            {item.title}
          </h3>
          <span className={STATUS_BADGE[item.status]}>{item.status}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5" style={{ fontSize: '0.72rem', color: '#4b5563' }}>
          <span className="flex items-center gap-1"><MapPin size={10} /> {item.locationName}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2.5">
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item._id, e.target.value as ItemStatus)}
            className="text-xs rounded-full px-3 py-1 outline-none transition-all cursor-pointer"
            style={{ background: 'rgba(0,212,184,0.06)', border: '1px solid rgba(0,212,184,0.14)', color: '#5ff0de' }}
            id={`status-select-${item._id}`}
          >
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => onDelete(item)}
            className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all"
            style={{ color: 'rgba(252,165,165,0.5)', border: '1px solid transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fca5a5'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(252,165,165,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            id={`delete-item-${item._id}`}
          >
            <Trash2 size={11} /> Delete
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

  useEffect(() => {
    setLoadingItems(true);
    api.get('/items/mine')
      .then(({ data }) => setMyItems(data.data as Item[]))
      .catch(() => toast.error('Failed to load your items.'))
      .finally(() => setLoadingItems(false));
  }, []);

  const activeItems = myItems.filter((i) => i.status !== 'Claimed');
  const claimedItems = myItems.filter((i) => i.status === 'Claimed');

  const handleStatusChange = async (id: string, status: ItemStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateItem(id, { status });
      setMyItems((prev) => prev.map((i) => (i._id === id ? { ...i, status: updated.status } : i)));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id);
      setMyItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      toast.success('Report deleted.');
    } catch { toast.error('Failed to delete. Admin permission required.'); }
    finally { setDeleteTarget(null); }
  };

  if (!user) return null;

  const displayItems = activeTab === 'active' ? activeItems : claimedItems;

  return (
    <>
      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
      )}

      <div className="flex-1 page-container py-10 max-w-3xl">
        {/* ─── Profile Card ───────────────────────────────────────────────── */}
        <div
          className="glass-card p-6 mb-8"
          style={{ border: '1px solid rgba(0,212,184,0.1)' }}
        >
          <div className="flex items-center gap-5">
            <Avatar name={user.name} />
            <div className="flex-1 min-w-0">
              <h1
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {user.name}
              </h1>
              <div className="flex items-center gap-2 mb-3" style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                <Mail size={13} />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={isAdmin
                    ? { background: 'rgba(184,169,255,0.1)', border: '1px solid rgba(184,169,255,0.2)', color: '#c4b5fd' }
                    : { background: 'rgba(0,212,184,0.08)', border: '1px solid rgba(0,212,184,0.18)', color: '#5ff0de' }
                  }
                >
                  <Shield size={11} />
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#4b5563', border: '1px solid rgba(255,255,255,0.07)' }}
                >
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

          {/* Stats */}
          <div
            className="grid grid-cols-3 gap-3 mt-5 pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {[
              { label: 'Total Reports', value: myItems.length, icon: Package, color: '#00d4b8' },
              { label: 'Active', value: activeItems.length, icon: Clock, color: '#fbbf24' },
              { label: 'Resolved', value: claimedItems.length, icon: CheckCircle, color: '#5ff0de' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon size={18} style={{ color, margin: '0 auto 4px' }} />
                <div
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────────────── */}
        <div
          className="flex gap-1 mb-6 p-1 w-fit"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 999 }}
        >
          {[
            { key: 'active', label: 'My Reports', count: activeItems.length },
            { key: 'claimed', label: 'Resolved', count: claimedItems.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'active' | 'claimed')}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2"
              style={activeTab === key
                ? { background: 'linear-gradient(135deg, #00bfa5 0%, #5ff0de 100%)', color: '#06080c', fontWeight: 700 }
                : { color: '#4b5563' }
              }
              id={`tab-${key}`}
            >
              {label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={activeTab === key
                  ? { background: 'rgba(6,8,12,0.2)', color: '#06080c' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#374151' }
                }
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ─── Items List ─────────────────────────────────────────────────── */}
        {loadingItems ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: '#00d4b8' }} />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-16 glass-card" style={{ border: '1px solid rgba(0,212,184,0.08)' }}>
            <Package size={40} style={{ color: '#1a2235', margin: '0 auto 1rem' }} />
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {activeTab === 'active' ? 'No active reports' : 'No resolved items'}
            </h3>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {activeTab === 'active' ? 'Lost or found something? Report it now.' : 'Items you resolve will appear here.'}
            </p>
            {activeTab === 'active' && (
              <button onClick={() => navigate('/report')} className="btn-primary px-6" id="go-report">
                <Plus size={15} /> Report an Item
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {updatingId && (
              <div className="flex items-center gap-2 text-xs mb-2" style={{ color: '#00d4b8' }}>
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

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/report')} className="btn-primary px-8" id="profile-report-btn">
            <Plus size={15} /> Report Another Item
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
