import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';

export function ManageDeletedServicesPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (![Role.OWNER, Role.BRANCH_ADMIN].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <div>Manage Services Page</div>;
}
