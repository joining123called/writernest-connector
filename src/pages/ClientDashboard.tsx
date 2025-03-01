
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';

const ClientDashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== UserRole.CLIENT)) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-2xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>
          
          <div className="mb-8">
            <p className="text-lg">Welcome, {user?.fullName}!</p>
            <p className="text-muted-foreground">You are logged in as a Client.</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => signOut()}
            className="w-full md:w-auto"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
