import { Laptop, Moon, Sun } from 'lucide-react';

import { useTheme } from '@/common/hooks';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ThemeTogglerProps {
  className?: string;
}

export function ThemeToggler({ className }: ThemeTogglerProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuCheckboxItem
          className="cursor-pointer"
          checked={theme === 'light'}
          onCheckedChange={(checked) => checked && setTheme('light')}
        >
          <Sun className="mr-2 h-[1.2rem] w-[1.2rem]" /> Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="cursor-pointer"
          checked={theme === 'dark'}
          onCheckedChange={(checked) => checked && setTheme('dark')}
        >
          <Moon className="mr-2 h-[1.2rem] w-[1.2rem]" /> Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          className="cursor-pointer"
          checked={theme === 'system'}
          onCheckedChange={(checked) => checked && setTheme('system')}
        >
          <Laptop className="mr-2 h-[1.2rem] w-[1.2rem]" /> System
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
