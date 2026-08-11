import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Search as SearchIcon, Shield, Box
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { updateItem, deleteItem } from '../api/items';
import type { Item, ItemStatus } from '../types';

import StatCard from '../components/StatCard';
import RecentReportsTable from '../components/RecentReportsTable';
import QuickActions from '../components/QuickActions';
import ActivityTimeline from '../components/ActivityTimeline';
import AnalyticsCard from '../components/AnalyticsCard';
import MessagesPreview from '../components/MessagesPreview';

// ─── Delete Modal ─────────────────────────────────────────────────────────────
interface DeleteModalProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ item, onConfirm, onCancel }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)',
    }}
  >
    <div
      className="card animate-fadeInUp"
      style={{ padding: '2rem', maxWidth: 400, width: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <AlertTriangle size={24} style={{ color: '#EF4444' }} />
        </div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Delete Report?</h3>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        This will permanently delete <strong>"{item.title}"</strong>. This action cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onCancel} className="btn-secondary" style={{ flex: 1, padding: '0.75rem' }} id="delete-cancel">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '0.75rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = '#EF4444';
            (e.target as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)';
            (e.target as HTMLButtonElement).style.color = '#EF4444';
          }}
          id="delete-confirm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [_updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoadingItems(true);
    api
      .get('/items/mine')
      .then(({ data }) => setMyItems(data.data as Item[]))
      .catch(() => toast.error('Failed to load your items.'))
      .finally(() => setLoadingItems(false));
  }, []);

  const lostItems = myItems.filter((i) => i.status === 'Lost');
  const foundItems = myItems.filter((i) => i.status === 'Found');
  const claimedItems = myItems.filter((i) => i.status === 'Claimed');

  const successRate = myItems.length > 0 ? Math.round((claimedItems.length / myItems.length) * 100) : 0;

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id);
      setMyItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      toast.success('Report deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (!user) return null;

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          item={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div style={{ maxWidth: 1280 }}>
        {/* ═══ Row 1: Stat Cards ═══ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <StatCard
            icon={Box}
            iconBg="rgba(0, 136, 255, 0.15)"
            iconColor="#7C3AED"
            label="Total Reports"
            value={myItems.length}
            delay={0}
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="rgba(239, 68, 68, 0.12)"
            iconColor="#EF4444"
            label="Lost Items"
            value={lostItems.length}
            suffix=""
            delay={100}
          />
          <StatCard
            icon={SearchIcon}
            iconBg="rgba(0, 136, 255, 0.12)"
            iconColor="#0088FF"
            label="Found Items"
            value={foundItems.length}
            delay={200}
          />
          <StatCard
            icon={Shield}
            iconBg="rgba(59, 130, 246, 0.12)"
            iconColor="#3B82F6"
            label="Success Rate"
            value={successRate}
            suffix="%"
            delay={300}
          />
        </div>

        {/* ═══ Row 2: Reports Table + Quick Actions ═══ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
          className="dashboard-row-2"
        >
          <RecentReportsTable
            items={myItems.slice(0, 8)}
            onStatusChange={handleStatusChange}
            onDelete={setDeleteTarget}
            loading={loadingItems}
          />
          <QuickActions />
        </div>

        {/* ═══ Row 3: Timeline + Analytics + Messages/Notifications ═══ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '1rem',
          }}
          className="dashboard-row-3"
        >
          <ActivityTimeline />
          <AnalyticsCard
            data={{
              lost: lostItems.length,
              found: foundItems.length,
              claimed: claimedItems.length,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <MessagesPreview />
          </div>
        </div>
      </div>

      {/* ─── Responsive grid overrides ─── */}
      <style>{`
        @media (max-width: 1024px) {
          .dashboard-row-2 {
            grid-template-columns: 1fr !important;
          }
          .dashboard-row-3 {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard-row-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default ProfilePage;
