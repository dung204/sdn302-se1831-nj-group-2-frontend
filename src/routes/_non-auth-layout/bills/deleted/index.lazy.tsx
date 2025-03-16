import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedBillsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/bills/deleted/')({
  component: ManageDeletedBillsPage,
});
