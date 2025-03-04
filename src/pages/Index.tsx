
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Add console logging to debug
    console.log("Index component mounting", { user, isLoading });
    
    if (!isLoading) {
      if (user) {
        console.log("User authenticated, redirecting based on role", user.role);
        // Redirect based on user role
        if (user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.role === 'writer') {
          navigate('/writer-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      } else {
        console.log("No user, redirecting to login");
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold text-foreground">Redirecting you to the right place...</h2>
      <p className="text-muted-foreground mt-2">Please wait a moment</p>
    </div>
  );
};

export default Index;
