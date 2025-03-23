import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedBranchesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/branches/deleted/')({
  component: ManageDeletedBranchesPage,
});
