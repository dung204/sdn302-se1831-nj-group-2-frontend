import { createFileRoute } from '@tanstack/react-router';

import { NonAuthLayout } from '@/components/layouts';

export const Route = createFileRoute('/_non-auth-layout')({
  component: NonAuthLayout,
});
