'use client';

import { useCallback, useRef } from 'react';
import { Button } from '@/components/shared/Button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTypingChange?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  threadId: string;
  onFocus?: () => void;
}

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onTypingChange,
  placeholder = 'Type a message…',
  disabled,
  threadId,
  onFocus,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      onTypingChange?.(true);
    },
    [onChange, onTypingChange]
  );

  const handleBlur = useCallback(() => {
    onTypingChange?.(false);
  }, [onTypingChange]);

  return (
    <div className="flex gap-2 p-3 border-t border-border-default bg-surface">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Message input"
        aria-describedby="send-hint"
        className="flex-1 rounded-lg border border-border-default bg-surface-muted text-text px-3 py-2 text-sm focus:border-primary-focus"
      />
      <Button
        size="sm"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        id="send-hint"
      >
        Send
      </Button>
    </div>
  );
};
