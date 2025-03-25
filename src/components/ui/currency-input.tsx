import { type ChangeEvent, type ComponentProps, type KeyboardEvent, useId, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/cn';

interface CurrencyInputProps extends Omit<ComponentProps<'input'>, 'type' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
}

export function CurrencyInput({
  className,
  onChange,
  id,
  value,
  placeholder,
  ...props
}: CurrencyInputProps) {
  const [textValue, setTextValue] = useState(value !== 0 && value ? value.toString() : '');
  const [isFocused, setIsFocused] = useState(false);
  const currencyInputId = useId();

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && textValue.endsWith('.')) {
      setTextValue(textValue.slice(0, textValue.length - 1));
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (newValue === '') {
      setTextValue('');
      onChange?.(NaN);
      return;
    }

    if (/^(\d+)(\.\d*)?$/g.test(newValue)) {
      const newNumberValue = Number(newValue);
      setTextValue(newValue.replaceAll(/^0+(?=(0[1-9]?))/g, ''));
      onChange?.(newNumberValue);
    }
  };

  const handleFocus = () => {
    document.getElementById(id ? `${currencyInputId}-${id}` : currencyInputId)?.focus();
    setIsFocused(true);
  };

  const handleBlur = () => {
    document.getElementById(id ? `${currencyInputId}-${id}` : currencyInputId)?.blur();
    setIsFocused(false);
  };

  return (
    <div
      className={cn(
        'relative h-9 cursor-text items-center gap-2 rounded-md border border-input px-3 has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-ring',
        className,
      )}
    >
      <div className={cn('absolute inset-0 flex size-full px-3 py-2')}>
        {!textValue ? (
          <>
            <Separator
              orientation="vertical"
              className={cn('bg-primary opacity-0', { 'animate-blink': isFocused })}
            />
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          </>
        ) : (
          <>
            <span className="text-sm">
              {new Intl.NumberFormat(navigator.language, {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 20,
                maximumSignificantDigits: 20,
              }).format(Number(textValue))}
            </span>
            <Separator
              orientation="vertical"
              className={cn('bg-primary opacity-0', { 'animate-blink': isFocused })}
            />
          </>
        )}
      </div>
      <Input
        id={id ? `${currencyInputId}-${id}` : currencyInputId}
        className={cn('absolute inset-0 z-10 opacity-0', className)}
        value={textValue}
        onChange={handleOnChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleFocus}
        onKeyDown={handleOnKeyDown}
        {...props}
      />
    </div>
  );
}
