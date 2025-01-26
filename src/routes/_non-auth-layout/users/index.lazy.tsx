import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageUsersPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/users/')({
  component: ManageUsersPage,
});
