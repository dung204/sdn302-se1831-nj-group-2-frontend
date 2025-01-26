import { type ComponentPropsWithoutRef, useEffect } from 'react';

import { ThemeContext } from '@/common/contexts';
import { useLocalStorage } from '@/common/hooks';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps
  extends Omit<
    ComponentPropsWithoutRef<typeof ThemeContext.Provider>,
    'value'
  > {
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage(storageKey, defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider {...props} value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
