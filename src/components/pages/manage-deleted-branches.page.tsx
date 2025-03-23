import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';

export function ManageDeletedBranchesPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== Role.OWNER) {
    return <Navigate to="/" />;
  }

  return <div>Manage Deleted Branches Page</div>;
}
