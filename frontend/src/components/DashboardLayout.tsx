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
    const stored = localStorage.getItem('safehands_sidebar');
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
      localStorage.setItem('safehands_sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  return (
    <div className="dashboard-layout">
      {/* Vault Wires Background */}
      <div className="bg-wires">
        <div className="wire wire-1"></div>
        <div className="wire wire-2"></div>
        <div className="wire wire-3"></div>
      </div>

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
