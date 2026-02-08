'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useBroadcast, BROADCAST_TYPE } from '@/hooks/useBroadcast';
import { Message, TypingPayload, MESSAGE_STATUS, MESSAGE_SENDER } from '@/types/chats';
import { useThreads } from '@/context/ThreadContext';

export interface ChatDataContextValue {
  typingByThread: Record<string, Message['senderId'] | null>;
}

export interface ChatActionsContextValue {
  sendMessage: (text: string, senderId: Message['senderId']) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  markThreadRead: (threadId: string) => void;
  setTyping: (threadId: string, isTyping: boolean, senderId: Message['senderId']) => void;
}

export type ChatContextValueFull = ChatDataContextValue & ChatActionsContextValue;

export const ChatDataContext = createContext<ChatDataContextValue | null>(null);

export const ChatActionsContext = createContext<ChatActionsContextValue | null>(null);

export const useChat = (): ChatContextValueFull => {
  const data = useContext(ChatDataContext);
  const actions = useContext(ChatActionsContext);
  if (!data || !actions) throw new Error('useChat must be used within ChatProvider');
  return { ...data, ...actions };
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    addMessage,
    updateMessageInThread,
    setThreadReadAt,
    getMessage,
    visitorThreadId,
    activeThreadId,
  } = useThreads();
  const [typingByThread, setTypingByThread] = useState<Record<string, Message['senderId'] | null>>({});

  const onMessageReceived = useCallback(
    (payload: { type: typeof BROADCAST_TYPE.message; data: Message }) => {
      addMessage(payload.data);
    },
    [addMessage]
  );

  const onTyping = useCallback((payload: TypingPayload) => {
    setTypingByThread((prev) => ({
      ...prev,
      [payload.threadId]: payload.isTyping ? payload.senderId : null,
    }));
  }, []);

  const onReadReceipt = useCallback(
    (payload: { threadId: string; readAt: number }) => {
      setThreadReadAt(payload.threadId, payload.readAt);
    },
    [setThreadReadAt]
  );

  const { send: broadcast } = useBroadcast(onMessageReceived, onTyping, onReadReceipt);

  const sendMessage = useCallback(
    async (text: string, senderId: Message['senderId']) => {
      const threadId = senderId === MESSAGE_SENDER.VISITOR ? visitorThreadId : activeThreadId;
      if (!threadId) return;
      const newMsg: Message = {
        id: crypto.randomUUID(),
        threadId,
        senderId,
        text,
        timestamp: Date.now(),
        status: MESSAGE_STATUS.SENDING,
      };
      addMessage(newMsg);
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!navigator.onLine) {
              reject(new Error('Offline'));
            } else {
              resolve(undefined);
            }
          }, 600);
        });
        const finalMsg = { ...newMsg, status: MESSAGE_STATUS.SENT };
        updateMessageInThread(threadId, (m) =>
          m.id === newMsg.id ? finalMsg : m
        );
        broadcast({ type: BROADCAST_TYPE.message, data: finalMsg });
      } catch {
        updateMessageInThread(threadId, (m) =>
          m.id === newMsg.id ? { ...m, status: MESSAGE_STATUS.ERROR } : m
        );
      }
    },
    [addMessage, updateMessageInThread, broadcast, visitorThreadId, activeThreadId]
  );
  
  const retryMessage = useCallback(
    async (messageId: string) => {
      const found = getMessage(messageId);
      if (!found || found.msg.status !== MESSAGE_STATUS.ERROR) return;
      const newMsg: Message = {
        ...found.msg,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: MESSAGE_STATUS.SENDING,
      };
      addMessage(newMsg);
      try {
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (!navigator.onLine) {
              reject(new Error('Offline'));
            } else {
              resolve(undefined);
            }
          }, 600);
        });
        const finalMsg = { ...newMsg, status: MESSAGE_STATUS.SENT };
        updateMessageInThread(found.threadId, (m) =>
          m.id === newMsg.id ? finalMsg : m
        );
        broadcast({ type: BROADCAST_TYPE.message, data: finalMsg });
      } catch {
        updateMessageInThread(found.threadId, (m) =>
          m.id === newMsg.id ? { ...m, status: MESSAGE_STATUS.ERROR } : m
        );
      }
    },
    [getMessage, addMessage, updateMessageInThread, broadcast]
  );

  const markThreadRead = useCallback(
    (threadId: string) => {
      const readAt = Date.now();
      setThreadReadAt(threadId, readAt);
      broadcast({ type: BROADCAST_TYPE.read_receipt, data: { threadId, readAt } });
    },
    [setThreadReadAt, broadcast]
  );

  const clearTyping = useCallback((threadId: string, senderId: Message['senderId']) => {
    setTypingByThread((prev) => (prev[threadId] === senderId ? { ...prev, [threadId]: null } : prev));
    broadcast({ type: BROADCAST_TYPE.typing, data: { threadId, senderId, isTyping: false } });
  }, [broadcast]);

  const debouncedClearTyping = useDebouncedCallback(clearTyping, 500);

  const setTypingAction = useCallback(
    (threadId: string, isTyping: boolean, senderId: Message['senderId']) => {
      setTypingByThread((prev) => ({ ...prev, [threadId]: isTyping ? senderId : null }));
      broadcast({ type: BROADCAST_TYPE.typing, data: { threadId, senderId, isTyping } });
      if (isTyping) debouncedClearTyping(threadId, senderId);
    },
    [broadcast, debouncedClearTyping]
  );

  const dataValue: ChatDataContextValue = useMemo(
    () => ({ typingByThread }),
    [typingByThread]
  );

  const actionsValue: ChatActionsContextValue = useMemo(
    () => ({
      sendMessage,
      retryMessage,
      markThreadRead,
      setTyping: setTypingAction,
    }),
    [sendMessage, retryMessage, markThreadRead, setTypingAction]
  );

  return (
    <ChatDataContext.Provider value={dataValue}>
      <ChatActionsContext.Provider value={actionsValue}>{children}</ChatActionsContext.Provider>
    </ChatDataContext.Provider>
  );
};
