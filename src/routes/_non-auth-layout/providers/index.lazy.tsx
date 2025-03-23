import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageProvidersPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/providers/')({
  component: ManageProvidersPage,
});
