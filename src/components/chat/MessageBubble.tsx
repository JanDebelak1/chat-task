'use client';

import clsx from 'clsx';
import { Message, MESSAGE_STATUS } from '@/types/chats';
import { Button } from '@/components/shared/Button';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onRetry?: (messageId: string) => void;
}

export const MessageBubble = ({ message, isOwn, onRetry }: MessageBubbleProps) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={clsx('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}
      role="article"
      aria-label={`Message from ${message.senderId} at ${time}: ${message.text.slice(0, 50)}`}
    >
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isOwn
            ? 'bg-primary text-white rounded-br-md'
            : 'bg-secondary text-secondary-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <div className="flex items-center justify-end gap-2 mt-1">
          <span className="text-xs opacity-80">{time}</span>
          {message.status === MESSAGE_STATUS.SENDING && (
            <span className="text-xs opacity-80" aria-live="polite">
              Sending…
            </span>
          )}
          {message.status === MESSAGE_STATUS.ERROR && onRetry && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRetry(message.id)}
              aria-label={`Retry sending message: ${message.text.slice(0, 30)}`}
            >
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
