import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageDeletedGuestsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/guests/deleted/')({
  component: ManageDeletedGuestsPage,
});
