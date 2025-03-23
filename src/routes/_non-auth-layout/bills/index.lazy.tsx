import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageBillsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/bills/')({
  component: ManageBillsPage,
});
