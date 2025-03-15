import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageUsageTrackingDeletedPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/usage-tracking/deleted/')({
  component: ManageUsageTrackingDeletedPage,
});
