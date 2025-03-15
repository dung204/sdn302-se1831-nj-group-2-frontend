import {
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  forwardRef,
  useState,
} from 'react';

import { Input } from '@/components/ui/input';

interface NumberInputProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [textValue, setTextValue] = useState(value !== 0 && value ? value.toString() : '');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && textValue.endsWith('.')) {
        setTextValue(textValue.slice(0, textValue.length - 1));
      }

      if (e.key === 'Backspace' && textValue === '-') {
        setTextValue('');
        onChange?.(NaN);
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (newValue === '') {
        setTextValue('');
        onChange?.(NaN);
        return;
      }

      if (/^(\d+)(\.\d*)?$/g.test(newValue)) {
        const newNumberValue = Number(newValue);
        setTextValue(newValue.replaceAll(/^0+/g, ''));
        onChange?.(newNumberValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={textValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

NumberInput.displayName = 'NumberInput';
