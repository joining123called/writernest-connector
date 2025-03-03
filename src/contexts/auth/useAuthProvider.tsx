
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { AuthState } from './types';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { initialState } from './AuthContext';

export const useAuthProvider = () => {
  const [state, setState] = useState<AuthState>(initialState);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user on mount and auth state change
  useEffect(() => {
    const fetchUser = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Get session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Fetch user profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setState({
            user: null,
            session: null,
            isLoading: false,
            isAdmin: false,
          });
          return;
        }

        const user: User = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role as UserRole,
          createdAt: profile.created_at,
        };

        setState({
          user,
          session,
          isLoading: false,
          isAdmin: user.role === UserRole.ADMIN,
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Authentication methods
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName: userData.fullName,
            phone: userData.phone,
            role: userData.role,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email for verification instructions.",
      });

      return { error: null };
    } catch (err: any) {
      toast({
        title: "An unexpected error occurred",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          toast({
            title: "Profile fetch failed",
            description: profileError.message,
            variant: "destructive",
          });
          return { error: profileError };
        }

        const user: User = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          phone: profile.phone,
          role: profile.role as UserRole,
          createdAt: profile.created_at,
        };

        setState({
          user,
          session: data.session,
          isLoading: false,
          isAdmin: user.role === UserRole.ADMIN,
        });

        toast({
          title: "Login successful",
          description: `Welcome back, ${profile.full_name}!`,
        });

        // Redirect based on user role
        if (user.role === UserRole.ADMIN) {
          navigate('/admin-dashboard');
        } else if (user.role === UserRole.WRITER) {
          navigate('/writer-dashboard');
        } else {
          navigate('/client-dashboard');
        }
      }

      return { error: null };
    } catch (err: any) {
      toast({
        title: "An unexpected error occurred",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
      });
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

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions.",
      });
      return { error: null };
    } catch (err: any) {
      toast({
        title: "An unexpected error occurred",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password updated successfully",
        description: "You can now login with your new password.",
      });
      return { error: null };
    } catch (err: any) {
      toast({
        title: "An unexpected error occurred",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
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
