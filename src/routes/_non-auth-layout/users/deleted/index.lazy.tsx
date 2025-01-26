import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedUsersPage } from '@/components/pages/manage-deleted-users.page';

export const Route = createLazyFileRoute('/_non-auth-layout/users/deleted/')({
  component: ManageDeletedUsersPage,
});
