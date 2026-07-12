import React from 'react';
import { Shield } from 'lucide-react';

const AdminPage: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
    <Shield size={48} className="text-violet-400 mb-4" />
    <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
    <p className="text-slate-400 text-lg">
      Coming in Day 11 — admin stats, moderation, and system health.
    </p>
  </div>
);

export default AdminPage;
