import type { CurrentUser } from '@/features/auth/api/auth';
import { createContext, useContext } from 'react';

export type AuthContextValue = {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  currentUser: CurrentUser | undefined;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
