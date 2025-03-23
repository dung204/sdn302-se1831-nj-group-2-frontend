import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageStaffsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/staffs/')({
  component: ManageStaffsPage,
});
