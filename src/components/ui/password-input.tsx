import { Eye, EyeOff } from 'lucide-react';
import { type ComponentProps, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/cn';

export function PasswordInput({
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [showPassword, setShowPassword] = useState(false);

  const Icon = showPassword ? EyeOff : Eye;

  return (
    <div
      className={cn(
        'flex rounded-md border border-input has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-ring',
        className,
      )}
    >
      <Input
        type={showPassword ? 'text' : 'password'}
        className="border-0 focus-visible:ring-0"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        onClick={() => setShowPassword(!showPassword)}
      >
        <Icon className="size-4" />
      </Button>
    </div>
  );
}
