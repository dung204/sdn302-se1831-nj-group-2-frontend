import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedUsageTrackingPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/usage-tracking/deleted/')({
  component: ManageDeletedUsageTrackingPage,
});
