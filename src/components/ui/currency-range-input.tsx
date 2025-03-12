import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { CurrencyInput } from '@/components/ui/currency-input';

interface CurrencyRangeInputValue {
  from: number;
  to: number;
}

interface CurrencyRangeInputProps {
  value?: CurrencyRangeInputValue;
  onChange?: (value: CurrencyRangeInputValue) => void;
}

export function CurrencyRangeInput({ value, onChange }: CurrencyRangeInputProps) {
  const [rangeInputValue, setRangeInputValue] = useState<CurrencyRangeInputValue>(
    value ?? { from: NaN, to: NaN },
  );

  return (
    <div className="grid grid-cols-[repeat(24,minmax(0,1fr))] items-center justify-items-center">
      <CurrencyInput
        value={rangeInputValue.from}
        placeholder="From..."
        className="col-span-11 w-full"
        onChange={(value) => {
          const newRangeInputValue = { ...rangeInputValue, from: value };
          setRangeInputValue(newRangeInputValue);
          onChange?.(newRangeInputValue);
        }}
      />
      <div className="col-span-2 flex h-full items-center">
        <ArrowRight className="size-6 text-muted-foreground" />
      </div>
      <CurrencyInput
        value={rangeInputValue.to}
        placeholder="To..."
        className="col-span-11 w-full"
        onChange={(value) => {
          const newRangeInputValue = { ...rangeInputValue, to: value };
          setRangeInputValue(newRangeInputValue);
          onChange?.(newRangeInputValue);
        }}
      />
    </div>
  );
}
