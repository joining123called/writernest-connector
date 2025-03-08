
import { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  validateSession, 
  terminateSession, 
  initializeSession,
  logSessionEvent
} from '@/contexts/auth/session-management/session-utils';
import { useSessionActivity } from './use-session-activity';
import { usePlatformAppearance } from './use-platform-appearance';
import { useSessionVisibility } from './use-session-visibility';
import { SessionHookReturn } from './types';

export const useSessionCore = (): SessionHookReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValid, setIsValid] = useState<boolean>(false);
  const { toast } = useToast();
  
  const isMounted = useRef(true);
  const lastFocusTime = useRef<number>(0);
  const minimumRefreshInterval = 30000; // 30 seconds minimum between refresh operations
  const preventTabSwitchReload = useRef(true); // Prevent reloads on simple tab switches
  
  const { setupActivityListeners, cleanupActivityListeners } = useSessionActivity();
  const { applyStoredSettings } = usePlatformAppearance();
  const { handleVisibilityChange } = useSessionVisibility(session);

  const loadSession = useCallback(async () => {
    console.log('Loading session...');
    if (!isMounted.current) {
      console.log('Component unmounted, skipping session load');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }
      
      const currentSession = data.session;
      console.log('Session loaded:', currentSession ? 'Session exists' : 'No session');
      
      if (currentSession) {
        console.log('Validating session...');
        const valid = await validateSession(currentSession);
        
        if (valid) {
          console.log('Session validated successfully');
          setSession(currentSession);
          setIsValid(true);
          logSessionEvent(currentSession.user.id, 'session_validated', {});
        } else {
          console.log('Session validation failed, signing out');
          await supabase.auth.signOut({ scope: 'local' });
          setSession(null);
          setIsValid(false);
          
          if (isMounted.current) {
            toast({
              title: "Session expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive",
            });
          }
        }
      } else {
        console.log('No active session');
        setSession(null);
        setIsValid(false);
      }
    } catch (error: any) {
      console.error('Session loading error:', error);
      setSession(null);
      setIsValid(false);
      
      if (isMounted.current) {
        toast({
          title: "Session error",
          description: error.message || "Failed to load your session.",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        console.log('Session loading finished');
        setIsLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    console.log('useSession hook mounted');
    loadSession();
    lastFocusTime.current = Date.now();

    // Set up visibility change listener with modified behavior
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change in useSession: ${event}`, session ? `for user: ${session.user.id}` : 'no session');
      
      if (event === 'SIGNED_IN' && session) {
        console.log('SIGNED_IN event: Initializing session');
        await initializeSession(session);
        if (isMounted.current) {
          setSession(session);
          setIsValid(true);
          setupActivityListeners(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('SIGNED_OUT event: Terminating session');
        if (session?.user?.id) {
          await terminateSession(session.user.id);
          cleanupActivityListeners();
        }
        if (isMounted.current) {
          setSession(null);
          setIsValid(false);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('TOKEN_REFRESHED event: Updating session');
        if (isMounted.current) {
          setSession(session);
          logSessionEvent(session.user.id, 'token_refreshed', {});
        }
      } else if (event === 'USER_UPDATED' && session) {
        console.log('USER_UPDATED event: Updating session');
        if (isMounted.current) {
          setSession(session);
          logSessionEvent(session.user.id, 'user_updated', {});
        }
      }
    });

    applyStoredSettings();

    return () => {
      console.log('useSession hook unmounting');
      isMounted.current = false;
      cleanupActivityListeners();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener.subscription.unsubscribe();
    };
  }, [
    loadSession, 
    setupActivityListeners, 
    cleanupActivityListeners, 
    handleVisibilityChange,
    applyStoredSettings
  ]);

  const invalidateSession = useCallback(async () => {
    if (session?.user?.id) {
      await terminateSession(session.user.id);
      cleanupActivityListeners();
      await supabase.auth.signOut({ scope: 'local' });
      if (isMounted.current) {
        setSession(null);
        setIsValid(false);
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    }
  }, [session, toast, cleanupActivityListeners]);

  const refreshSession = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastFocusTime.current;
    
    // Prevent refreshing too frequently
    if (timeSinceLastRefresh < minimumRefreshInterval) {
      console.log('Skipping refresh - too soon since last refresh');
      return;
    }
    
    lastFocusTime.current = now;
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (data.session && isMounted.current) {
        setSession(data.session);
        if (data.session.user.id) {
          updateSessionActivity(data.session.user.id);
        }
        setIsValid(true);
      }
    } catch (error: any) {
      console.error('Session refresh error:', error);
      if (isMounted.current) {
        toast({
          title: "Session refresh failed",
          description: error.message || "Failed to refresh your session.",
          variant: "destructive",
        });
      }
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
