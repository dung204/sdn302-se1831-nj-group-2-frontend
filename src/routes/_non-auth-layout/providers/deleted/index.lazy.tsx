import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedProvidersPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/providers/deleted/')({
  component: ManageDeletedProvidersPage,
});
