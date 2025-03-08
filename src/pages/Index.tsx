
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only attempt navigation when auth state is confirmed and we haven't navigated yet
    if (!isLoading && !hasNavigated.current) {
      console.log('Auth state confirmed, user:', user ? 'exists' : 'null');
      
      if (user) {
        console.log('User authenticated, redirecting based on role:', user.role);
        hasNavigated.current = true;
        
        // Delay slightly to ensure state is properly updated
        setTimeout(() => {
          try {
            if (user.role === 'admin') {
              navigate('/admin-dashboard', { replace: true });
            } else if (user.role === 'writer') {
              navigate('/writer-dashboard', { replace: true });
            } else {
              navigate('/client-dashboard', { replace: true });
            }
          } catch (e) {
            console.error('Navigation error:', e);
            toast({
              title: "Navigation Issue",
              description: "There was a problem redirecting you. Taking you to login.",
              variant: "destructive",
            });
            navigate('/login', { replace: true });
          }
        }, 100);
      } else {
        console.log('No user found, redirecting to login');
        hasNavigated.current = true;
        navigate('/login', { replace: true });
      }
    }
  }, [user, isLoading, navigate, toast]);
  
  // Reset navigation flag if component is unmounted and remounted
  useEffect(() => {
    return () => {
      hasNavigated.current = false;
    };
  }, []);

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
