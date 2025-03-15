import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageUsageTrackingPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/usage-tracking/')({
  component: ManageUsageTrackingPage,
});
