import { createRootRoute } from '@tanstack/react-router';

import { RootLayout } from '@/components/layouts/root.layout';
import { NotFoundPage } from '@/components/pages';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});
