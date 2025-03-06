
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { User, UserRole } from '@/types';

// Constants for session configuration
export const SESSION_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Type definitions for session data
export interface SessionMetadata {
  lastActive: number;
  userAgent: string;
  ipAddress?: string;
  deviceInfo?: string;
  email?: string;
  errorMessage?: string;
  additionalInfo?: Record<string, any>;
}

export interface EnhancedSession {
  session: Session;
  metadata: SessionMetadata;
}

/**
 * Get the storage key for a specific user's session metadata
 */
export const getSessionStorageKey = (userId: string): string => {
  return `session_metadata_${userId}`;
};

/**
 * Get a list of all active session user IDs
 */
export const getActiveSessionUserIds = (): string[] => {
  const userIds: string[] = [];
  
  try {
    // Look through localStorage for all session metadata keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('session_metadata_')) {
        const userId = key.replace('session_metadata_', '');
        userIds.push(userId);
      }
    }
  } catch (error) {
    console.error('Failed to get active session user IDs:', error);
  }
  
  return userIds;
};

/**
 * Initialize a new session with metadata
 */
export const initializeSession = async (session: Session): Promise<boolean> => {
  if (!session?.user?.id) return false;
  
  try {
    // Create session metadata
    const metadata: SessionMetadata = {
      lastActive: Date.now(),
      userAgent: navigator.userAgent,
    };
    
    // Store session metadata in local storage (encrypted in a real implementation)
    localStorage.setItem(getSessionStorageKey(session.user.id), JSON.stringify(metadata));
    
    // Log session creation
    await logSessionEvent(session.user.id, 'session_created', metadata);
    
    return true;
  } catch (error) {
    console.error('Failed to initialize session:', error);
    return false;
  }
};

/**
 * Update session activity timestamp
 */
export const updateSessionActivity = (userId: string): boolean => {
  if (!userId) return false;
  
  try {
    const storageKey = getSessionStorageKey(userId);
    const metadataStr = localStorage.getItem(storageKey);
    if (!metadataStr) return false;
    
    const metadata: SessionMetadata = JSON.parse(metadataStr);
    metadata.lastActive = Date.now();
    
    localStorage.setItem(storageKey, JSON.stringify(metadata));
    return true;
  } catch (error) {
    console.error('Failed to update session activity:', error);
    return false;
  }
};

/**
 * Check if session is expired due to inactivity
 */
export const isSessionInactive = (userId: string): boolean => {
  if (!userId) return true;
  
  try {
    const storageKey = getSessionStorageKey(userId);
    const metadataStr = localStorage.getItem(storageKey);
    if (!metadataStr) return true;
    
    const metadata: SessionMetadata = JSON.parse(metadataStr);
    const currentTime = Date.now();
    
    return (currentTime - metadata.lastActive) > INACTIVITY_TIMEOUT;
  } catch (error) {
    console.error('Failed to check session activity:', error);
    return true;
  }
};

/**
 * Validate session
 */
export const validateSession = async (session: Session | null): Promise<boolean> => {
  if (!session?.user?.id) return false;
  
  try {
    // Check if session is expired by time
    const { expires_at } = session;
    if (expires_at && new Date(expires_at * 1000) < new Date()) return false;
    
    // Check if session is inactive
    if (isSessionInactive(session.user.id)) return false;
    
    // Update session activity
    updateSessionActivity(session.user.id);
    
    return true;
  } catch (error) {
    console.error('Failed to validate session:', error);
    return false;
  }
};

/**
 * Terminate session
 */
export const terminateSession = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Remove session metadata from local storage
    localStorage.removeItem(getSessionStorageKey(userId));
    
    // Log session termination
    await logSessionEvent(userId, 'session_terminated', {});
    return true;
  } catch (error) {
    console.error('Failed to terminate session:', error);
    return false;
  }
};

/**
 * Log session event to Supabase
 */
export const logSessionEvent = async (
  userId: string, 
  eventType: string, 
  metadata: Partial<SessionMetadata>
): Promise<void> => {
  if (!userId) {
    console.warn('Cannot log session event: No user ID provided');
    return;
  }
  
  try {
    // In a production environment, you would log to a separate table
    console.log(`[SESSION_LOG] User: ${userId}, Event: ${eventType}, Time: ${new Date().toISOString()}`, metadata);
    
    // This would be implemented with a proper database table in production
    // await supabase.from('session_logs').insert({
    //   user_id: userId,
    //   event_type: eventType,
    //   metadata,
    //   created_at: new Date()
    // });
  } catch (error) {
    console.error('Failed to log session event:', error);
  }
};

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  try {
    const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
    
    // Store token in session storage (more secure than localStorage)
    sessionStorage.setItem('csrf_token', token);
    
    return token;
  } catch (error) {
    console.error('Failed to generate CSRF token:', error);
    return '';
  }
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string): boolean => {
  if (!token) return false;
  
  try {
    const storedToken = sessionStorage.getItem('csrf_token');
    return token === storedToken;
  } catch (error) {
    console.error('Failed to validate CSRF token:', error);
    return false;
  }
};
