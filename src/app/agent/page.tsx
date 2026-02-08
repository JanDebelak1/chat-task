'use client';

import { useThreads } from '@/context/ThreadContext';
import { ThreadView } from '@/components/agent/ThreadView';

export default function AgentPage() {
  const { activeThreadId } = useThreads();

  return activeThreadId ? (
    <ThreadView threadId={activeThreadId} />
  ) : (
    <div className="flex-1 flex items-center justify-center text-text-muted">
      Select a conversation or start one from the visitor side.
    </div>
  );
}
