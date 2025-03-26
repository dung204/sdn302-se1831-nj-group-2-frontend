import { createLazyFileRoute } from '@tanstack/react-router';

import { GuestComputerLoginPage } from '@/components/pages/guest-computer-login.page';

export const Route = createLazyFileRoute('/_non-auth-layout/guests/login-computer/')({
  component: GuestComputerLoginPage,
});
