import { useMutation, useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { type PropsWithChildren, useEffect, useState } from 'react';

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

  const { data } = useQuery({
    queryFn: () => userHttpClient.getUserById(userId!),
    queryKey: ['users', 'single', { id: userId }],
    enabled: userId !== null,
  });

  const { mutateAsync: triggerRefreshToken } = useMutation({
    mutationFn: (refreshToken: string) => authHttpClient.refresh(refreshToken),
  });

  useEffect(() => {
    (async () => {
      let accessToken: string;
      let refreshToken: string;

      try {
        accessToken = localStorageService.get(LocalStorageKey.ACCESS_TOKEN, '');

        const { exp, sub } = jwtDecode(accessToken);
        if (exp! * 1000 < Date.now()) throw new Error();

        setUserId(sub!);
      } catch (accessTokenError) {
        refreshToken = localStorageService.get(
          LocalStorageKey.REFRESH_TOKEN,
          '',
        );
        const result = (await triggerRefreshToken(refreshToken)).data;

        localStorageService.set(
          LocalStorageKey.ACCESS_TOKEN,
          result.accessToken,
        );
        localStorageService.set(
          LocalStorageKey.REFRESH_TOKEN,
          result.refreshToken,
        );

        setUserId(jwtDecode(result.accessToken).sub!);
      }
    })();
  }, []);

  useEffect(() => {
    if (data) {
      setUser(data.data);
      setIsLoading(false);
    }
  }, [data]);

  return (
    <AuthContext.Provider value={{ user }}>
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
