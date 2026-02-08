'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useChat } from '@/context/ChatContext';
import { MESSAGE_SENDER } from '@/types/chats';
import { useThreads } from '@/context/ThreadContext';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';

interface ThreadViewProps {
  threadId: string;
  senderId?: typeof MESSAGE_SENDER.AGENT | typeof MESSAGE_SENDER.VISITOR;
}

export const ThreadView = ({ threadId, senderId = MESSAGE_SENDER.AGENT }: ThreadViewProps) => {
  const [text, setText] = useState('');
  const { sendMessage, retryMessage, typingByThread, setTyping, markThreadRead } = useChat();
  const { threads, setActiveThreadId } = useThreads();
  
  const messages = useMemo(() => threads[threadId]?.messages ?? [], [threads, threadId]);
  const typing = typingByThread[threadId];
  const otherSender = senderId === MESSAGE_SENDER.AGENT ? MESSAGE_SENDER.VISITOR : MESSAGE_SENDER.AGENT;
  const typingLabel = typing === otherSender ? (otherSender === MESSAGE_SENDER.VISITOR ? 'Visitor' : 'Agent') : null;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const audioUnlockedRef = useRef(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/notification.wav');
  }, []);

  const unlockAudio = useCallback(() => {
    if (!audioUnlockedRef.current && audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current.play().then(() => {
        if (audioRef.current) {
          audioRef.current.muted = false;
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        audioUnlockedRef.current = true;
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const otherMessages = messages.filter(m => m.senderId === otherSender);
    if (otherMessages.length > prevMessageCountRef.current && !isTabVisible && senderId === MESSAGE_SENDER.VISITOR) {
      audioRef.current?.play().catch(() => {});
    }
    prevMessageCountRef.current = otherMessages.length;
  }, [messages, otherSender, isTabVisible, senderId]);

  useEffect(() => {
    setActiveThreadId(threadId);
    markThreadRead(threadId);
  }, [threadId, setActiveThreadId, markThreadRead]);

  const handleSend = useCallback(() => {
    if (!text.trim()) return;
    unlockAudio();
    sendMessage(text.trim(), senderId);
    setText('');
    setTyping(threadId, false, senderId);
  }, [text, sendMessage, setTyping, threadId, senderId, unlockAudio]);

  const handleTypingChange = useCallback(
    (isTyping: boolean) => {
      setTyping(threadId, isTyping, senderId);
    },
    [setTyping, threadId, senderId]
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 p-3 border-b border-border-default shrink-0">
        <h2 className="text-lg font-semibold text-text">Conversation</h2>
      </div>
      <MessageList
        messages={messages}
        threadId={threadId}
        currentUserId={senderId}
        onRetry={retryMessage}
        typingLabel={typingLabel}
      />
      <ChatInput
        value={text}
        onChange={setText}
        onSend={handleSend}
        onFocus={unlockAudio}
        onTypingChange={handleTypingChange}
        placeholder={senderId === MESSAGE_SENDER.AGENT ? 'Reply…' : 'Type a message…'}
        threadId={threadId}
      />
    </div>
  );
};