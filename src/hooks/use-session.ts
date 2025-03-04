
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  validateSession, 
  updateSessionActivity, 
  terminateSession, 
  initializeSession,
  logSessionEvent,
  isSessionInactive,
  INACTIVITY_TIMEOUT,
  getSessionStorageKey
} from '@/contexts/auth/session-management/session-utils';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean>(false);
  const { toast } = useToast();

  // Load and validate session
  const loadSession = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get current session from Supabase
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      
      if (currentSession) {
        // Validate session
        const valid = await validateSession(currentSession);
        
        if (valid) {
          setSession(currentSession);
          setIsValid(true);
          logSessionEvent(currentSession.user.id, 'session_validated', {});
        } else {
          // Session is invalid, clear it
          await supabase.auth.signOut({ scope: 'local' }); // Only sign out this tab/browser
          setSession(null);
          setIsValid(false);
          toast({
            title: "Session expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
        }
      } else {
        setSession(null);
        setIsValid(false);
      }
    } catch (error: any) {
      console.error('Session loading error:', error);
      setSession(null);
      setIsValid(false);
      toast({
        title: "Session error",
        description: error.message || "Failed to load your session.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Monitor user activity to extend session
  useEffect(() => {
    if (!session || !isValid) return;

    // Update session on user activity
    const updateActivity = () => {
      if (session) {
        updateSessionActivity(session.user.id);
      }
    };

    // Attach activity listeners
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // Check for inactivity periodically
    const inactivityCheck = setInterval(() => {
      if (session && isSessionInactive(session.user.id)) {
        // Auto logout after inactivity
        supabase.auth.signOut({ scope: 'local' }).then(() => { // Only sign out this tab/browser
          setSession(null);
          setIsValid(false);
          toast({
            title: "Session expired",
            description: "Your session has expired due to inactivity.",
            variant: "destructive",
          });
        });
      }
    }, 60000); // Check every minute

    return () => {
      // Clean up listeners
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(inactivityCheck);
    };
  }, [session, isValid, toast]);

  // Listen for auth state changes
  useEffect(() => {
    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`, session ? `for user: ${session.user.id}` : 'no session');
      
      if (event === 'SIGNED_IN' && session) {
        // Initialize a new session
        await initializeSession(session);
        setSession(session);
        setIsValid(true);
      } else if (event === 'SIGNED_OUT') {
        if (session) {
          await terminateSession(session.user.id);
        }
        setSession(null);
        setIsValid(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Updated session with refreshed token
        setSession(session);
        logSessionEvent(session.user.id, 'token_refreshed', {});
      } else if (event === 'USER_UPDATED' && session) {
        // User data was updated
        setSession(session);
        logSessionEvent(session.user.id, 'user_updated', {});
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadSession]);

  // Force sign out
  const invalidateSession = useCallback(async () => {
    if (session) {
      await terminateSession(session.user.id);
      await supabase.auth.signOut({ scope: 'local' }); // Only sign out this tab/browser
      setSession(null);
      setIsValid(false);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  }, [session, toast]);

  // Refresh session manually
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        updateSessionActivity(data.session.user.id);
        setIsValid(true);
      }
    } catch (error: any) {
      console.error('Session refresh error:', error);
      toast({
        title: "Session refresh failed",
        description: error.message || "Failed to refresh your session.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    session,
    isLoading,
    isValid,
    invalidateSession,
    refreshSession,
  };
};
