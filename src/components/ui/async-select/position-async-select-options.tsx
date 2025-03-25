import type { CommonSearchParams } from '@/common/types';
import type { Position, PositionSearchParams } from '@/common/types/api/position';
import type { AsyncSelectProps } from '@/components/ui/async-select/async-select';
import { positionHttpClient } from '@/lib/http';

export function getPositionAsyncSelectOptions(
  searchBy: Exclude<keyof PositionSearchParams, keyof CommonSearchParams | 'sorting'>,
): Omit<AsyncSelectProps<Position>, 'value' | 'onChange'> {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: (searchTerm) =>
      !searchTerm ? ['positions', 'all'] : ['positions', 'all', { [searchBy]: searchTerm }],
    queryFn: (searchTerm) => positionHttpClient.getAllPositions({ [searchBy]: searchTerm }),
    getDisplayValue: (position) => position.name,
    getOptionValue: (position) => position.id,
    placeholder: 'Select a position...',
    label: 'position',
    renderOption: (position) => <div>{position.name}</div>,
  };
}
