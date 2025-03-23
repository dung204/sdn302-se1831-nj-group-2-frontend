import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageServicesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/services/')({
  component: ManageServicesPage,
});
