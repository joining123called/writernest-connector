
import React, { createContext, useContext } from 'react';
import { AuthContextType, AuthState } from './types';

// Initial state
export const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAdmin: false,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const authValue = useAuthProvider();
  
  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Import the auth provider hook
import { useAuthProvider } from './useAuthProvider';
