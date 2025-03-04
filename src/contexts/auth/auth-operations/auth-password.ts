
import { supabase } from '@/lib/supabase';
import { ToastProps } from '@/hooks/use-toast';

export const resetPassword = async (
  email: string,
  toast: (props: ToastProps) => void
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

export const updatePassword = async (
  password: string,
  toast: (props: ToastProps) => void
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
