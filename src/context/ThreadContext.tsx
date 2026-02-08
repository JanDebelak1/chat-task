'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
} from 'react';
import { Message, Thread, ThreadState, MESSAGE_SENDER } from '@/types/chats';
import { threadRecordToList, sortThreads } from '@/helpers';
import { STORAGE_KEY_ACTIVE_THREAD, STORAGE_KEY_THREADS, STORAGE_KEY_VISITOR_THREAD_ID } from '@/constants';

const ensureThread = (
  threads: Record<string, ThreadState>,
  threadId: string
): Record<string, ThreadState> => {
  if (threads[threadId]) return threads;
  return { ...threads, [threadId]: { id: threadId, messages: [] } };
};

const safeParseThreads = (s: string | null): Record<string, ThreadState> => {
  if (!s) return {};
  try {
    return JSON.parse(s) as Record<string, ThreadState>;
  } catch {
    return {};
  }
};

const loadFromStorage = (): {
  threads: Record<string, ThreadState>;
  visitorThreadId: string | null;
  activeThreadId: string | null;
} => {
  if (typeof window === 'undefined') return { threads: {}, visitorThreadId: null, activeThreadId: null };
  try {
    const saved = localStorage.getItem(STORAGE_KEY_THREADS);
    const threads = safeParseThreads(saved);
    let visitorId = sessionStorage.getItem(STORAGE_KEY_VISITOR_THREAD_ID);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      sessionStorage.setItem(STORAGE_KEY_VISITOR_THREAD_ID, visitorId);
    }
    const threadsWithMine = ensureThread(threads, visitorId);
    const activeThreadId = localStorage.getItem(STORAGE_KEY_ACTIVE_THREAD);
    return { threads: threadsWithMine, visitorThreadId: visitorId, activeThreadId };
  } catch {
    return { threads: {}, visitorThreadId: null, activeThreadId: null };
  }
};

const addMessageToThread = (
  threads: Record<string, ThreadState>,
  msg: Message
): Record<string, ThreadState> => {
  const next = ensureThread(threads, msg.threadId);
  const list = next[msg.threadId].messages;
  if (list.some((m) => m.id === msg.id)) return threads;
  const messages = [...list, msg].sort((a, b) => a.timestamp - b.timestamp);
  return { ...next, [msg.threadId]: { ...next[msg.threadId], messages } };
};

const updateMessageInThread = (
  threads: Record<string, ThreadState>,
  threadId: string,
  updater: (m: Message) => Message
): Record<string, ThreadState> => {
  const t = threads[threadId];
  if (!t) return threads;
  const messages = t.messages.map(updater).sort((a, b) => a.timestamp - b.timestamp);
  return { ...threads, [threadId]: { ...t, messages } };
};

export interface ThreadContextValue {
  threads: Record<string, ThreadState>;
  threadList: Thread[];
  activeThreadId: string | null;
  visitorThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  unreadTotal: number;
  addMessage: (msg: Message) => void;
  updateMessageInThread: (threadId: string, updater: (m: Message) => Message) => void;
  setThreadReadAt: (threadId: string, readAt: number) => void;
  getMessage: (messageId: string) => { threadId: string; msg: Message } | null;
}

const ThreadContext = createContext<ThreadContextValue | null>(null);

export const useThreads = (): ThreadContextValue => {
  const context = useContext(ThreadContext);
  if (!context) throw new Error('missing provider');
  return context;
};

export const ThreadProvider = ({ children }: { children: React.ReactNode }) => {
  const [threads, setThreads] = useState<Record<string, ThreadState>>({});
  const [visitorThreadId, setVisitorThreadId] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadIdState] = useState<string | null>(null);

  useEffect(() => {
    const localData = loadFromStorage();
    startTransition(() => {
      setThreads(localData.threads);
      setVisitorThreadId(localData.visitorThreadId);
      setActiveThreadIdState(localData.activeThreadId);
    });
  }, []);

  useEffect(() => {
    if (Object.keys(threads).length === 0) return;
    localStorage.setItem(STORAGE_KEY_THREADS, JSON.stringify(threads));
  }, [threads]);

  const threadList = useMemo(() => sortThreads(threadRecordToList(threads)), [threads]);
  const unreadTotal = useMemo(
    () => threadList.reduce((s, t) => s + t.unreadCount, 0),
    [threadList]
  );

  const messageMap = useMemo(() => {
    const map = new Map<string, { threadId: string; msg: Message }>();
    for (const [threadId, t] of Object.entries(threads)) {
      for (const msg of t.messages) map.set(msg.id, { threadId, msg });
    }
    return map;
  }, [threads]);

  const effectiveActiveThreadId =
    activeThreadId && threadList.some((t) => t.id === activeThreadId)
      ? activeThreadId
      : threadList[0]?.id ?? null;

  const setActiveThreadId = useCallback((id: string | null) => {
    setActiveThreadIdState(id);
    if (id) {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_THREAD, id);
      } catch {}
    }
  }, []);

  const addMessage = useCallback((msg: Message) => {
    setThreads((prev) => addMessageToThread(prev, msg));
  }, []);

  const updateMessageInThreadCb = useCallback(
    (threadId: string, updater: (m: Message) => Message) => {
      setThreads((prev) => updateMessageInThread(prev, threadId, updater));
    },
    []
  );

  const setThreadReadAt = useCallback((threadId: string, readAt: number) => {
    setThreads((prev) =>
      updateMessageInThread(prev, threadId, (m) =>
        m.senderId === MESSAGE_SENDER.VISITOR ? { ...m, readAt } : m
      )
    );
  }, []);

  const getMessage = useCallback(
    (messageId: string): { threadId: string; msg: Message } | null =>
      messageMap.get(messageId) ?? null,
    [messageMap]
  );

  const value: ThreadContextValue = useMemo(
    () => ({
      threads,
      threadList,
      activeThreadId: effectiveActiveThreadId,
      visitorThreadId,
      setActiveThreadId,
      unreadTotal,
      addMessage,
      updateMessageInThread: updateMessageInThreadCb,
      setThreadReadAt,
      getMessage,
    }),
    [
      threads,
      threadList,
      effectiveActiveThreadId,
      visitorThreadId,
      setActiveThreadId,
      unreadTotal,
      addMessage,
      updateMessageInThreadCb,
      setThreadReadAt,
      getMessage,
    ]
  );

  return <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>;
};
