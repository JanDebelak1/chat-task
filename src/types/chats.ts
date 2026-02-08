export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  ERROR: 'error',
} as const;

export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

export const MESSAGE_SENDER = {
  VISITOR: 'visitor',
  AGENT: 'agent',
} as const;

export type MessageSender = (typeof MESSAGE_SENDER)[keyof typeof MESSAGE_SENDER];

export interface Message {
  id: string;
  threadId: string;
  senderId: MessageSender;
  text: string;
  timestamp: number;
  status: MessageStatus;
  readAt?: number;
}

export interface ThreadState {
  id: string;
  messages: Message[];
}

export interface Thread {
  id: string;
  lastMessagePreview: string;
  lastMessageAt: number;
  unreadCount: number;
  lastMessageSenderId: MessageSender;
}

export interface TypingPayload {
  threadId: string;
  senderId: MessageSender;
  isTyping: boolean;
}
