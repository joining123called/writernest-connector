
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export enum UserRole {
  WRITER = 'writer',
  CLIENT = 'client',
  ADMIN = 'admin'
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAdmin: boolean;
}

export interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null }>;
}

export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}
