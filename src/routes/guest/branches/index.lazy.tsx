import { createLazyFileRoute } from '@tanstack/react-router';

import { GuestBranchesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/guest/branches/')({
  component: GuestBranchesPage,
});
