
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
  if (!email || !password) {
    toast({
      title: "Missing credentials",
      description: "Please provide both email and password.",
      variant: "destructive",
    });
    return { error: new Error("Missing credentials") };
  }
  
  try {
    // Log the sign-in attempt (without the password!)
    await logSessionEvent('unknown', 'login_attempt', { 
      additionalInfo: { email } 
    });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log failed login attempt
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

    if (!data.user || !data.session) {
      const errorMsg = "Authentication successful but user data is missing";
      toast({
        title: "Login error",
        description: errorMsg,
        variant: "destructive",
      });
      return { error: new Error(errorMsg) };
    }

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
      description: `Welcome back, ${profile.full_name || 'User'}!`,
    });

    // Redirect based on user role
    if (user.role === UserRole.ADMIN) {
      navigate('/admin-dashboard');
    } else if (user.role === UserRole.WRITER) {
      navigate('/writer-dashboard');
    } else {
      navigate('/client-dashboard');
    }

    return { error: null };
  } catch (err: any) {
    // Log unexpected error
    await logSessionEvent('unknown', 'login_error', { 
      additionalInfo: { email },
      errorMessage: err.message 
    });
    
    console.error('Login error:', err);
    
    toast({
      title: "An unexpected error occurred",
      description: err.message || "An unknown error occurred during login",
      variant: "destructive",
    });
    return { error: err };
  }
};
