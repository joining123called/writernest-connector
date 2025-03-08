
import { Session } from '@supabase/supabase-js';

export interface SessionHookReturn {
  session: Session | null;
  isLoading: boolean;
  isValid: boolean;
  invalidateSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
