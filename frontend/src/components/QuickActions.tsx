import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search as SearchIcon } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <h3 style={{
        fontSize: '0.9375rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
      }}>
        Quick Actions
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {/* Report Lost Item */}
        <button
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
          onClick={() => navigate('/report')}
          id="quick-report-lost"
        >
          <PlusCircle size={18} />
          Report Lost Item
        </button>

        {/* Report Found Item */}
        <button
          className="btn-outline-gradient"
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
          onClick={() => navigate('/report')}
          id="quick-report-found"
        >
          <PlusCircle size={18} />
          Report Found Item
        </button>

        {/* Browse Items */}
        <button
          className="btn-secondary"
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
          onClick={() => navigate('/explore')}
          id="quick-browse"
        >
          <SearchIcon size={18} />
          Browse All Items
        </button>

      </div>
    </div>
  );
};

export default QuickActions;
