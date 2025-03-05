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
  
  // Use a ref to avoid unnecessary re-renders
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoized fetchUser function
  const fetchUser = useCallback(async () => {
    console.log('Fetching current user...');
    await fetchCurrentUser(setState);
  }, []);

  // Clean up function for interval
  const clearRefreshInterval = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Fetch user on mount and auth state change
  useEffect(() => {
    console.log('Auth provider mounted, initializing auth...');
    
    const initAuth = async () => {
      console.log('Initializing auth...');
      await fetchUser();
      console.log('Auth initialized, user state updated');
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`Auth state changed: ${_event}`, session ? 'Session exists' : 'No session');
      
      // The session validation is now handled by useSession hook
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
      clearRefreshInterval();
    };
  }, [isValid, fetchUser, clearRefreshInterval]);

  // Refresh session periodically
  useEffect(() => {
    // Clean up any existing interval first
    clearRefreshInterval();
    
    if (!state.session) {
      console.log('No session, not setting up refresh interval');
      return;
    }
    
    console.log('Setting up session refresh interval');
    // Refresh the session token every 10 minutes
    refreshIntervalRef.current = setInterval(() => {
      console.log('Refreshing session token');
      refreshSession();
    }, 10 * 60 * 1000);
    
    return clearRefreshInterval;
  }, [state.session, refreshSession, clearRefreshInterval]);

  // Authentication methods wrapper functions
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

  // Return the state and methods
  return {
    ...state,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
};
