'use client';

import { Thread } from '@/types/chats';
import { ThreadItem } from './ThreadItem';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  setThreadButtonRef: (index: number, el: HTMLButtonElement | null) => void;
}

export const ThreadList = ({ threads, activeThreadId, onSelectThread, setThreadButtonRef }: ThreadListProps) => (
  <nav
    className="flex flex-col overflow-auto min-h-0 border-r border-border-default w-full shrink-0 gap-2 p-1"
    aria-label="Conversations"
  >
    {threads.length === 0 ? (
      <div className="p-4 text-sm text-text-muted">No conversations yet.</div>
    ) : (
      threads.map((thread, index) => (
        <ThreadItem
          key={thread.id}
          thread={thread}
          isActive={activeThreadId === thread.id}
          onClick={() => onSelectThread(thread.id)}
          ref={(el) => setThreadButtonRef(index, el)}
        />
      ))
    )}
  </nav>
);
