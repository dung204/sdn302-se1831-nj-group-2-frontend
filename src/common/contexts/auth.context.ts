import { createContext } from 'react';

import type { User } from '@/common/types/api/user';

interface AuthContextValue {
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
