import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search as SearchIcon, QrCode } from 'lucide-react';

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
          onClick={() => navigate('/')}
          id="quick-browse"
        >
          <SearchIcon size={18} />
          Browse All Items
        </button>

        {/* QR Scanner decorative button */}
        <div style={{
          marginTop: '0.5rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
          onClick={() => navigate('/report')}
          id="quick-qr"
        >
          <div
            className="animate-float"
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode size={20} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              QR Scanner
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
              Scan item QR codes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
