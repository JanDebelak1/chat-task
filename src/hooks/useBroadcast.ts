import { Message, TypingPayload } from '@/types/chats';
import { useEffect, useRef, useCallback } from 'react';

export const BROADCAST_TYPE = {
  message: 'message',
  typing: 'typing',
  read_receipt: 'read_receipt',
} as const;

 const BROADCAST_CHANNEL_NAME = 'minicom_channel';


export type BroadcastPayload =
  | { type: typeof BROADCAST_TYPE.message; data: Message }
  | { type: typeof BROADCAST_TYPE.typing; data: TypingPayload }
  | { type: typeof BROADCAST_TYPE.read_receipt; data: { threadId: string; readAt: number } };

export interface BroadcastMessage {
  type: typeof BROADCAST_TYPE.message;
  data: Message;
}

export const useBroadcast = (
  onMessage: (payload: { type: typeof BROADCAST_TYPE.message; data: Message }) => void,
  onTyping?: (payload: TypingPayload) => void,
  onReadReceipt?: (payload: { threadId: string; readAt: number }) => void
) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<BroadcastPayload>) => {
      const payload = event.data;
      if (payload.type === BROADCAST_TYPE.message) onMessage(payload);
      else if (payload.type === BROADCAST_TYPE.typing && onTyping) onTyping(payload.data);
      else if (payload.type === BROADCAST_TYPE.read_receipt && onReadReceipt) onReadReceipt(payload.data);
    };
    channelRef.current = channel;
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [onMessage, onTyping, onReadReceipt]);

  const send = useCallback((payload: BroadcastPayload) => {
    channelRef.current?.postMessage(payload);
  }, []);

  return { send };
};
