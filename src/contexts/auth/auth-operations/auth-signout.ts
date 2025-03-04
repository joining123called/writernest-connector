
import { supabase } from '@/lib/supabase';
import type { Toast } from '@/hooks/use-toast';
import { AuthState } from '../types';
import { initialState } from '../AuthContext';
import { terminateSession, logSessionEvent } from '../session-management/session-utils';

export const signOut = async (
  toast: (props: Toast) => void,
  setState: (state: React.SetStateAction<AuthState>) => void,
  navigate: (path: string) => void
) => {
  try {
    // Get current session before signing out
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    
    // Log the sign out event
    if (userId) {
      await logSessionEvent(userId, 'user_logout', {});
      await terminateSession(userId);
    }
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Reset application state
    setState(initialState);
    
    // Navigate to login page
    navigate('/login');
    
    toast({
      title: "Logged out successfully",
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
  }
};
