import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';

export function ManageDeletedComputersPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (![Role.BRANCH_ADMIN, Role.STAFF].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <div>Manage Deleted Computers Page</div>;
}
