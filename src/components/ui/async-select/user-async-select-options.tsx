import type { CommonSearchParams } from '@/common/types';
import type { User, UserSearchParams } from '@/common/types/api/user';
import type { AsyncSelectProps } from '@/components/ui/async-select/async-select';
import { userHttpClient } from '@/lib/http';

export function getUserAsyncSelectOptions(
  searchBy: Exclude<keyof UserSearchParams, keyof CommonSearchParams | 'sorting'>,
): Omit<AsyncSelectProps<User>, 'value' | 'onChange'> {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: (searchTerm) =>
      !searchTerm ? ['users', 'all'] : ['users', 'all', { [searchBy]: searchTerm }],
    queryFn: (searchTerm) => userHttpClient.getAllUsers({ [searchBy]: searchTerm }),
    getDisplayValue: (user) => `${user.firstName} ${user.lastName}`,
    getOptionValue: (user) => user.id,
    placeholder: 'Select a user...',
    label: 'user',
    renderOption: (user) => (
      <div>
        {user.firstName} {user.lastName}
      </div>
    ),
  };
}
