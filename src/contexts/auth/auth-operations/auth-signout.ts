
import { supabase } from '@/lib/supabase';
import type { Toast } from '@/hooks/use-toast';
import { AuthState } from '../types';
import { initialState } from '../AuthContext';

export const signOut = async (
  toast: (props: Toast) => void,
  setState: (state: React.SetStateAction<AuthState>) => void,
  navigate: (path: string) => void
) => {
  try {
    await supabase.auth.signOut();
    setState(initialState);
    navigate('/login');
    toast({
      title: "Logged out successfully",
    });
  } catch (error: any) {
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
  }
};
