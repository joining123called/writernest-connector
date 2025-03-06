
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Only attempt navigation when auth state is confirmed
    if (!isLoading) {
      const navigateBasedOnUser = async () => {
        try {
          if (user) {
            console.log('User authenticated, redirecting based on role:', user.role);
            
            // Small delay to ensure state is properly updated
            setTimeout(() => {
              if (user.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
              } else if (user.role === 'writer') {
                navigate('/writer-dashboard', { replace: true });
              } else {
                navigate('/client-dashboard', { replace: true });
              }
            }, 100);
          } else {
            console.log('No user found, redirecting to login');
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Navigation error:', error);
          toast({
            title: "Navigation Issue",
            description: "There was a problem redirecting you. Taking you to login.",
            variant: "destructive",
          });
          navigate('/login', { replace: true });
        }
      };

      navigateBasedOnUser();
    }
  }, [user, isLoading, navigate, toast]);

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
