
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { AuthState } from '../types';
import { logSessionEvent } from '../session-management/session-utils';

export const fetchUserProfile = async (userId: string) => {
  console.log(`Fetching profile for user ID: ${userId}`);
  
  try {
    // Get the profile data directly without admin check
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Changed from single() to maybeSingle()

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      
      // Get user metadata from auth session
      const { data: { session } } = await supabase.auth.getSession();
      const metadata = session?.user?.user_metadata;
      
      if (metadata) {
        // Create default profile from metadata
        const defaultProfile = {
          id: userId,
          email: session?.user?.email || '',
          full_name: metadata.fullName || '',
          phone: metadata.phone || '',
          role: metadata.role || UserRole.CLIENT,
          created_at: new Date().toISOString()
        };

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          return { profile: null, error: createError };
        }

        await logSessionEvent(userId, 'profile_created', {
          additionalInfo: { email: defaultProfile.email }
        });

        return { 
          profile: {
            id: newProfile.id,
            email: newProfile.email,
            fullName: newProfile.full_name,
            phone: newProfile.phone,
            role: newProfile.role as UserRole,
            createdAt: newProfile.created_at,
            referenceNumber: newProfile.reference_number,
            avatarUrl: newProfile.avatar_url
          } as User, 
          error: null 
        };
      }

      return { profile: null, error: profileError };
    }

    if (!profile) {
      console.error('Profile not found');
      return { profile: null, error: new Error('Profile not found') };
    }

    console.log('Profile fetched successfully:', profile);

    const user: User = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      role: profile.role as UserRole,
      createdAt: profile.created_at,
      referenceNumber: profile.reference_number || undefined,
      avatarUrl: profile.avatar_url || undefined
    };

    return { profile: user, error: null };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return { profile: null, error };
  }
};

export const fetchCurrentUser = async (setState: (state: React.SetStateAction<AuthState>) => void) => {
  console.log('fetchCurrentUser called, setting loading state');
  setState((prev) => ({ ...prev, isLoading: true }));

  try {
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

    if (!session) {
      console.log('No session, setting auth state to null');
      setState({
        user: null,
        session: null,
        isLoading: false,
        isAdmin: false,
      });
      return;
    }

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

    await logSessionEvent(session.user.id, 'user_profile_loaded', {});

    console.log('Setting auth state with profile:', profile);
    setState({
      user: profile,
      session,
      isLoading: false,
      isAdmin: profile?.role === UserRole.ADMIN,
    });
  } catch (error) {
    console.error('Error in fetchCurrentUser:', error);
    setState({
      user: null,
      session: null,
      isLoading: false,
      isAdmin: false,
    });
  }
};
