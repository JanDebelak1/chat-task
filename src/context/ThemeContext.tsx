'use client';

import { createContext, useContext, useState, useLayoutEffect, useCallback, useMemo } from 'react';
import { STORAGE_KEY_THEME, THEME } from '@/constants';

type Theme = (typeof THEME)[keyof typeof THEME];

const getPersistedTheme = (): Theme => {
  if (typeof window === 'undefined') return THEME.DARK;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_THEME);
    if (stored === THEME.DARK || stored === THEME.LIGHT) return stored;
    return THEME.DARK;
  } catch {
    return THEME.DARK;
  }
};

const persistTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch {}
};

if (typeof document !== 'undefined') {
  const persistedTheme = getPersistedTheme();
  document.documentElement.classList.toggle('dark', persistedTheme === THEME.DARK);
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(getPersistedTheme);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === THEME.DARK);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK);
  }, [theme, setTheme]);

  const value: ThemeContextValue = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
