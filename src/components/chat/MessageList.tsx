'use client';

import { useEffect, useRef, useState } from 'react';
import { Message, MESSAGE_STATUS } from '@/types/chats';
import { Button } from '@/components/shared/Button';
import { MessageBubble } from './MessageBubble';

const LAZY_CHUNK = 30;

interface MessageListProps {
  messages: Message[];
  threadId: string;
  currentUserId: Message['senderId'];
  onRetry?: (messageId: string) => void;
  typingLabel?: string | null;
}

export const MessageList = ({
  messages,
  threadId,
  currentUserId,
  onRetry,
  typingLabel,
}: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLengthRef = useRef(0);
  const [showCount, setShowCount] = useState(LAZY_CHUNK);
  const sentOnly = messages.filter(
    (m) => m.senderId === currentUserId || m.status === MESSAGE_STATUS.SENT
  );
  const total = sentOnly.length;
  const visible = sentOnly.slice(-showCount);

  useEffect(() => {
    if (sentOnly.length > prevLengthRef.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    prevLengthRef.current = sentOnly.length;
  }, [sentOnly.length]);

  const loadMore = () => setShowCount((c) => Math.min(c + LAZY_CHUNK, total));

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0"
      role="log"
      aria-label="Chat message history"
      tabIndex={0}
    >
      {total > showCount && (
        <div className="flex justify-center py-2">
          <Button
            variant="secondary"
            onClick={loadMore}
            aria-label="Load older messages"
          >
            Load older messages ({total - showCount} more)
          </Button>
        </div>
      )}
      {visible.map((m) => (
        <MessageBubble
          key={m.id}
          message={m}
          isOwn={m.senderId === currentUserId}
          onRetry={onRetry}
        />
      ))}
      {typingLabel && (
        <div className="flex justify-start mb-2" aria-live="polite">
          <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2">
            <span className="text-sm text-text-muted">{typingLabel} is typing…</span>
          </div>
        </div>
      )}
    </div>
  );
};
