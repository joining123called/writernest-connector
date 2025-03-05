
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Only attempt navigation when auth state is confirmed
    if (!isLoading) {
      setIsRedirecting(true);
      
      // Use a small timeout to prevent rapid redirections and allow for animation
      const redirectTimeout = setTimeout(() => {
        if (user) {
          console.log('User authenticated, redirecting based on role:', user.role);
          // Redirect based on user role
          if (user.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else if (user.role === 'writer') {
            navigate('/writer-dashboard', { replace: true });
          } else {
            navigate('/client-dashboard', { replace: true });
          }
        } else {
          console.log('No user found, redirecting to login');
          navigate('/login', { replace: true });
        }
      }, 300);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [user, isLoading, navigate]);

  // Add an additional effect to handle potential deadlocks
  useEffect(() => {
    // If we're still on this page after 5 seconds, force redirect to login
    const fallbackTimer = setTimeout(() => {
      if (isRedirecting && redirectAttempts < 3) {
        console.log('Redirect taking too long, trying again...');
        setRedirectAttempts(prev => prev + 1);
        
        // If still stuck, force navigate to login
        if (redirectAttempts >= 2) {
          console.log('Redirect failed multiple times, forcing navigation to login');
          toast({
            title: "Navigation Issue",
            description: "Had trouble redirecting automatically. Taking you to the login page.",
            variant: "destructive",
          });
          navigate('/login', { replace: true });
        }
      }
    }, 5000);
    
    return () => clearTimeout(fallbackTimer);
  }, [isRedirecting, redirectAttempts, navigate, toast]);

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-semibold text-foreground">Redirecting you to the right place...</h2>
      <p className="text-muted-foreground mt-2">Please wait a moment</p>
      {redirectAttempts > 0 && (
        <button 
          onClick={() => navigate('/login', { replace: true })}
          className="mt-6 text-primary hover:underline"
        >
          Click here to go to login
        </button>
      )}
    </motion.div>
  );
};

export default Index;
