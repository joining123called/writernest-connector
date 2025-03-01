
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.role === 'writer') {
          navigate('/writer-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse p-4 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
      </div>
    </div>
  );
};

export default Index;
