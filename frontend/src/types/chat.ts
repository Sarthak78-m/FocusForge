// ─── Chat Domain Types ────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'bot';

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
};

export type Conversation = {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  unread: boolean;
  messages: Message[];
};

export type QuickReply = {
  id: string;
  label: string;
  prompt: string;
};
