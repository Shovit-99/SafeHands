import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import HomePage from './pages/HomePage';

// Lazy load heavy pages
const ItemDetailPage = React.lazy(() => import('./pages/ItemDetailPage'));
const ReportItemPage = React.lazy(() => import('./pages/ReportItemPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

const SuspenseFallback = () => (
  <div style={{
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  }}>
    <div className="spinner" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#151B2F',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#151B2F' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#151B2F' } },
          }}
        />

        <Routes>
          {/* Public Auth Routes (no Dashboard shell) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* All app routes wrapped in Dashboard Layout */}
          <Route
            path="/*"
            element={
              <DashboardLayout>
                <React.Suspense fallback={<SuspenseFallback />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/items/:id" element={<ItemDetailPage />} />

                    <Route
                      path="/report"
                      element={
                        <ProtectedRoute>
                          <ReportItemPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chat/:chatId?"
                      element={
                        <ProtectedRoute>
                          <ChatPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin>
                          <AdminPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <SettingsPage />
                        </ProtectedRoute>
                      }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </React.Suspense>
              </DashboardLayout>
            }
          />
        </Routes>
        </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
