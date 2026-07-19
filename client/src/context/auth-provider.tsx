import { useCallback, useMemo, type PropsWithChildren } from 'react';

import { queryClient } from '../services/queryClient';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';
import { fetchCurrentUser, getAccessToken, logoutUser } from '@/features/auth/api/auth';
import { useQuery } from '@tanstack/react-query';
import { APP_QUERY_KEYS } from '@/constants/queryKeys';

let isFirstMount = true;

type AuthProviderProps = PropsWithChildren;
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: APP_QUERY_KEYS.auth.me,
    queryFn: async () => {
      isFirstMount = false;
      return fetchCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: isFirstMount || !!getAccessToken(),
  });

  const signOut = useCallback(async () => {
    await logoutUser();
    queryClient.setQueryData(APP_QUERY_KEYS.auth.me, null);
    queryClient.removeQueries({ queryKey: APP_QUERY_KEYS.auth.me });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(currentUser),
      isAdmin: currentUser?.role === 'Admin',
      isLoading,
      currentUser,
      signOut,
    }),
    [currentUser, isLoading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
