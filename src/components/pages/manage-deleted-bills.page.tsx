import { Navigate } from '@tanstack/react-router';

import { useAuth } from '@/common/hooks';
import { Role } from '@/common/types/api/user';

export function ManageDeletedBillsPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === Role.GUEST) {
    return <Navigate to="/" />;
  }

  return <div>Manage Deleted Bills Page</div>;
}
