
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Function to fetch user profile from Supabase
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

  // Cast as 'any' to access reference_number
  const profileData = profile as any;
  
  const user: User = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role as UserRole,
    createdAt: profile.created_at,
    referenceNumber: profileData.reference_number || '',
  };

  return { profile: user, error: null };
};

// Function to get current session
export const getCurrentSession = async () => {
  return await supabase.auth.getSession();
};

// Set up auth state change listener
export const setupAuthListener = () => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    return { session };
  });
};
