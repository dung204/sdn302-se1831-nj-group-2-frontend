import { createLazyFileRoute } from '@tanstack/react-router';

import { GuestBranchComputersPage } from '@/components/pages/guest-branches-id-computers.page';

export const Route = createLazyFileRoute('/_non-auth-layout/guests/branches/$branchId/computers/')({
  component: GuestBranchComputersPage,
});
