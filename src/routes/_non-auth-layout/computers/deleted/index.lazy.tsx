import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedComputersPage } from '@/components/pages/manage-deleted-computer.page';

export const Route = createLazyFileRoute('/_non-auth-layout/computers/deleted/')({
  component: ManageDeletedComputersPage,
});
