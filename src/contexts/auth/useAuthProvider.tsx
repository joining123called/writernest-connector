
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthState } from './types';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { initialState } from './AuthContext';
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

  // Fetch user on mount and auth state change
  useEffect(() => {
    const initAuth = async () => {
      await fetchCurrentUser(setState);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      initAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods wrapper functions
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    return authSignUp(email, password, userData, toast);
  };

  const signIn = async (email: string, password: string) => {
    return authSignIn(email, password, toast, setState, navigate);
  };

  const signOut = async () => {
    return authSignOut(toast, setState, navigate);
  };

  const resetPassword = async (email: string) => {
    return authResetPassword(email, toast);
  };

  const updatePassword = async (password: string) => {
    return authUpdatePassword(password, toast);
  };

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
