import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedStaffsPage } from '@/components/pages/manage-deleted-staffs.page';

export const Route = createLazyFileRoute('/_non-auth-layout/staffs/deleted/')({
  component: ManageDeletedStaffsPage,
});
