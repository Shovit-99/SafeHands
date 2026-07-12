import React from 'react';
import { Construction } from 'lucide-react';

const ReportItemPage: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
    <Construction size={48} className="text-blue-400 mb-4" />
    <h1 className="text-3xl font-bold text-white mb-2">Report an Item</h1>
    <p className="text-slate-400 text-lg">
      Coming in Day 6 — item reporting with map pin & image upload.
    </p>
  </div>
);

export default ReportItemPage;
