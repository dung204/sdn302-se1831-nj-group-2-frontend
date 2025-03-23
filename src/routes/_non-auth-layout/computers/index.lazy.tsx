import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageComputersPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/computers/')({
  component: ManageComputersPage,
});
