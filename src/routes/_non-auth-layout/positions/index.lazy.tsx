import { createLazyFileRoute } from '@tanstack/react-router';

import { ManagePositionsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/positions/')({
  component: ManagePositionsPage,
});
