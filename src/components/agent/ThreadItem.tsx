'use client';

import clsx from 'clsx';
import { Thread } from '@/types/chats';
import { forwardRef } from 'react';

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onClick: () => void;
}

export const ThreadItem = forwardRef<HTMLButtonElement, ThreadItemProps>(
  ({ thread, isActive, onClick }, ref) => {
    const time = new Date(thread.lastMessageAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={clsx(
          'w-full text-left px-4 py-3 border-b border-border-default focus:outline-none rounded-none transition-colors cursor-pointer',
          isActive 
            ? 'bg-highlight hover:bg-highlight-hover focus-visible:bg-highlight-hover' 
            : 'hover:bg-surface-hover focus-visible:bg-surface-hover'
        )}
        aria-label={`Conversation, last message: ${thread.lastMessagePreview}, ${thread.unreadCount} unread`}
        aria-current={isActive ? 'true' : undefined}
      >
        <div className="flex justify-between items-start gap-2">
          <span className="text-sm font-medium text-text truncate flex-1">
            {thread.lastMessagePreview || 'No messages'}
          </span>
          {thread.unreadCount > 0 && (
            <span
              className="shrink-0 rounded-full bg-badge text-white text-xs font-medium min-w-[20px] h-5 flex items-center justify-center px-1.5"
              aria-label={`${thread.unreadCount} unread`}
            >
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </span>
          )}
        </div>
        <div className="text-xs text-text-muted mt-1">{time}</div>
      </button>
    );
  }
);

ThreadItem.displayName = 'ThreadItem';
