
import { useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { updateSessionActivity } from '@/contexts/auth/session-management/session-utils';

export const useSessionVisibility = (session: Session | null) => {
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // Only perform minimal session activity update without triggering re-renders
      if (session?.user?.id) {
        // Just update activity timestamp in storage, no state changes
        updateSessionActivity(session.user.id);
        console.log('Tab focus returned - silently updating activity timestamp only');
      }
    }
  }, [session]);

  return { handleVisibilityChange };
};
