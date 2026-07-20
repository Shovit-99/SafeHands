import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Shield, Package, Clock, MapPin, Tag,
  Trash2, CheckCircle, Loader2, X, AlertTriangle, Plus, ChevronDown
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
const Avatar: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className={`flex items-center justify-center font-bold flex-shrink-0 text-white shadow-xl ${className || 'w-24 h-24 rounded-[2rem] text-3xl'}`}
      style={{
        fontFamily: 'var(--font-family-display)',
        background: 'var(--accent-gradient)',
        boxShadow: '0 12px 32px var(--accent-light)'
      }}
    >
      {initials}
    </div>
  );
};

// ─── Delete Modal ─────────────────────────────────────────────────────────────
interface DeleteModalProps { item: Item; onConfirm: () => void; onCancel: () => void; }
const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
    <div className="glass-card p-8 max-w-sm w-full space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-family-display)' }}>Delete Report?</h3>
      </div>
      <p className="text-sm opacity-80">
        This will permanently delete <strong>"{item.title}"</strong>. This cannot be undone.
      </p>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="btn-secondary flex-1 py-3" id="delete-cancel">Cancel</button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 font-semibold rounded-full transition-all bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30"
          id="delete-confirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Custom Status Dropdown ───────────────────────────────────────────────────
const StatusDropdown: React.FC<{ status: ItemStatus; onChange: (s: ItemStatus) => void }> = ({ status, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border outline-none"
        style={{
          background: 'var(--accent-light)',
          borderColor: isOpen ? 'var(--accent-primary)' : 'transparent',
          color: 'var(--accent-primary)'
        }}
      >
        {status}
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 glass-card p-2 z-10 animate-fadeIn" style={{ border: '1px solid var(--accent-light)' }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.stopPropagation();
                onChange(s);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-black/5 dark:hover:bg-white/10"
              style={{ color: status === s ? 'var(--accent-primary)' : 'var(--text-primary)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


// ─── Item Row ─────────────────────────────────────────────────────────────────
interface ItemRowProps { item: Item; onStatusChange: (id: string, status: ItemStatus) => void; onDelete: (item: Item) => void; isAdmin: boolean; }
const ItemRow: React.FC<ItemRowProps> = ({ item, onStatusChange, onDelete, isAdmin: _isAdmin }) => {
  const navigate = useNavigate();
  return (
    <div
      className="glass-card p-6 flex gap-6 items-center transition-all mb-4 group cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-xl relative"
      onClick={() => navigate(`/items/${item._id}`)}
    >
      <div
        className="w-28 h-28 rounded-[1.25rem] overflow-hidden flex-shrink-0 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
      >
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/20 dark:text-white/20">
            <Tag size={32} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center py-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-2xl truncate transition-colors group-hover:text-[var(--accent-primary)] mb-2" style={{ fontFamily: 'var(--font-family-display)' }}>
              {item.title}
            </h3>
            <div className="flex items-center gap-4 mt-1 opacity-60 text-sm font-medium">
              <span className="flex items-center gap-1.5"><MapPin size={16} /> {item.locationName}</span>
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
          <span className={`${STATUS_BADGE[item.status]} px-4 py-1.5 rounded-full text-xs`}>{item.status}</span>
        </div>
        
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[var(--divider)]">
          <StatusDropdown status={item.status} onChange={(s) => onStatusChange(item._id, s)} />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-red-500/80 border border-red-500/20 hover:text-white hover:bg-red-500 hover:border-red-500 hover-lift"
            id={`delete-item-${item._id}`}
          >
            <Trash2 size={16} /> Delete
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

      <div className="page-container py-16 max-w-2xl mx-auto">
        
        {/* ─── Header Section ─── */}
        <div className="flex justify-between items-center mb-12 w-full">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Welcome back!</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-family-display)' }}>
              {user.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Avatar name={user.name} className="w-12 h-12 rounded-full text-lg shrink-0" />
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover-lift shrink-0"
              title="Sign Out"
            >
              <Trash2 size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* ─── Bento Stats Grid ─── */}
        {/* Top full-width card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 mb-8 flex flex-wrap md:flex-nowrap gap-6 items-center justify-between shadow-sm border border-slate-100 dark:border-slate-700 w-full">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Total Reports</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl leading-none font-black" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--accent-primary)' }}>
                {myItems.length}
              </h2>
              <span className="text-sm font-bold text-slate-400 uppercase">Items</span>
            </div>
          </div>
          {/* Circular progress visual */}
          <div className="w-24 h-24 shrink-0 flex items-center justify-center rounded-full" style={{ border: '8px solid var(--accent-primary)' }}>
             <span className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{myItems.length}</span>
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 w-full">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Active Reports</p>
            <div>
              <h2 className="text-4xl leading-none font-black mb-1" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--accent-primary)' }}>{activeItems.length}</h2>
              <p className="text-xs font-bold text-slate-400">Pending resolution</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Resolved Items</p>
            <div>
              <h2 className="text-4xl leading-none font-black mb-1" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--accent-primary)' }}>{claimedItems.length}</h2>
              <p className="text-xs font-bold text-slate-400">Successfully claimed</p>
            </div>
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="flex flex-wrap gap-6 mb-10 w-full">
          {[
            { key: 'active', label: 'My Reports', count: activeItems.length },
            { key: 'claimed', label: 'Resolved', count: claimedItems.length },
          ].map(({ key, label, count }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as 'active' | 'claimed')}
                className={`py-4 px-8 rounded-full text-lg md:text-xl font-extrabold transition-all flex items-center gap-3 whitespace-nowrap w-max shrink-0 hover-lift ${isActive ? 'shadow-lg' : 'bg-slate-100 dark:bg-slate-800 opacity-70 hover:opacity-100'}`}
                style={isActive ? { background: 'var(--accent-primary)', color: '#ffffff' } : {}}
                id={`tab-${key}`}
              >
                <span>{label}</span>
                <span className={`text-sm px-3 py-1 rounded-full font-black ${isActive ? 'bg-white text-[var(--accent-primary)] shadow-sm' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Items List ─── */}
        {loadingItems ? (
          <div className="flex justify-center py-20 shrink-0 w-full">
            <Loader2 size={40} className="animate-spin text-[var(--accent-primary)]" />
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-800 shadow-sm rounded-[2rem] border border-slate-100 dark:border-slate-700 border-dashed shrink-0 w-full">
            <div className="w-20 h-20 mx-auto bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-black/20 dark:text-white/20">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white" style={{ fontFamily: 'var(--font-family-display)' }}>
              {activeTab === 'active' ? 'No active reports' : 'No resolved items'}
            </h3>
            <p className="opacity-50 text-sm mb-8 max-w-xs mx-auto text-slate-500">
              {activeTab === 'active' ? 'Lost or found something? Report it now.' : 'Items you resolve will appear here.'}
            </p>
            {activeTab === 'active' && (
              <button onClick={() => navigate('/report')} className="btn-primary px-8 py-4 text-sm shadow-xl rounded-full" id="go-report">
                <Plus size={18} /> Report an Item
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-5 shrink-0 w-full">
            {updatingId && (
              <div className="flex justify-center items-center gap-2 text-sm font-bold text-[var(--accent-primary)] mb-4 bg-[var(--accent-light)] w-fit mx-auto px-5 py-2.5 rounded-full shadow-sm">
                <Loader2 size={16} className="animate-spin" /> Updating...
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

        {displayItems.length > 0 && (
          <div className="mt-8 text-center shrink-0 w-full">
            <button onClick={() => navigate('/report')} className="btn-primary px-10 py-4 text-base shadow-xl rounded-full" id="profile-report-btn">
              <Plus size={20} /> Report Another Item
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
