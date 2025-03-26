import { createLazyFileRoute } from '@tanstack/react-router';

import { GuestComputersPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/guest/computers/')({
  component: GuestComputersPage,
});
