import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';

export function ManagePositionsPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.BRANCH_ADMIN) {
    return <Navigate to="/" />;
  }

  return <div>Manage Positions Page</div>;
}
