import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 page-container py-12">
      <div className="max-w-lg mx-auto">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{user?.name}</h1>
          <p className="text-slate-400 mb-3">{user?.email}</p>
          <span className="badge badge-found capitalize">{user?.role}</span>
          <p className="text-slate-500 text-sm mt-6">
            Full profile management coming in Day 11.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
