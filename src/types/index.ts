
export enum UserRole {
  ADMIN = 'admin',
  WRITER = 'writer',
  CLIENT = 'client',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface FormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
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

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAdmin: boolean;
}
