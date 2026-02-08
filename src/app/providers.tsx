'use client';

import { ThemeProvider } from 'next-themes';
import { ChatProvider } from '@/context/ChatContext';
import { ThreadProvider } from '@/context/ThreadContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThreadProvider>
        <ChatProvider>{children}</ChatProvider>
      </ThreadProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
