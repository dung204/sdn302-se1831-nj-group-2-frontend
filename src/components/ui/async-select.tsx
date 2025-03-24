import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { useDebounce } from '@/common/hooks';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface AsyncSelectProps<T> {
  /** Query key for Tanstack Query, the search term is appended to this key */
  queryKey: (searchTerm: string) => unknown[];
  /** Async function to fetch options */
  queryFn: (query?: string) => Promise<T[]>;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
}

export function AsyncSelect<T>({
  queryKey,
  queryFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = 'Select...',
  value,
  onChange,
  disabled = false,
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
}: AsyncSelectProps<T>) {
  const [_, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, __] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading: isLoadingQuery } = useQuery({
    queryKey: queryKey(debouncedSearchTerm),
    queryFn: () => queryFn(debouncedSearchTerm),
    enabled: open,
  });

  useEffect(() => {
    setMounted(true);
    setSelectedValue(value);
  }, [value]);

  // Initialize selectedOption when options are loaded and value exists
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find((opt) => getOptionValue(opt) === value);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [value, options, getOptionValue]);

  useEffect(() => {
    if (!isLoadingQuery) {
      setLoading(false);
      setOptions(data || []);
    }
  }, [data, isLoadingQuery]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue = clearable && currentValue === selectedValue ? '' : currentValue;
      setSelectedValue(newValue);
      setSelectedOption(options.find((option) => getOptionValue(option) === newValue) || null);
      onChange(newValue);
      setOpen(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            disabled && 'cursor-not-allowed opacity-50',
            triggerClassName,
          )}
          disabled={disabled}
        >
          {selectedOption ? getDisplayValue(selectedOption) : placeholder}
          <ChevronsUpDown className="opacity-50" size={10} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-[--radix-popover-trigger-width] p-0', className)}>
        <Command shouldFilter={false}>
          <div className="relative w-full border-b">
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onValueChange={(value) => {
                setSearchTerm(value);
                setLoading(true);
              }}
            />
            {loading && (
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
          <CommandList>
            {error && <div className="text-destructive p-4 text-center">{error}</div>}
            {loading && (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            {!loading && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={handleSelect}
                  >
                    {renderOption(option)}
                    <Check
                      className={cn(
                        'ml-auto h-3 w-3',
                        selectedValue === getOptionValue(option) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem key={i} disabled>
          <div className="flex w-full items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
