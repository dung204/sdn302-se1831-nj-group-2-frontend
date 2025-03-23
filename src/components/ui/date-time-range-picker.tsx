import { CalendarClockIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/cn';

interface DateRangePickerProps {
  className?: string;
  dateRange?: DateRange;
  onDateRangeChange?: (dateRange?: DateRange) => void;
}

export function DateTimeRangePicker({
  className,
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'justify-start truncate text-left font-normal',
              !dateRange && 'text-muted-foreground',
            )}
            title={renderPickerText(dateRange)}
          >
            <CalendarClockIcon
              className={cn({ 'text-muted-foreground': !dateRange?.from && !dateRange?.to })}
            />
            <span className={cn({ 'text-muted-foreground': !dateRange?.from && !dateRange?.to })}>
              {renderPickerText(dateRange)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
          <div className="flex gap-4 border-t border-border p-3">
            <TimePicker
              setDate={(date) => onDateRangeChange?.({ from: date, to: dateRange?.to })}
              date={dateRange?.from}
            />
            <TimePicker
              setDate={(date) => onDateRangeChange?.({ from: dateRange?.from, to: date })}
              date={dateRange?.to}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function renderPickerText(dateRange?: DateRange) {
  if (dateRange?.from) {
    if (dateRange.to) {
      return `${new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(dateRange.from)} - ${new Intl.DateTimeFormat(navigator.language, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(dateRange.to)}`;
    }
    return new Intl.DateTimeFormat(navigator.language, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(dateRange.from);
  }
  return 'Pick a date and time range';
}
