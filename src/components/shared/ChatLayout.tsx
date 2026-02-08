'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/shared/Button';

import { THEME } from '@/constants';

interface ChatLayoutProps {
  headerTitle: string;
  headerSubtitle: string;
  sidebar?: ReactNode;
  banner?: ReactNode;
  children: ReactNode;
  showSidebar?: boolean;
}

export const ChatLayout = ({
  headerTitle,
  headerSubtitle,
  sidebar,
  banner,
  children,
  showSidebar = true,
}: ChatLayoutProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-screen bg-surface-muted text-text">
      {banner}

      <header className="shrink-0 border-b border-border-default bg-surface px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{headerTitle}</h1>
          <p className="text-sm text-text-muted">{headerSubtitle}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          aria-label={theme === THEME.DARK ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === THEME.DARK ? '☀️' : '🌙'}
        </Button>
      </header>

      <div className="flex flex-1 min-h-0">
        {sidebar && (
          <div className={showSidebar ? 'block w-full lg:w-80' : 'hidden lg:block lg:w-80'}>
            {sidebar}
          </div>
        )}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-surface ${showSidebar ? 'hidden lg:flex' : 'flex w-full'}`}
          role="region"
          aria-label="Conversation"
        >
          {children}
        </main>
      </div>
    </div>
  );
};
