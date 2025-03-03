
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState } from './types';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { initialState } from './AuthContext';
import { 
  getCurrentSession, 
  fetchUserProfile, 
  setupAuthListener 
} from './services/authService';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword
} from './services/authMethods';

export const useAuthProvider = () => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user on mount and auth state change
  useEffect(() => {
    const fetchUser = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Get session
      const { data: { session } } = await getCurrentSession();

      if (session) {
        // Fetch user profile
        const { profile, error } = await fetchUserProfile(session.user.id);

        if (error) {
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
          return;
        }

        setState({
          user: profile,
          session,
          isLoading: false,
          isAdmin: profile?.role === UserRole.ADMIN,
        });
      } else {
        setState({
          user: null,
          session: null,
          isLoading: false,
          isAdmin: false,
        });
      }
    };

    fetchUser();

    const { data: { subscription } } = setupAuthListener();

    subscription.callback = () => {
      fetchUser();
    };

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    return await authSignUp(email, password, userData, toast);
  };

  const signIn = async (email: string, password: string) => {
    return await authSignIn(email, password, toast, setState, navigate);
  };

  const signOut = async () => {
    return await authSignOut(toast, setState, navigate);
  };

  const resetPassword = async (email: string) => {
    return await authResetPassword(email, toast);
  };

  const updatePassword = async (password: string) => {
    return await authUpdatePassword(password, toast);
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
