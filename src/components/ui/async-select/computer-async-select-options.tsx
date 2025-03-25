import type { CommonSearchParams } from '@/common/types';
import type { Computer, ComputerSearchParams } from '@/common/types/api/computer';
import type { AsyncSelectProps } from '@/components/ui/async-select/async-select';
import { computerHttpClient } from '@/lib/http';

export function getComputerAsyncSelectOptions(
  searchBy: Exclude<keyof ComputerSearchParams, keyof CommonSearchParams | 'sorting'>,
): Omit<AsyncSelectProps<Computer>, 'value' | 'onChange'> {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: (searchTerm) =>
      !searchTerm ? ['computers', 'all'] : ['computers', 'all', { [searchBy]: searchTerm }],
    queryFn: (searchTerm) => computerHttpClient.getAllComputers({ [searchBy]: searchTerm }),
    getDisplayValue: (computer) => computer.name,
    getOptionValue: (computer) => computer.id,
    placeholder: 'Select a computer...',
    label: 'computer',
    renderOption: (computer) => <div>{computer.name}</div>,
  };
}
