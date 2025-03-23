import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedPositionsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/positions/deleted/')({
  component: ManageDeletedPositionsPage,
});
