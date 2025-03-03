
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile } from './authService';

// Sign up function
export const signUp = async (
  email: string, 
  password: string, 
  userData: Partial<User>,
  toast: ReturnType<typeof useToast>['toast']
) => {
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

// Sign in function
export const signIn = async (
  email: string, 
  password: string,
  toast: ReturnType<typeof useToast>['toast'],
  setAuthState: (state: any) => void,
  navigate: (path: string) => void
) => {
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
      const { profile, error: profileError } = await fetchUserProfile(data.user.id);

      if (profileError) {
        toast({
          title: "Profile fetch failed",
          description: profileError.message,
          variant: "destructive",
        });
        return { error: profileError };
      }

      if (profile) {
        setAuthState({
          user: profile,
          session: data.session,
          isLoading: false,
          isAdmin: profile.role === UserRole.ADMIN,
        });

        toast({
          title: "Login successful",
          description: `Welcome back, ${profile.fullName}!`,
        });

        // Redirect based on user role
        if (profile.role === UserRole.ADMIN) {
          navigate('/admin-dashboard');
        } else if (profile.role === UserRole.WRITER) {
          navigate('/writer-dashboard');
        } else {
          navigate('/client-dashboard');
        }
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

// Sign out function
export const signOut = async (
  toast: ReturnType<typeof useToast>['toast'],
  setAuthState: (state: any) => void,
  navigate: (path: string) => void
) => {
  try {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      session: null,
      isLoading: false,
      isAdmin: false,
    });
    navigate('/login');
    toast({
      title: "Logged out successfully",
    });
    return { error: null };
  } catch (error: any) {
    toast({
      title: "Logout failed",
      description: error.message,
      variant: "destructive",
    });
    return { error };
  }
};

// Reset password function
export const resetPassword = async (
  email: string,
  toast: ReturnType<typeof useToast>['toast']
) => {
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

// Update password function
export const updatePassword = async (
  password: string,
  toast: ReturnType<typeof useToast>['toast']
) => {
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
