
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthState } from './types';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { initialState } from './AuthContext';
import { useSession } from '@/hooks/use-session';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  deleteUser as authDeleteUser,
  fetchCurrentUser
} from './auth-operations';

export const useAuthProvider = () => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    session: enhancedSession, 
    isValid, 
    refreshSession 
  } = useSession();
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);
  const minimumFetchInterval = 60000; // 1 minute minimum between user fetches
  
  const fetchUser = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;
    
    // Prevent fetching too frequently unless forced
    if (!force && timeSinceLastFetch < minimumFetchInterval) {
      console.log('Skipping user fetch - too soon since last fetch');
      return;
    }
    
    console.log('Fetching current user...');
    lastFetchTime.current = now;
    await fetchCurrentUser(setState);
  }, []);

  const clearRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    console.log('Auth provider mounted, initializing auth...');
    
    const initAuth = async () => {
      console.log('Initializing auth...');
      await fetchUser(true); // Force initial fetch
      console.log('Auth initialized, user state updated');
    };

    initAuth();

    // Completely revised visibility change handler to eliminate reloads
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.user) {
        // Simply update the last activity timestamp without fetching or reloading
        console.log('Tab returned to visible state, maintaining current app state');
        // No fetch or state change operations that would trigger re-renders
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`Auth state changed: ${_event}`, session ? 'Session exists' : 'No session');
      
      if (session && isValid) {
        console.log('Valid session detected, fetching user data');
        initAuth();
      } else if (!session) {
        console.log('No session, resetting auth state');
        setState(initialState);
      }
    });

    return () => {
      console.log('Auth provider unmounting, cleaning up');
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearRefreshInterval();
    };
  }, [isValid, fetchUser, clearRefreshInterval]);

  useEffect(() => {
    clearRefreshInterval();
    
    if (!state.session) {
      console.log('No session, not setting up refresh interval');
      return;
    }
    
    console.log('Setting up session refresh interval');
    // Extending the refresh interval to reduce unnecessary refreshes
    refreshIntervalRef.current = setInterval(() => {
      console.log('Refreshing session token');
      refreshSession();
    }, 30 * 60 * 1000); // Changed to 30 minutes from 10 minutes
    
    return clearRefreshInterval;
  }, [state.session, refreshSession, clearRefreshInterval]);

  const signUp = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    return authSignUp(email, password, userData, toast);
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    return authSignIn(email, password, toast, setState, navigate);
  }, [toast, setState, navigate]);

  const signOut = useCallback(async () => {
    return authSignOut(toast, setState, navigate);
  }, [toast, setState, navigate]);

  const resetPassword = useCallback(async (email: string) => {
    return authResetPassword(email, toast);
  }, [toast]);

  const updatePassword = useCallback(async (password: string) => {
    return authUpdatePassword(password, toast);
  }, [toast]);

  const deleteUser = useCallback(async (userId: string) => {
    return authDeleteUser(userId, toast);
  }, [toast]);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    deleteUser,
    fetchCurrentUser: fetchUser,
  };
};
