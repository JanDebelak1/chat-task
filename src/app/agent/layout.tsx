'use client';

import { useCallback, useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useThreads } from '@/context/ThreadContext';
import { useChat } from '@/context/ChatContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { ChatLayout } from '@/components/shared/ChatLayout';
import { ThreadList } from '@/components/agent/ThreadList';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { threadList, activeThreadId, setActiveThreadId } = useThreads();
  const { markThreadRead } = useChat();
  const online = useOnlineStatus();
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const [showThreads, setShowThreads] = useState(true);
  const threadButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  useEffect(() => {
    if (focusIndex >= 0 && focusIndex < threadList.length) {
      threadButtonRefs.current.get(focusIndex)?.focus();
    }
  }, [focusIndex, threadList.length]);

  const focusInput = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>('input[aria-label="Message input"]');
    input?.focus();
  }, []);

  const onSelectThread = useCallback(
    (id: string) => {
      setActiveThreadId(id);
      markThreadRead(id);
      if (window.innerWidth < 1024) {
        setShowThreads(false);
      }
      focusInput();
    },
    [setActiveThreadId, markThreadRead, focusInput]
  );

  const setThreadButtonRef = useCallback((index: number, el: HTMLButtonElement | null) => {
    if (el) {
      threadButtonRefs.current.set(index, el);
    } else {
      threadButtonRefs.current.delete(index);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex((prev) => Math.min(prev + 1, threadList.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && focusIndex >= 0 && focusIndex < threadList.length) {
        e.preventDefault();
        const selectedThread = threadList[focusIndex];
        if (selectedThread) {
          onSelectThread(selectedThread.id);
        }
      }
    },
    [threadList, focusIndex, onSelectThread]
  );

  return (
    <div onKeyDown={handleKeyDown}>
      <ChatLayout
        headerTitle="Agent Inbox"
        headerSubtitle="Conversations"
        sidebar={
          <ThreadList
            threads={threadList}
            activeThreadId={activeThreadId}
            onSelectThread={onSelectThread}
            setThreadButtonRef={setThreadButtonRef}
          />
        }
        banner={!online ? <OfflineBanner /> : undefined}
        showSidebar={showThreads}
      >
        {!showThreads && activeThreadId && (
          <div className="lg:hidden border-b border-border-default p-2 bg-surface">
            <button
              onClick={() => setShowThreads(true)}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-surface-muted rounded w-full text-left flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to conversations</span>
            </button>
          </div>
        )}
        {children}
      </ChatLayout>
    </div>
  );
}
