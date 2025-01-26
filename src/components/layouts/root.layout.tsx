import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/common/providers';
import { envVariables } from '@/common/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const queryClient = new QueryClient();

const TanStackRouterDevtools =
  envVariables.MODE === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then((module) => ({
          default: module.TanStackRouterDevtools,
        })),
      );

export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollArea className="h-svh">
        <ThemeProvider>
          <Outlet />
          <Toaster closeButton richColors position="top-right" />
        </ThemeProvider>
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </ScrollArea>
    </QueryClientProvider>
  );
}
