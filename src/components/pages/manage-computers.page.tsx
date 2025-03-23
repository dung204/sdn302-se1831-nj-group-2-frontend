import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';

export function ManageComputersPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (![Role.BRANCH_ADMIN, Role.STAFF].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return <div>Manage Computers Page</div>;
}
