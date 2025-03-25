import type { CommonSearchParams } from '@/common/types';
import type {
  ServiceCategory,
  ServiceCategorySearchParams,
} from '@/common/types/api/service-category';
import type { AsyncSelectProps } from '@/components/ui/async-select/async-select';
import { serviceCategoryHttpClient } from '@/lib/http';

export function getServiceCategoryAsyncSelectOptions(
  searchBy: Exclude<keyof ServiceCategorySearchParams, keyof CommonSearchParams | 'sorting'>,
): Omit<AsyncSelectProps<ServiceCategory>, 'value' | 'onChange'> {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: (searchTerm) =>
      !searchTerm
        ? ['service-categories', 'all']
        : ['service-categories', 'all', { [searchBy]: searchTerm }],
    queryFn: (searchTerm) =>
      serviceCategoryHttpClient.getAllServiceCategories({ [searchBy]: searchTerm }),
    getDisplayValue: (serviceCategory) => serviceCategory.name,
    getOptionValue: (serviceCategory) => serviceCategory.id,
    placeholder: 'Select a category...',
    label: 'service category',
    renderOption: (serviceCategory) => <div>{serviceCategory.name}</div>,
  };
}
