import type { CommonSearchParams } from '@/common/types';
import type { Peripheral, PeripheralSearchParams } from '@/common/types/api/peripheral';
import type { AsyncSelectProps } from '@/components/ui/async-select/async-select';
import { peripheralHttpClient } from '@/lib/http';

export function getPeripheralAsyncSelectOptions(
  searchBy: Exclude<keyof PeripheralSearchParams, keyof CommonSearchParams | 'sorting'>,
): Omit<AsyncSelectProps<Peripheral>, 'value' | 'onChange'> {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: (searchTerm) =>
      !searchTerm ? ['peripherals', 'all'] : ['peripherals', 'all', { [searchBy]: searchTerm }],
    queryFn: (searchTerm) => peripheralHttpClient.getAllPeripherals({ [searchBy]: searchTerm }),
    getDisplayValue: (peripheral) => peripheral.name,
    getOptionValue: (peripheral) => peripheral.id,
    placeholder: 'Select a peripheral...',
    label: 'peripheral',
    renderOption: (peripheral) => <div>{peripheral.name}</div>,
  };
}
