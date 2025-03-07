
import { supabase } from '@/lib/supabase';
import type { Toast } from '@/hooks/use-toast';
import { logSessionEvent } from '../session-management/session-utils';

export const deleteUser = async (
  userId: string,
  toast: (props: Toast) => void
) => {
  try {
    // Log deletion attempt
    await logSessionEvent('unknown', 'user_deletion_attempt', { 
      additionalInfo: { targetUserId: userId }
    });

    // First, check if user exists and get their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      throw new Error('User profile not found');
    }

    // Due to RLS and cascading deletes set up in our migration,
    // we can now directly delete the profile and the auth user

    // Delete profile
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      throw deleteError;
    }

    // Finally, delete the user from auth.users using admin API
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      userId
    );

    if (authDeleteError) {
      throw authDeleteError;
    }

    // Log successful deletion
    await logSessionEvent('unknown', 'user_deletion_successful', { 
      additionalInfo: { deletedUserId: userId }
    });

    toast({
      title: "User deleted",
      description: "The user has been successfully deleted.",
    });

    return { error: null };
  } catch (error: any) {
    console.error('Delete user error:', error);

    // Log deletion failure
    await logSessionEvent('unknown', 'user_deletion_failed', { 
      additionalInfo: { targetUserId: userId },
      errorMessage: error.message
    });

    toast({
      title: "Failed to delete user",
      description: error.message || "An unexpected error occurred while deleting the user",
      variant: "destructive",
    });
    return { error };
  }
};
