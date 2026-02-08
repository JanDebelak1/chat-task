import {  Thread, ThreadState, MESSAGE_SENDER } from '@/types/chats';
import { MESSAGES_TO_THREAD_PREVIEW } from './constants';

export const threadRecordToList = (threads: Record<string, ThreadState>): Thread[] =>
  Object.values(threads).map((t) => {
    const sorted = [...t.messages].sort((a, b) => a.timestamp - b.timestamp);
    const last = sorted[sorted.length - 1];
    const unreadCount = t.messages.filter((m) => m.senderId === MESSAGE_SENDER.VISITOR && !m.readAt).length;
    return {
      id: t.id,
      lastMessagePreview: last
        ? last.text.slice(0, MESSAGES_TO_THREAD_PREVIEW) + (last.text.length > MESSAGES_TO_THREAD_PREVIEW ? '…' : '')
        : '',
      lastMessageAt: last?.timestamp ?? 0,
      unreadCount,
      lastMessageSenderId: last?.senderId ?? MESSAGE_SENDER.VISITOR,
    };
  });

export const sortThreads = (threads: Thread[]): Thread[] =>
  [...threads].sort((a, b) => {
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
    return b.lastMessageAt - a.lastMessageAt;
  });
