import { createLazyFileRoute } from '@tanstack/react-router';

import { GuestComputerHomePage } from '@/components/pages/guest-computer-home';

export const Route = createLazyFileRoute(
  '/_non-auth-layout/guests/login-computer/position/$positionId/computer/',
)({
  component: GuestComputerHomePage,
});
