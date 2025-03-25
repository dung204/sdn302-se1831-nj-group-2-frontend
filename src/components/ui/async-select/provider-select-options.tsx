import type { CommonSearchParams } from '@/common/types';
import type { Provider, ProviderSearchParams } from '@/common/types/api/provider';
import type { AsyncSelectProps } from '@/components/ui/async-select/async-select';
import { providerHttpClient } from '@/lib/http';

export function getProviderAsyncSelectOptions(
  searchBy: Exclude<keyof ProviderSearchParams, keyof CommonSearchParams | 'sorting'>,
): Omit<AsyncSelectProps<Provider>, 'value' | 'onChange'> {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: (searchTerm) =>
      !searchTerm ? ['providers', 'all'] : ['providers', 'all', { [searchBy]: searchTerm }],
    queryFn: (searchTerm) => providerHttpClient.getAllProviders({ [searchBy]: searchTerm }),
    getDisplayValue: (provider) => provider.name,
    getOptionValue: (provider) => provider.id,
    placeholder: 'Select a provider...',
    label: 'provider',
    renderOption: (provider) => <div>{provider.name}</div>,
  };
}
