import { createLazyFileRoute } from '@tanstack/react-router';

import { DashboardPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/')({
  component: DashboardPage,
});
