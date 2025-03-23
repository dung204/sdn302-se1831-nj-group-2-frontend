import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedServicesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/services/deleted/')({
  component: ManageDeletedServicesPage,
});
