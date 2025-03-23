import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedServiceCategoriesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/service-categories/deleted/')({
  component: ManageDeletedServiceCategoriesPage,
});
