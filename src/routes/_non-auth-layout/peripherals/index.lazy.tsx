import { createLazyFileRoute } from '@tanstack/react-router';

import { ManagePeripheralsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/peripherals/')({
  component: ManagePeripheralsPage,
});
