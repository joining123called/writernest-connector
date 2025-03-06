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
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    // Delete all related records first
    // This is important to prevent foreign key constraint violations

    // 1. Delete wallet transactions
    const { error: walletTransactionError } = await supabase
      .from('wallet_transactions')
      .delete()
      .eq('wallet_id', (subquery) => 
        subquery.from('wallets')
          .select('id')
          .eq('user_id', userId)
      );

    if (walletTransactionError) {
      console.error('Error deleting wallet transactions:', walletTransactionError);
    }

    // 2. Delete wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .delete()
      .eq('user_id', userId);

    if (walletError) {
      console.error('Error deleting wallet:', walletError);
    }

    // 3. Delete assignment files
    const { error: filesError } = await supabase
      .from('assignment_files')
      .delete()
      .eq('assignment_id', (subquery) => 
        subquery.from('assignment_details')
          .select('id')
          .eq('user_id', userId)
      );

    if (filesError) {
      console.error('Error deleting assignment files:', filesError);
    }

    // 4. Delete assignments
    const { error: assignmentsError } = await supabase
      .from('assignment_details')
      .delete()
      .eq('user_id', userId);

    if (assignmentsError) {
      console.error('Error deleting assignments:', assignmentsError);
    }

    // 5. Delete profile (this should cascade to auth.users due to foreign key)
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