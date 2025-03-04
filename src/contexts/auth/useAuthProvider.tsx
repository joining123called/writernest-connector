
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
      await fetchUser();
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state change: ${event}`, session ? `for user: ${session.user.id}` : 'no session');
      
      // The session validation is now handled by useSession hook
      if (session && isValid) {
        initAuth();
      } else if (!session) {
        setState(initialState);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearRefreshInterval();
    };
  }, [isValid, fetchUser, clearRefreshInterval]);

  // Refresh session periodically
  useEffect(() => {
    // Clean up any existing interval first
    clearRefreshInterval();
    
    if (!state.session) return;
    
    console.log('Setting up session refresh interval');
    
    // Refresh the session token every 10 minutes
    refreshIntervalRef.current = setInterval(() => {
      refreshSession();
    }, 10 * 60 * 1000);
    
    return clearRefreshInterval;
  }, [state.session, refreshSession, clearRefreshInterval]);

  // Authentication methods wrapper functions
  const signUp = useCallback(async (email: string, password: string, userData: Partial<User>) => {
    console.log('Signing up new user:', email);
    return authSignUp(email, password, userData, toast);
  }, [toast]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Sign in requested for:', email);
    return authSignIn(email, password, toast, setState, navigate);
  }, [toast, setState, navigate]);

  const signOut = useCallback(async () => {
    console.log('Sign out requested');
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
