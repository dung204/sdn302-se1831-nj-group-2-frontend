import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageServiceCategoriesPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/service-categories/')({
  component: ManageServiceCategoriesPage,
});
