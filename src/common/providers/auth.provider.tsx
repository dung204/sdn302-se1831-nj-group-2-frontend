import { useMutation, useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';

import { AuthContext } from '@/common/contexts';
import { localStorageService } from '@/common/services';
import { LocalStorageKey } from '@/common/types';
import type { User } from '@/common/types/api/user';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { authHttpClient, userHttpClient } from '@/lib/http';

export function AuthProvider({ children }: PropsWithChildren) {
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: res } = useQuery({
    queryFn: () => userHttpClient.getUserById(userId!),
    queryKey: ['users', 'single', { id: userId }],
    enabled: userId !== null,
  });

  const { mutateAsync: triggerRefreshToken } = useMutation({
    mutationFn: (refreshToken: string) => authHttpClient.refresh(refreshToken),
  });

  /**
   * Authenticates the user by validating the access token stored in local storage.
   * If the access token is expired, it attempts to refresh using the refresh token.
   *
   * @returns The user ID if authentication is successful, otherwise `null`.
   */
  const authenticate = useCallback(async () => {
    let accessToken: string;
    let refreshToken: string;
    let userId: string | null = null;

    try {
      accessToken = localStorageService.get(LocalStorageKey.ACCESS_TOKEN, '');

      const { exp, sub } = jwtDecode(accessToken);
      if (exp! * 1000 < Date.now()) throw new Error();

      userId = sub!;
      setUserId(userId);
      return userId;
    } catch (accessTokenError) {
      try {
        refreshToken = localStorageService.get(LocalStorageKey.REFRESH_TOKEN, '');
        const result = (await triggerRefreshToken(refreshToken)).data;

        localStorageService.set(LocalStorageKey.ACCESS_TOKEN, result.accessToken);
        localStorageService.set(LocalStorageKey.REFRESH_TOKEN, result.refreshToken);

        userId = jwtDecode(result.accessToken).sub!;
        setUserId(userId);
        return userId;
      } catch (refreshTokenError) {
        setUserId(userId);
        return userId;
      }
    }
  }, [triggerRefreshToken]);

  /**
   * Logs the user out by removing the access and refresh tokens from local storage.
   * This effectively invalidates the user's session.
   */
  const logout = () => {
    localStorageService.remove(LocalStorageKey.ACCESS_TOKEN);
    localStorageService.remove(LocalStorageKey.REFRESH_TOKEN);
  };

  // Fetch user data after authenticating
  useEffect(() => {
    (async () => {
      const userId = await authenticate();

      // If userId is null, stop the loading state
      if (!userId) {
        setIsLoading(false);
      }
    })();
  }, [authenticate]);

  // Set user after fetching user data
  useEffect(() => {
    if (res) {
      setUser(res.data);
      setIsLoading(false);
    }
  }, [res]);

  useEffect(() => {
    if (isLoading) {
      document.title = 'Loading...';
    }
  }, [isLoading]);

  return (
    <AuthContext.Provider value={{ user, authenticate, logout }}>
      {isLoading ? (
        <div className="flex h-svh w-full flex-col items-center justify-center gap-6">
          <p className="text-lg">Loading...</p>
          <LoadingIndicator className="size-16" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
