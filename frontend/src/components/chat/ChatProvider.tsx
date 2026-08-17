import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Conversation, Message, QuickReply } from '@/types/chat';
import type { ChatContextSnapshot } from '@/types/activity';
import {
  DUMMY_CONVERSATIONS,
  DEFAULT_QUICK_REPLIES,
  generateId,
} from '@/data/chatDummy';
import { chatService } from '@/services/chat.service';
import { useNotificationStore } from '@/store/notification.store';

// ─── Chat Domain Context ──────────────────────────────────────────────────────

type ChatContextValue = {
  // Window state
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;

  // Conversations
  conversations: Conversation[];
  activeConversationId: string;
  activeConversation: Conversation;
  setActiveConversation: (id: string) => void;
  startNewConversation: () => void;
  clearActiveConversation: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredConversations: Conversation[];

  // Messages
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string) => void;

  // Quick replies
  quickReplies: QuickReply[];

  // Context snapshot (real user data from all modules)
  contextSnapshot: ChatContextSnapshot | null;
  isLoadingContext: boolean;
  contextError: string | null;
  refreshContext: () => Promise<void>;

  // Offline status
  isOffline: boolean;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
  return ctx;
}

// ─── Helpers for Caching / Persistence ────────────────────────────────────────

const STORAGE_CONVS_KEY = 'focusforge_chat_conversations';
const STORAGE_ACTIVE_KEY = 'focusforge_chat_active_conv_id';

function parseConversations(str: string | null): Conversation[] {
  if (!str) return [];
  try {
    const data = JSON.parse(str);
    if (!Array.isArray(data)) return [];
    return data.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp),
      messages: (c.messages || []).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

// ─── Welcome Template ─────────────────────────────────────────────────────────

const WELCOME_CONVERSATION: Conversation = {
  id: 'welcome',
  title: 'New conversation',
  preview: 'Ask me anything about studying...',
  timestamp: new Date(),
  unread: false,
  messages: [
    {
      id: 'welcome-msg',
      role: 'bot',
      content:
        "Hi! I'm your **FocusForge AI Coach** 👋\n\nI can help you with:\n- Building study schedules\n- Pomodoro tips and techniques\n- Managing tasks and priorities\n- Staying motivated and focused\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    },
  ],
};

// ─── Provider ─────────────────────────────────────────────────────────────────

type ChatProviderProps = { children: React.ReactNode };

export function ChatProvider({ children }: ChatProviderProps) {
  const notify = useNotificationStore((s) => s.notify);

  // ── Offline state ──────────────────────────────────────────────────────────
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      notify({
        title: 'Connected',
        message: 'You are back online. Chat services restored.',
        tone: 'success',
      });
    };
    const handleOffline = () => {
      setIsOffline(true);
      notify({
        title: 'Offline',
        message: 'No internet connection. Chatbot features running in local-only mode.',
        tone: 'warning',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notify]);

  // ── Window & UI state ──────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ── Conversation state (hydrated from cache) ───────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const cached = localStorage.getItem(STORAGE_CONVS_KEY);
    const parsed = parseConversations(cached);
    // Only seed welcome conversation — never dummy data in production
    return parsed.length > 0 ? parsed : [WELCOME_CONVERSATION];
  });

  const [activeConversationId, setActiveConversationId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_ACTIVE_KEY) || 'welcome';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup typing timer on unmount to prevent state updates on unmounted component
  useEffect(() => {
    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, []);

  // ── Context snapshot (real user data) ─────────────────────────────────────
  const [contextSnapshot, setContextSnapshot] = useState<ChatContextSnapshot | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const contextFetchedRef = useRef(false);

  // ── Persist to localStorage ──────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_CONVS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVE_KEY, activeConversationId);
  }, [activeConversationId]);

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Chat: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((v) => !v);
      }

      // Close Chat: Esc
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }

      // Toggle Sidebar: Ctrl+J
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j' && isOpen) {
        e.preventDefault();
        setIsSidebarOpen((v) => !v);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) ?? conversations[0] ?? WELCOME_CONVERSATION;
  const messages = activeConversation?.messages ?? [];

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Fetch real context snapshot when chat opens ────────────────────────────
  const refreshContext = useCallback(async () => {
    setIsLoadingContext(true);
    setContextError(null);
    try {
      const snapshot = await chatService.buildContextSnapshot();
      setContextSnapshot(snapshot);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load context';
      setContextError(message);
      notify({
        title: 'Context Sync Error',
        message: 'Could not sync latest tasks and streak information.',
        tone: 'error',
      });
    } finally {
      setIsLoadingContext(false);
    }
  }, [notify]);

  // Fetch once when first opened
  useEffect(() => {
    if (isOpen && !contextFetchedRef.current) {
      contextFetchedRef.current = true;
      refreshContext();
    }
  }, [isOpen, refreshContext]);

  // ── Window actions ─────────────────────────────────────────────────────────
  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => {
    setIsOpen(false);
    // Reset the context-fetched flag so we get fresh data on next open
    contextFetchedRef.current = false;
  }, []);
  const toggleChat = useCallback(() => setIsOpen((v) => !v), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), []);

  // ── Conversation actions ───────────────────────────────────────────────────
  const setActiveConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: false } : c)),
    );
  }, []);

  const startNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New conversation',
      preview: 'Start a new session...',
      timestamp: new Date(),
      unread: false,
      messages: [
        {
          id: generateId(),
          role: 'bot',
          content:
            "Hello again! 👋 What would you like to focus on in this session? I'm here to help you study smarter.",
          timestamp: new Date(),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  }, []);

  const clearActiveConversation = useCallback(() => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversationId) return c;
        const welcomeMsg: Message = {
          id: generateId(),
          role: 'bot',
          content: 'Conversation cleared! What would you like to explore next?',
          timestamp: new Date(),
        };
        return { ...c, messages: [welcomeMsg], preview: welcomeMsg.content };
      }),
    );
    notify({
      title: 'Conversation Cleared',
      tone: 'info',
    });
  }, [activeConversationId, notify]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isTyping) return;

      // Note: offline guard is inside commandEngine — local commands still work offline.
      // Only AI backend calls are blocked when offline.

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      // Append user message
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeConversationId) return c;
          const title =
            c.title === 'New conversation' && c.messages.length <= 1
              ? content.slice(0, 40)
              : c.title;
          return {
            ...c,
            title,
            preview: content.slice(0, 60),
            timestamp: new Date(),
            messages: [...c.messages, userMsg],
          };
        }),
      );

      // Show typing indicator
      setIsTyping(true);

      try {
        const { commandEngine } = await import('@/services/commandEngine');
        const result = await commandEngine.processMessage(content, contextSnapshot, activeConversationId, isOffline);

        // Simulate a brief natural delay before showing response
        const delay = 600 + Math.random() * 600;
        typingTimer.current = setTimeout(() => {
          const botMsg: Message = {
            id: generateId(),
            role: 'bot',
            content: result.reply,
            timestamp: new Date(),
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id !== activeConversationId) return c;
              return {
                ...c,
                preview: result.reply.slice(0, 60) + '...',
                timestamp: new Date(),
                messages: [...c.messages, botMsg],
              };
            }),
          );

          // Handle client-side action if returned (e.g. Navigation)
          if (result.action.type === 'NAVIGATE') {
            window.dispatchEvent(
              new CustomEvent('chat:navigate', { detail: { path: result.action.path } })
            );
          }

          setIsTyping(false);
          // Refresh context after executing command to show updated state
          refreshContext();
        }, delay);
      } catch (err) {
        setIsTyping(false);
        notify({
          title: 'Communication Error',
          message: 'An error occurred while generating a response from the AI coach.',
          tone: 'error',
        });
      }
    },
    [activeConversationId, isTyping, contextSnapshot, refreshContext, isOffline, notify],
  );

  const value: ChatContextValue = {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    isSidebarOpen,
    toggleSidebar,
    conversations,
    activeConversationId,
    activeConversation,
    setActiveConversation,
    startNewConversation,
    clearActiveConversation,
    searchQuery,
    setSearchQuery,
    filteredConversations,
    messages,
    isTyping,
    sendMessage,
    quickReplies: DEFAULT_QUICK_REPLIES,
    contextSnapshot,
    isLoadingContext,
    contextError,
    refreshContext,
    isOffline,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
