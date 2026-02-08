import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MESSAGE_STATUS, MESSAGE_SENDER } from '@/types/chats';
import type { Message } from '@/types/chats';
import { threadRecordToList, sortThreads } from '@/helpers';
import type { ThreadState, Thread } from '@/types/chats';

// UI Interaction Tests
describe('UI Interaction', () => {
  it('sends message when send button is clicked', () => {
    const onSend = vi.fn();
    const onChange = vi.fn();

    render(
      <ChatInput
        value="Hello"
        onChange={onChange}
        onSend={onSend}
        threadId="test-thread"
      />
    );

    const sendButton = screen.getByLabelText('Send message');
    fireEvent.click(sendButton);

    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it('shows retry button for failed messages and calls onRetry with message ID', () => {
    const message: Message = {
      id: 'msg-123',
      threadId: 'test',
      senderId: MESSAGE_SENDER.VISITOR,
      text: 'Failed message',
      timestamp: Date.now(),
      status: MESSAGE_STATUS.ERROR,
    };

    const onRetry = vi.fn();

    render(
      <MessageBubble
        message={message}
        isOwn={true}
        onRetry={onRetry}
      />
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledWith('msg-123');
  });

  it('triggers typing indicator when user types in input', () => {
    const onTypingChange = vi.fn();

    render(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSend={vi.fn()}
        onTypingChange={onTypingChange}
        threadId="test"
      />
    );

    const input = screen.getByLabelText('Message input');
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(onTypingChange).toHaveBeenCalledWith(true);
  });
});

// State Transition Tests
describe('State Transition', () => {
  it('transitions message from SENDING to SENT status', () => {
    const message: Message = {
      id: '1',
      threadId: 'test',
      senderId: MESSAGE_SENDER.VISITOR,
      text: 'Test message',
      timestamp: Date.now(),
      status: MESSAGE_STATUS.SENDING,
    };

    const { rerender } = render(
      <MessageBubble message={message} isOwn={true} />
    );

    expect(screen.getByText('Sending…')).toBeInTheDocument();

    const updatedMessage = { ...message, status: MESSAGE_STATUS.SENT };
    rerender(<MessageBubble message={updatedMessage} isOwn={true} />);

    expect(screen.queryByText('Sending…')).not.toBeInTheDocument();
  });

  it('transitions message to ERROR status and shows retry', () => {
    const sendingMessage: Message = {
      id: '1',
      threadId: 'test',
      senderId: MESSAGE_SENDER.VISITOR,
      text: 'Test',
      timestamp: Date.now(),
      status: MESSAGE_STATUS.SENDING,
    };

    const { rerender } = render(
      <MessageBubble message={sendingMessage} isOwn={true} />
    );

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();

    const errorMessage = { ...sendingMessage, status: MESSAGE_STATUS.ERROR };
    rerender(
      <MessageBubble
        message={errorMessage}
        isOwn={true}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('sorts threads by unread count then by recent message', () => {
    const threads: Thread[] = [
      {
        id: '1',
        lastMessagePreview: 'Old read',
        lastMessageAt: 1000,
        unreadCount: 0,
        lastMessageSenderId: MESSAGE_SENDER.VISITOR,
      },
      {
        id: '2',
        lastMessagePreview: 'Recent read',
        lastMessageAt: 3000,
        unreadCount: 0,
        lastMessageSenderId: MESSAGE_SENDER.VISITOR,
      },
      {
        id: '3',
        lastMessagePreview: 'Old unread',
        lastMessageAt: 2000,
        unreadCount: 1,
        lastMessageSenderId: MESSAGE_SENDER.VISITOR,
      },
    ];

    const sorted = sortThreads(threads);

    expect(sorted[0].id).toBe('3');
    expect(sorted[1].id).toBe('2');
    expect(sorted[2].id).toBe('1');
  });
});

// Edge Case Tests
describe('Edge Cases', () => {
  it('disables send button for empty or whitespace-only messages', () => {
    const onSend = vi.fn();

    const { rerender } = render(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSend={onSend}
        threadId="test"
      />
    );

    expect(screen.getByLabelText('Send message')).toBeDisabled();

    rerender(
      <ChatInput
        value="   "
        onChange={vi.fn()}
        onSend={onSend}
        threadId="test"
      />
    );

    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });

  it('correctly calculates unread count only for visitor messages without readAt', () => {
    const threadState: ThreadState = {
      id: 'test',
      messages: [
        {
          id: '1',
          threadId: 'test',
          senderId: MESSAGE_SENDER.VISITOR,
          text: 'Unread visitor',
          timestamp: 1000,
          status: MESSAGE_STATUS.SENT,
        },
        {
          id: '2',
          threadId: 'test',
          senderId: MESSAGE_SENDER.AGENT,
          text: 'Agent message',
          timestamp: 2000,
          status: MESSAGE_STATUS.SENT,
        },
        {
          id: '3',
          threadId: 'test',
          senderId: MESSAGE_SENDER.VISITOR,
          text: 'Read visitor',
          timestamp: 3000,
          status: MESSAGE_STATUS.SENT,
          readAt: 3500,
        },
      ],
    };

    const threads = threadRecordToList({ test: threadState });
    expect(threads[0].unreadCount).toBe(1);
  });

  it('handles out-of-order messages by sorting by timestamp', () => {
    const threadState: ThreadState = {
      id: 'test',
      messages: [
        {
          id: '3',
          threadId: 'test',
          senderId: MESSAGE_SENDER.VISITOR,
          text: 'Third',
          timestamp: 3000,
          status: MESSAGE_STATUS.SENT,
        },
        {
          id: '1',
          threadId: 'test',
          senderId: MESSAGE_SENDER.VISITOR,
          text: 'First',
          timestamp: 1000,
          status: MESSAGE_STATUS.SENT,
        },
        {
          id: '2',
          threadId: 'test',
          senderId: MESSAGE_SENDER.VISITOR,
          text: 'Second',
          timestamp: 2000,
          status: MESSAGE_STATUS.SENT,
        },
      ],
    };

    const threads = threadRecordToList({ test: threadState });
    expect(threads[0].lastMessagePreview).toBe('Third');
    expect(threads[0].lastMessageAt).toBe(3000);
  });
});
