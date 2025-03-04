
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { ToastProps } from '@/hooks/use-toast';

export const signUp = async (
  email: string, 
  password: string, 
  userData: Partial<User>,
  toast: (props: ToastProps) => void
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
