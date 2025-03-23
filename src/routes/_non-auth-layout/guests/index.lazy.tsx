import { createLazyFileRoute } from '@tanstack/react-router';

import { ManageGuestsPage } from '@/components/pages';

export const Route = createLazyFileRoute('/_non-auth-layout/guests/')({
  component: ManageGuestsPage,
});
