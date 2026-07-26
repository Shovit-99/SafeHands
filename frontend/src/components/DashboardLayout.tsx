import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('losthub_sidebar');
    return stored ? stored === 'collapsed' : false;
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('losthub_sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Mesh background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--mesh-bg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Main content area */}
      <div
        className={`dashboard-content ${
          isMobile
            ? ''
            : sidebarCollapsed
              ? 'dashboard-content-collapsed'
              : 'dashboard-content-expanded'
        }`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <TopNavbar />

        <main className="dashboard-main">
          {children}
        </main>
      </div>

      {/* Mobile FAB */}
      {isMobile && isAuthenticated && (
        <button
          className="fab"
          onClick={() => navigate('/report')}
          title="Report Item"
          id="mobile-fab"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
};

export default DashboardLayout;
