import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';

export function ManageServicesPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <div>Manage Services Page</div>;
}
