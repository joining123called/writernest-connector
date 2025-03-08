
import { useCallback, useRef } from 'react';
import { updateSessionActivity } from '@/contexts/auth/session-management/session-utils';

export const useSessionActivity = () => {
  const activityListeners = useRef<Array<() => void>>([]);

  const setupActivityListeners = useCallback((userId: string) => {
    cleanupActivityListeners();
    
    const updateActivity = () => {
      if (userId) {
        updateSessionActivity(userId);
      }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);
    
    activityListeners.current = [
      () => window.removeEventListener('mousemove', updateActivity),
      () => window.removeEventListener('keypress', updateActivity),
      () => window.removeEventListener('click', updateActivity),
      () => window.removeEventListener('scroll', updateActivity)
    ];
  }, []);

  const cleanupActivityListeners = useCallback(() => {
    activityListeners.current.forEach(removeListener => removeListener());
    activityListeners.current = [];
  }, []);

  return {
    setupActivityListeners,
    cleanupActivityListeners
  };
};
