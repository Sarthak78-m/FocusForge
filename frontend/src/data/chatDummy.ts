import type { Conversation, QuickReply } from '@/types/chat';

// ─── Dummy Conversations ──────────────────────────────────────────────────────

export const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Getting started with Pomodoro',
    preview: 'Try working in 25-minute sprints...',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: false,
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'What is the Pomodoro technique?',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: 'm2',
        role: 'bot',
        content:
          'The **Pomodoro Technique** is a time management method that breaks work into focused intervals:\n\n- Work for **25 minutes** without interruption\n- Take a **5-minute** short break\n- After **4 cycles**, take a longer **15–30 minute** break\n\nThis rhythm helps maintain high focus while preventing mental fatigue. Your FocusForge timer is already set up for this! 🍅',
        timestamp: new Date(Date.now() - 1000 * 60 * 9),
      },
      {
        id: 'm3',
        role: 'user',
        content: 'How do I stay consistent with it?',
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
      },
      {
        id: 'm4',
        role: 'bot',
        content:
          'Great question! Here are proven strategies to stay consistent:\n\n1. **Start small** — commit to just 2 Pomodoros per day initially\n2. **Track your sessions** — FocusForge logs your completed sessions\n3. **Remove distractions** — put your phone face-down during focus time\n4. **Honor the breaks** — don\'t skip them, they\'re part of the system\n\nConsistency builds momentum. After 2 weeks, it becomes automatic. 💪',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'Study schedule planning',
    preview: 'Based on your tasks, I suggest...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: true,
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'Help me plan my study schedule for this week',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 - 1000 * 60 * 5),
      },
      {
        id: 'm6',
        role: 'bot',
        content:
          'I\'d love to help! Here\'s a structured weekly study plan:\n\n**Morning Block (8–10 AM)**\n- 2 Pomodoro sessions on your hardest subject\n- Review notes from the previous day\n\n**Afternoon Block (2–4 PM)**\n- Practice problems or assignments\n- 1 Pomodoro for review\n\n**Evening Block (7–8 PM)**\n- Light review only\n- Plan tomorrow\'s tasks\n\nWould you like me to tailor this to your specific subjects or deadlines?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  },
  {
    id: 'conv-3',
    title: 'Managing task overwhelm',
    preview: 'When you feel overwhelmed, start with...',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unread: false,
    messages: [
      {
        id: 'm7',
        role: 'user',
        content: 'I have too many tasks and feel overwhelmed. What should I do?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60),
      },
      {
        id: 'm8',
        role: 'bot',
        content:
          'Feeling overwhelmed is completely normal. Here\'s a simple triage approach:\n\n**Step 1: Brain dump**\nList every task without filtering. Getting it out of your head reduces anxiety immediately.\n\n**Step 2: Prioritize with the 2×2 matrix**\n- `Urgent + Important` → Do now\n- `Important, not urgent` → Schedule\n- `Urgent, not important` → Delegate or minimize\n- `Neither` → Drop it\n\n**Step 3: Pick your "One Thing"**\nChoose the single most impactful task and start a Pomodoro on it right now.\n\nYou only need to take the next small step. 🎯',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ],
  },
];

// ─── Bot Response Pool ────────────────────────────────────────────────────────

export const BOT_RESPONSES: Record<string, string> = {
  default:
    'That\'s a great question! As your FocusForge study coach, I\'m here to help you learn smarter, not harder. Could you tell me more about what you\'re working on so I can give you the most relevant advice?',
  schedule:
    'Building a great study schedule starts with knowing your peak energy hours. Most students focus best in the **morning (8–11 AM)** or **early evening (5–8 PM)**.\n\nHere\'s a template:\n\n1. **Identify** your top 3 tasks for the day\n2. **Block** 90-minute deep work sessions for complex topics\n3. **Reserve** lighter tasks for post-lunch dips\n4. **End** each day with a 10-minute review\n\nWant me to create a more personalized schedule based on your current tasks?',
  tip: 'Here\'s a study tip that top students swear by:\n\n**Active Recall > Passive Reading**\n\nInstead of re-reading your notes, close them and try to recall the key points from memory. This forces your brain to strengthen the neural pathways.\n\n> 💡 *Studies show active recall can improve retention by up to 50% compared to passive review.*\n\nTry it with your next study session!',
  pomodoro:
    'The Pomodoro Technique is already built into FocusForge! Here\'s how to get the most from it:\n\n- **Work sessions**: 25 minutes of deep focus\n- **Short breaks**: 5 minutes to rest\n- **Long breaks**: 15 minutes after every 4 sessions\n\n**Pro tip**: Use breaks to *physically* move — stand up, stretch, or take a short walk. This restores mental energy faster than scrolling your phone. 🚶',
  tasks:
    'Managing tasks effectively is a skill. Here\'s what works:\n\n**The 3-task rule**\nPick only 3 tasks per day as "must complete." This prevents overwhelm and gives you a clear target.\n\n**Capture everything**\nAnytime a task appears in your mind, add it to FocusForge immediately. Don\'t trust your memory.\n\n**Review weekly**\nEvery Sunday, spend 15 minutes reviewing what\'s done, what\'s pending, and what\'s no longer relevant.\n\nYour FocusForge task board is perfect for this workflow!',
};

// ─── Quick Reply Suggestions ──────────────────────────────────────────────────

export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  { id: 'qr-1', label: '📅 Study schedule', prompt: 'Help me plan my study schedule' },
  { id: 'qr-2', label: '💡 Study tip', prompt: 'Give me a study tip' },
  { id: 'qr-3', label: '🍅 Pomodoro guide', prompt: 'How do I use the Pomodoro technique?' },
  { id: 'qr-4', label: '✅ Task advice', prompt: 'How do I manage my tasks effectively?' },
  { id: 'qr-5', label: '😰 I\'m overwhelmed', prompt: 'I have too many tasks and feel overwhelmed. What should I do?' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBotResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes('schedule') || lower.includes('plan')) return BOT_RESPONSES.schedule;
  if (lower.includes('tip') || lower.includes('trick')) return BOT_RESPONSES.tip;
  if (lower.includes('pomodoro') || lower.includes('timer') || lower.includes('focus'))
    return BOT_RESPONSES.pomodoro;
  if (lower.includes('task') || lower.includes('overwhelm') || lower.includes('manage'))
    return BOT_RESPONSES.tasks;
  return BOT_RESPONSES.default;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
