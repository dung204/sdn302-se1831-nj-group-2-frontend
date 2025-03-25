import { createLazyFileRoute } from '@tanstack/react-router';

import { GuestHomePage } from '@/components/pages/guest-branches.page';

export const Route = createLazyFileRoute('/_non-auth-layout/guests/branches/$id/')({
  component: GuestHomePage,
});
