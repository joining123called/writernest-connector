
import { User, UserRole } from '@/types';

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}
