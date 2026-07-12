import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import HomePage from './pages/HomePage';

// Lazy load heavy pages
const ItemDetailPage = React.lazy(() => import('./pages/ItemDetailPage'));
const ReportItemPage = React.lazy(() => import('./pages/ReportItemPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

const SuspenseFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh]">
    <div className="spinner" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e2537',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#1e2537' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#1e2537' } },
            }}
          />

          <Routes>
            {/* Public Auth Routes (no Navbar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main App Routes (with Navbar) */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
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

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </React.Suspense>
                </>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
