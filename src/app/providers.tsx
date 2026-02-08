'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { ChatProvider } from '@/context/ChatContext';
import { ThreadProvider } from '@/context/ThreadContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <ThemeProvider>
      <ThreadProvider>
        <ChatProvider>{children}</ChatProvider>
      </ThreadProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
