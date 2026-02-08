'use client';

import type { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/shared/Button';

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
  const { theme, setTheme } = useTheme();

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
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          suppressHydrationWarning
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
      </header>

      <div className="flex flex-1 min-h-0">
        {sidebar && (
          <aside className={showSidebar ? 'block w-full lg:w-80' : 'hidden lg:block lg:w-80'}>
            {sidebar}
          </aside>
        )}
        <main
          className={`flex-1 flex flex-col min-w-0 bg-surface ${showSidebar ? 'hidden lg:flex' : 'flex w-full'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
