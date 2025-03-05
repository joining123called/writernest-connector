
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only attempt navigation when auth state is confirmed
    if (!isLoading) {
      setIsRedirecting(true);
      
      // Use a small timeout to prevent rapid redirections and allow for animation
      const redirectTimeout = setTimeout(() => {
        if (user) {
          // Redirect based on user role
          if (user.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
          } else if (user.role === 'writer') {
            navigate('/writer-dashboard', { replace: true });
          } else {
            navigate('/client-dashboard', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      }, 300);
      
      return () => clearTimeout(redirectTimeout);
    }
  }, [user, isLoading, navigate]);

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
    </motion.div>
  );
};

export default Index;
