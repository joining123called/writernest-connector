
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { AuthState } from '../types';

export const fetchUserProfile = async (userId: string) => {
  console.log(`Fetching profile for user ID: ${userId}`);
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, error };
  }

  console.log('Profile fetched successfully:', profile);

  const user: User = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
    // Always include reference_number if it exists
    referenceNumber: profile.reference_number || undefined,
    // Always include avatar_url if it exists
    avatarUrl: profile.avatar_url || undefined
  };

  return { profile: user, error: null };
};

export const fetchCurrentUser = async (setState: (state: React.SetStateAction<AuthState>) => void) => {
  console.log('fetchCurrentUser called, setting loading state');
  setState((prev) => ({ ...prev, isLoading: true }));

  // Get session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
    setState({
      user: null,
      session: null,
      isLoading: false,
      isAdmin: false,
    });
    return;
  }
  
  const session = sessionData.session;
  console.log('Current session:', session ? 'Session exists' : 'No session');

  if (session) {
    console.log('User ID from session:', session.user.id);
    const { profile, error } = await fetchUserProfile(session.user.id);
    
    if (error) {
      console.error('Error in fetchUserProfile:', error);
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
      });
      return;
    }

    if (!profile) {
      console.error('No profile returned for user');
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
      });
      return;
    }

    console.log('Setting auth state with profile:', profile);
    setState({
      user: profile,
      session,
      isLoading: false,
      isAdmin: profile?.role === UserRole.ADMIN,
    });
  } else {
    console.log('No session, setting auth state to null');
    setState({
      user: null,
      session: null,
      isLoading: false,
      isAdmin: false,
    });
  }
};
