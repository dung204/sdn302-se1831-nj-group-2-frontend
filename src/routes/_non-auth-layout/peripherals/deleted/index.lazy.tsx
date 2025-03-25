import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedPeripheralsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/peripherals/deleted/')({
  component: ManageDeletedPeripheralsPage,
});
