
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import type { Toast } from '@/hooks/use-toast';
import { AuthState } from '../types';
import { initializeSession, logSessionEvent } from '../session-management/session-utils';

export const signIn = async (
  email: string, 
  password: string,
  toast: (props: Toast) => void,
  setState: (state: React.SetStateAction<AuthState>) => void,
  navigate: (path: string) => void
) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log failed login attempt with email in additionalInfo
      await logSessionEvent('unknown', 'login_failed', { 
        additionalInfo: { email },
        errorMessage: error.message 
      });
      
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }

    if (data.user) {
      // Log successful login
      await logSessionEvent(data.user.id, 'login_successful', {});
      
      // Initialize a new session
      await initializeSession(data.session);
      
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
    // Log unexpected error
    await logSessionEvent('unknown', 'login_error', { 
      additionalInfo: { email },
      errorMessage: err.message 
    });
    
    toast({
      title: "An unexpected error occurred",
      description: err.message,
      variant: "destructive",
    });
    return { error: err };
  }
};
