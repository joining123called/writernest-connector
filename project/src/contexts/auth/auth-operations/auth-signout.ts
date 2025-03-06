
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
      await logSessionEvent(userId, 'user_logout_initiated', {});
      
      // Terminate the session in our metadata store
      const terminated = await terminateSession(userId);
      if (!terminated) {
        console.warn(`Failed to terminate session for user ${userId}`);
      }
    }
    
    // Sign out from Supabase, but only for this browser session
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    
    if (error) {
      console.error('Signout API error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    // Reset application state before navigation
    setState(initialState);
    
    // Navigate to login page immediately after state reset
    navigate('/login');
    
    // Log completion of signout
    if (userId) {
      // This won't be associated with the user anymore
      await logSessionEvent('unknown', 'user_logout_completed', { 
        additionalInfo: { previousUserId: userId }
      });
    }
    
    toast({
      title: "Logged out successfully",
      description: "You have been securely logged out.",
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    toast({
      title: "Logout failed",
      description: error.message || "An unexpected error occurred during logout",
      variant: "destructive",
    });
    // Ensure we still navigate to login even if there's an error
    navigate('/login');
  }
};
