
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import type { Toast } from '@/hooks/use-toast';
import { logSessionEvent } from '../session-management/session-utils';

export const signUp = async (
  email: string, 
  password: string, 
  userData: Partial<User>,
  toast: (props: Toast) => void
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
    // Log signup attempt (without sensitive data)
    await logSessionEvent('unknown', 'signup_attempt', { 
      additionalInfo: { email } 
    });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: userData.fullName,
          phone: userData.phone,
          role: userData.role || UserRole.CLIENT, // Default to CLIENT if no role provided
        },
      },
    });

    if (error) {
      // Log failed signup
      await logSessionEvent('unknown', 'signup_failed', { 
        additionalInfo: { email },
        errorMessage: error.message 
      });
      
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    // Log successful signup
    if (data.user) {
      await logSessionEvent(data.user.id, 'signup_successful', {});
    }

    toast({
      title: "Account created successfully!",
      description: "Please check your email for verification instructions.",
    });

    return { error: null };
  } catch (err: any) {
    // Log unexpected error
    await logSessionEvent('unknown', 'signup_error', { 
      additionalInfo: { email },
      errorMessage: err.message 
    });
    
    console.error('Signup error:', err);
    
    toast({
      title: "An unexpected error occurred",
      description: err.message || "An unknown error occurred during registration",
      variant: "destructive",
    });
    return { error: err };
  }
};
