import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageBranchesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/branches/')({
  component: ManageBranchesPage,
});
