import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AdminDashboard from '@/pages/AdminDashboard';
import WriterDashboard from '@/pages/WriterDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import ProfilePage from '@/pages/ProfilePage';
import AdminLogin from './pages/AdminLogin';
import AdminSettings from './pages/AdminSettings';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <useAuth.Provider>{children}</useAuth.Provider>;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/profile" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/profile" />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />

      {/* Role-based routing */}
      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/client-dashboard/*" element={<ClientDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-dashboard/settings" element={<AdminSettings />} />
        <Route path="/writer-dashboard" element={<WriterDashboard />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to={user ? "/profile" : "/login"} />} />
    </Routes>
  );
};

const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default App;
