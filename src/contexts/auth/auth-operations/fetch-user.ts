
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { AuthState } from '../types';

export const fetchUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return { profile: null, error };
  }

  const user: User = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
    avatarUrl: profile.avatar_url || undefined,
    bio: profile.bio || undefined, // Added bio field
  };

  return { profile: user, error: null };
};

export const fetchCurrentUser = async (setState: (state: React.SetStateAction<AuthState>) => void) => {
  setState((prev) => ({ ...prev, isLoading: true }));

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    const { profile, error } = await fetchUserProfile(session.user.id);
    
    if (error) {
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
      });
      return;
    }

    setState({
      user: profile,
      session,
      isLoading: false,
      isAdmin: profile?.role === UserRole.ADMIN,
    });
  } else {
    setState({
      user: null,
      session: null,
      isLoading: false,
      isAdmin: false,
    });
  }
};
