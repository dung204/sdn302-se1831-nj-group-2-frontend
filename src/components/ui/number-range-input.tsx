import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { NumberInput } from '@/components/ui/number-input';

interface NumberRangeInputValue {
  from: number;
  to: number;
}

interface NumberRangeInputProps {
  value?: NumberRangeInputValue;
  onChange?: (value: NumberRangeInputValue) => void;
}

export function NumberRangeInput({ value, onChange }: NumberRangeInputProps) {
  const [rangeInputValue, setRangeInputValue] = useState<NumberRangeInputValue>(
    value ?? { from: NaN, to: NaN },
  );

  const handleInputFromChange = (value: number) => {
    const newRangeInputValue = { ...rangeInputValue, from: value };
    setRangeInputValue(newRangeInputValue);
    onChange?.(newRangeInputValue);
  };

  const handleInputToChange = (value: number) => {
    const newRangeInputValue = { ...rangeInputValue, to: value };
    setRangeInputValue(newRangeInputValue);
    onChange?.(newRangeInputValue);
  };

  return (
    <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] items-center justify-items-center">
      <NumberInput
        value={rangeInputValue.from}
        placeholder="From..."
        className="col-span-11"
        onChange={handleInputFromChange}
      />
      <div className="col-span-2 flex h-full items-center">
        <ArrowRight className="size-6 text-muted-foreground" />
      </div>
      <NumberInput
        value={rangeInputValue.to}
        placeholder="To..."
        className="col-span-11"
        onChange={handleInputToChange}
      />
    </div>
  );
}
