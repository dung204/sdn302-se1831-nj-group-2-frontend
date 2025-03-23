import { add } from 'date-fns';
import { CalendarClockIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/cn';

interface DateTimePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
}

export function DateTimePicker(props: DateTimePickerProps) {
  const [date, setDate] = React.useState(props.date);

  /**
   * carry over the current time when a user clicks a new day
   * instead of resetting to 00:00
   */
  const handleSelect = (newDay: Date | undefined) => {
    if (!newDay) return;
    if (!date) {
      setDate(newDay);
      props.setDate(newDay);
      return;
    }
    const diff = newDay.getTime() - date.getTime();
    const diffInDays = diff / (1000 * 60 * 60 * 24);
    const newDateFull = add(date, { days: Math.ceil(diffInDays) });
    setDate(newDateFull);
    props.setDate(newDateFull);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarClockIcon className="mr-2 h-4 w-4" />
          {date ? (
            new Intl.DateTimeFormat(navigator.language, {
              dateStyle: 'medium',
              timeStyle: 'medium',
            }).format(date)
          ) : (
            <span>Pick a date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={(d) => handleSelect(d)} initialFocus />
        <div className="border-t border-border p-3">
          <TimePicker
            setDate={(date) => {
              setDate(date);
              props.setDate(date);
            }}
            date={date}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
