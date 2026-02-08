'use client';

import { useState, useEffect } from 'react';
import { ThreadView } from '@/components/agent/ThreadView';
import { MESSAGE_SENDER } from '@/types/chats';
import { useThreads } from '@/context/ThreadContext';
import { STORAGE_KEY_VISITOR_THREAD_ID } from '@/constants';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { visitorThreadId } = useThreads();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let visitorId = sessionStorage.getItem(STORAGE_KEY_VISITOR_THREAD_ID);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      sessionStorage.setItem(STORAGE_KEY_VISITOR_THREAD_ID, visitorId);
      window.location.reload();
    }
  }, []);

  if (!visitorThreadId) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-surface border border-border-default rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-default bg-primary">
            <div>
              <h3 className="font-semibold text-white">Chat with us</h3>
              <p className="text-xs text-white/80">We typically reply in a few minutes</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80 text-2xl leading-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ThreadView threadId={visitorThreadId} senderId={MESSAGE_SENDER.VISITOR} />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </>
  );
};
