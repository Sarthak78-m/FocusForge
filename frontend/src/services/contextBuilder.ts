/**
 * contextBuilder.ts
 *
 * Formats raw execution data from commandExecutor into human-readable
 * markdown strings suitable for the chat bot reply bubble.
 *
 * Rules:
 * - Always returns a non-empty string
 * - Uses the shared MarkdownContent component's supported syntax:
 *   **bold**, *italic*, `code`, - lists, 1. numbered lists, > blockquote
 * - Keeps responses concise but informative
 * - Handles empty/null states with helpful fallback messages
 */

import type { IntentType } from '@/services/intentService';
import type { ChatContextSnapshot } from '@/types/activity';

// ─── Result Shapes (from commandExecutor) ─────────────────────────────────────

export type CommandResult =
  | { intent: 'TODAY_TASKS'; tasks: TaskItem[]; overdue: OverdueItem[] }
  | { intent: 'TOMORROW_TASKS'; tasks: TaskItem[] }
  | { intent: 'PENDING_GOALS'; goals: GoalItem[] }
  | { intent: 'COMPLETED_GOALS'; goals: GoalItem[] }
  | { intent: 'SHOW_ANALYTICS'; analytics: AnalyticsData | null }
  | { intent: 'START_POMODORO'; action: 'navigate' }
  | { intent: 'STOP_POMODORO'; action: 'navigate' }
  | { intent: 'RESUME_TIMER'; action: 'navigate' }
  | { intent: 'COMPLETE_TASK'; success: boolean; taskTitle: string; error?: string }
  | { intent: 'DELETE_TASK'; success: boolean; taskTitle: string; error?: string }
  | { intent: 'MOVE_TASK'; taskTitle: string; action: 'navigate' }
  | { intent: 'GENERATE_QUIZ'; subject?: string; action: 'navigate' }
  | { intent: 'OPEN_NOTES'; action: 'navigate' }
  | { intent: 'WEAK_SUBJECTS'; subjects: string[] }
  | { intent: 'STRONG_SUBJECTS'; subjects: string[] }
  | { intent: 'STUDY_STREAK'; streak: number | null; todayMinutes: number | null; weeklyMinutes: number | null }
  | { intent: 'UPCOMING_EXAM'; deadlines: DeadlineItem[] }
  | { intent: 'RECOMMENDED_STUDY_ORDER'; snapshot: ChatContextSnapshot | null; success: boolean; reason?: string }
  | { intent: 'ESTIMATE_COMPLETION'; snapshot: ChatContextSnapshot | null; success: boolean; reason?: string }
  | { intent: 'UNKNOWN'; input: string };

// ─── Shared Data Shapes ───────────────────────────────────────────────────────

export type TaskItem = {
  id: number;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
};

export type OverdueItem = {
  id: number;
  title: string;
  dueDate: string;
};

export type GoalItem = {
  id: number;
  title: string;
  progressPercent: number;
  targetDate: string;
};

export type DeadlineItem = {
  id: number;
  title: string;
  dueDate: string;
  urgent: boolean;
  type: string;
};

export type AnalyticsData = {
  weeklyCompletedTasks: number;
  taskCompletionRate: number;
  weakSubjects: string[];
  strongSubjects: string[];
  mostStudiedSubject: string | null;
};

// ─── Format Helpers ───────────────────────────────────────────────────────────

const PRIORITY_EMOJI: Record<string, string> = {
  HIGH: '🔴',
  MEDIUM: '🟡',
  LOW: '🟢',
};

const DEADLINE_TYPE_LABEL: Record<string, string> = {
  EXAM: '📝 Exam',
  ASSIGNMENT: '📋 Assignment',
  PROJECT: '🗂️ Project',
  OTHER: '📌 Other',
};

function priorityBadge(priority: string): string {
  return PRIORITY_EMOJI[priority.toUpperCase()] ?? '⚪';
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function progressBar(pct: number): string {
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${pct}%`;
}

function completionRate(rate: number): string {
  const pct = Math.round(rate * 100);
  const bar = progressBar(pct);
  return `${bar}`;
}

// ─── Intent Reply Builders ────────────────────────────────────────────────────

function buildTodayTasks(result: Extract<CommandResult, { intent: 'TODAY_TASKS' }>): string {
  const { tasks, overdue } = result;
  const lines: string[] = [];

  if (overdue.length > 0) {
    lines.push(`⚠️ **${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}:**`);
    overdue.forEach((t) => {
      lines.push(`- ${t.title} *(was due ${formatDate(t.dueDate)})*`);
    });
    lines.push('');
  }

  if (tasks.length === 0 && overdue.length === 0) {
    return '🎉 **All clear for today!** No tasks due. Great time to get ahead or take a well-earned break.';
  }

  if (tasks.length > 0) {
    lines.push(`📋 **${tasks.length} task${tasks.length > 1 ? 's' : ''} for today:**`);
    tasks.forEach((t) => {
      const badge = priorityBadge(t.priority);
      const due = t.dueDate ? ` · due ${formatDate(t.dueDate)}` : '';
      lines.push(`- ${badge} ${t.title}${due}`);
    });
  } else {
    lines.push('✅ No new tasks due today.');
  }

  lines.push('');
  lines.push('> 💡 *Say "complete task [name]" to tick one off.*');

  return lines.join('\n');
}

function buildTomorrowTasks(result: Extract<CommandResult, { intent: 'TOMORROW_TASKS' }>): string {
  const { tasks } = result;
  if (tasks.length === 0) {
    return '✅ **Nothing due tomorrow.** Looks like a lighter day ahead — a good chance to work ahead on your goals.';
  }
  const lines = [`📅 **${tasks.length} task${tasks.length > 1 ? 's' : ''} due tomorrow:**`];
  tasks.forEach((t) => {
    lines.push(`- ${priorityBadge(t.priority)} ${t.title}`);
  });
  lines.push('');
  lines.push('> Plan your sessions today to be ready.');
  return lines.join('\n');
}

function buildPendingGoals(result: Extract<CommandResult, { intent: 'PENDING_GOALS' }>): string {
  const { goals } = result;
  if (goals.length === 0) {
    return "🎯 **No active goals yet.**\n\nGoals help you stay focused on what matters. Try setting one for this week!";
  }
  const lines = [`🎯 **${goals.length} active goal${goals.length > 1 ? 's' : ''}:**\n`];
  goals.forEach((g) => {
    const days = daysUntil(g.targetDate);
    const daysLabel = days < 0
      ? `*(${Math.abs(days)}d overdue)*`
      : days === 0
      ? '*(due today)*'
      : `*(${days}d left)*`;
    lines.push(`**${g.title}** ${daysLabel}`);
    lines.push(`\`${progressBar(g.progressPercent)}\``);
    lines.push('');
  });
  return lines.join('\n');
}

function buildCompletedGoals(result: Extract<CommandResult, { intent: 'COMPLETED_GOALS' }>): string {
  const { goals } = result;
  if (goals.length === 0) {
    return "🏁 **No completed goals yet.** Keep working — you'll get there!";
  }
  const lines = [`🏆 **${goals.length} completed goal${goals.length > 1 ? 's' : ''}:**`];
  goals.forEach((g) => {
    lines.push(`- ✅ ${g.title}`);
  });
  return lines.join('\n');
}

function buildAnalytics(result: Extract<CommandResult, { intent: 'SHOW_ANALYTICS' }>): string {
  const { analytics } = result;
  if (!analytics) {
    return '📊 **Analytics not available yet.**\n\nYour analytics dashboard is being set up. Keep studying — data will appear once your backend analytics module is live.\n\n> Navigate to **Analytics** in the sidebar for more.';
  }

  const rate = Math.round(analytics.taskCompletionRate * 100);
  const lines = [
    '📊 **Your Study Analytics**\n',
    `- **Tasks completed this week:** ${analytics.weeklyCompletedTasks}`,
    `- **Completion rate:** ${rate}%`,
  ];

  if (analytics.mostStudiedSubject) {
    lines.push(`- **Most studied:** ${analytics.mostStudiedSubject}`);
  }
  if (analytics.strongSubjects.length > 0) {
    lines.push(`- **Strong subjects:** ${analytics.strongSubjects.join(', ')}`);
  }
  if (analytics.weakSubjects.length > 0) {
    lines.push(`- **Needs attention:** ${analytics.weakSubjects.join(', ')}`);
  }

  lines.push('');
  lines.push('> 📈 *Visit the Analytics page for charts and deeper insights.*');
  return lines.join('\n');
}

function buildPomodoroNav(intent: 'START_POMODORO' | 'STOP_POMODORO' | 'RESUME_TIMER'): string {
  const messages: Record<typeof intent, string> = {
    START_POMODORO:
      "🍅 **Ready to focus!**\n\nI've opened the Pomodoro timer for you. Your session is set for **25 minutes** of deep work.\n\n> Remember: silence notifications and put your phone away. The next 25 minutes are yours.",
    STOP_POMODORO:
      '⏸️ **Pausing your session.**\n\nHead to the Pomodoro page to pause or stop your timer. Take a breath — you can resume any time.',
    RESUME_TIMER:
      '▶️ **Resuming focus mode.**\n\nYour Pomodoro timer is waiting. Pick up right where you left off — consistency is the key!',
  };
  return messages[intent];
}

function buildCompleteTask(result: Extract<CommandResult, { intent: 'COMPLETE_TASK' }>): string {
  if (result.success) {
    return `✅ **"${result.taskTitle}"** marked as complete!\n\nGreat work. Every completed task is a step forward. 💪`;
  }
  if (result.error === 'NOT_FOUND') {
    return `❌ I couldn't find a task matching **"${result.taskTitle}"**.\n\nTry rephrasing or check your task list. You can say:\n> *"complete task Review Chapter 5"*`;
  }
  if (result.error === 'NO_ENTITY') {
    return "Which task would you like to complete?\n\nSay something like:\n> *\"complete task [task name]\"*";
  }
  return `⚠️ Couldn't complete the task right now. Please try again or use the task list.`;
}

function buildDeleteTask(result: Extract<CommandResult, { intent: 'DELETE_TASK' }>): string {
  if (result.success) {
    return `🗑️ **"${result.taskTitle}"** has been deleted.`;
  }
  if (result.error === 'NOT_FOUND') {
    return `❌ No task found matching **"${result.taskTitle}"**.\n\nDouble-check the name and try again.`;
  }
  if (result.error === 'NO_ENTITY') {
    return "Which task should I delete?\n\nSay:\n> *\"delete task [task name]\"*";
  }
  return `⚠️ Couldn't delete the task. Please try from the task list.`;
}

function buildMoveTask(result: Extract<CommandResult, { intent: 'MOVE_TASK' }>): string {
  if (result.taskTitle) {
    return `📅 To reschedule **"${result.taskTitle}"**, head to your Tasks page and update the due date there.\n\n> Tap **Tasks** in the sidebar → open the task → edit due date.`;
  }
  return "📅 To move or reschedule a task, visit your **Tasks** page and edit the due date.\n\n> Full reschedule support via the command interface is coming soon!";
}

function buildGenerateQuiz(result: Extract<CommandResult, { intent: 'GENERATE_QUIZ' }>): string {
  if (result.subject) {
    return `📝 **Quiz time on ${result.subject}!**\n\nI've navigated you to the Quiz section. Select your difficulty and hit Start to test yourself on **${result.subject}**.`;
  }
  return '📝 **Ready to quiz yourself?**\n\nHead to the Quiz section to pick a subject and difficulty level. Testing yourself is one of the most effective study techniques!';
}

function buildOpenNotes(): string {
  return '📓 **Opening your notes.**\n\nAll your notes are in the Notes section. You can search by subject or tag.';
}

function buildWeakSubjects(result: Extract<CommandResult, { intent: 'WEAK_SUBJECTS' }>): string {
  const { subjects } = result;
  if (subjects.length === 0) {
    return '🌟 **No weak subjects identified yet.**\n\nComplete more quizzes and study sessions so I can analyse your performance across subjects.';
  }
  const lines = ['📉 **Subjects that need more attention:**\n'];
  subjects.forEach((s) => lines.push(`- ⚠️ ${s}`));
  lines.push('');
  lines.push('> 💡 *Allocate extra Pomodoro sessions to these subjects this week.*');
  return lines.join('\n');
}

function buildStrongSubjects(result: Extract<CommandResult, { intent: 'STRONG_SUBJECTS' }>): string {
  const { subjects } = result;
  if (subjects.length === 0) {
    return '📊 **No strong subjects identified yet.**\n\nKeep studying and taking quizzes — your strengths will emerge!';
  }
  const lines = ['📈 **Your strongest subjects:**\n'];
  subjects.forEach((s) => lines.push(`- 💪 ${s}`));
  lines.push('');
  lines.push('> Keep these sharp while spending more time on weaker areas.');
  return lines.join('\n');
}

function buildStudyStreak(result: Extract<CommandResult, { intent: 'STUDY_STREAK' }>): string {
  const { streak, todayMinutes, weeklyMinutes } = result;

  if (streak === null) {
    return '🔥 **Streak data not available yet.**\n\nComplete Pomodoro sessions to start tracking your daily study streak!';
  }

  const lines = ['🔥 **Your Study Streak**\n'];
  lines.push(`- **Current streak:** ${streak} day${streak !== 1 ? 's' : ''}`);
  if (todayMinutes !== null) {
    lines.push(`- **Today:** ${todayMinutes} minutes studied`);
  }
  if (weeklyMinutes !== null) {
    lines.push(`- **This week:** ${weeklyMinutes} minutes`);
  }

  if (streak >= 7) {
    lines.push('\n> 🏆 *Excellent consistency! 7+ days — keep it up.*');
  } else if (streak >= 3) {
    lines.push('\n> 💪 *Great momentum! Aim for 7 days in a row.*');
  } else if (streak === 0) {
    lines.push('\n> 💡 *Start a Pomodoro session today to kick off your streak!*');
  } else {
    lines.push('\n> Keep going — streaks compound over time.');
  }

  return lines.join('\n');
}

function buildUpcomingExam(result: Extract<CommandResult, { intent: 'UPCOMING_EXAM' }>): string {
  const { deadlines } = result;
  if (deadlines.length === 0) {
    return '📅 **No upcoming exams or deadlines found.**\n\nAdd deadlines to your Study Planner to keep track of important dates.';
  }

  const lines = [`📅 **${deadlines.length} upcoming deadline${deadlines.length > 1 ? 's' : ''}:**\n`];
  deadlines.forEach((d) => {
    const days = daysUntil(d.dueDate);
    const daysLabel =
      days === 0 ? '**TODAY**' : days === 1 ? '**tomorrow**' : `in **${days} days**`;
    const urgentFlag = d.urgent ? ' 🚨' : '';
    const typeLabel = DEADLINE_TYPE_LABEL[d.type] ?? d.type;
    lines.push(`- ${typeLabel}${urgentFlag}: **${d.title}** — ${formatDate(d.dueDate)} *(${daysLabel})*`);
  });

  const hasUrgent = deadlines.some((d) => d.urgent);
  if (hasUrgent) {
    lines.push('');
    lines.push('> 🚨 *You have urgent deadlines. Prioritise these in today\'s Pomodoro sessions.*');
  }

  return lines.join('\n');
}

function buildRecommendedStudyOrder(
  result: Extract<CommandResult, { intent: 'RECOMMENDED_STUDY_ORDER' }>
): string {
  const { snapshot, success, reason } = result;
  if (!success || !snapshot) {
    if (reason === 'NO_CONTEXT') return '❌ Study context data is currently unavailable.';
    return '🎉 **All clean!** No pending tasks found. Set up some tasks to get study recommendations.';
  }

  const lines = ['📚 **Your Recommended Study Order:**\n'];
  const tasks = [...snapshot.pendingTasks];

  // Logic: 1. Overdue tasks first, then high priority, then matching weak subjects, then others.
  const overdueIds = new Set(snapshot.overdueTasks.map(t => t.id));
  const weakSubjectsLower = (snapshot.analytics?.weakSubjects ?? []).map(s => s.toLowerCase());

  tasks.sort((a, b) => {
    // Overdue first
    const aOverdue = overdueIds.has(a.id) ? 1 : 0;
    const bOverdue = overdueIds.has(b.id) ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    // High priority next
    const aHigh = a.priority === 'HIGH' ? 1 : 0;
    const bHigh = b.priority === 'HIGH' ? 1 : 0;
    if (aHigh !== bHigh) return bHigh - aHigh;

    // Weak subject matching next
    const aWeak = weakSubjectsLower.some(sub => a.title.toLowerCase().includes(sub)) ? 1 : 0;
    const bWeak = weakSubjectsLower.some(sub => b.title.toLowerCase().includes(sub)) ? 1 : 0;
    if (aWeak !== bWeak) return bWeak - aWeak;

    return 0;
  });

  tasks.slice(0, 5).forEach((t, i) => {
    const overdueMark = overdueIds.has(t.id) ? ' ⚠️ *OVERDUE*' : '';
    const badge = PRIORITY_EMOJI[t.priority.toUpperCase()] ?? '⚪';
    lines.push(`${i + 1}. ${badge} **${t.title}**${overdueMark} (${t.priority} priority)`);
  });

  lines.push('\n**Why this order?**');
  lines.push('- Overdue and High priority items require immediate focus.');
  if (weakSubjectsLower.length > 0) {
    lines.push('- Tasks related to your weak subjects are prioritized to strengthen knowledge gaps.');
  }

  return lines.join('\n');
}

function buildEstimateCompletion(
  result: Extract<CommandResult, { intent: 'ESTIMATE_COMPLETION' }>
): string {
  const { snapshot, success, reason } = result;
  if (!success || !snapshot) {
    if (reason === 'NO_CONTEXT') return '❌ Study context data is currently unavailable.';
    return '📋 **No tasks left today!** Nothing to estimate.';
  }

  // Calculate estimated completion based on pending tasks count.
  // Standard assumption: 45 minutes average study time per task.
  const taskCount = snapshot.pendingTasks.length;
  const avgMinutesPerTask = 45;
  const totalEstimatedMinutes = taskCount * avgMinutesPerTask;
  const hours = Math.floor(totalEstimatedMinutes / 60);
  const minutes = totalEstimatedMinutes % 60;

  const lines = ['⏱️ **Completion Estimate & Realistic Schedule:**\n'];
  lines.push(`- **Remaining Tasks:** ${taskCount}`);
  lines.push(`- **Estimated Time:** ${hours > 0 ? `${hours}h ` : ''}${minutes}m *(based on average speed of 45m/task)*`);

  // Compare with weekly/monthly stats if available
  if (snapshot.analytics) {
    const rate = Math.round(snapshot.analytics.taskCompletionRate * 100);
    lines.push(`- **Your typical completion rate:** ${rate}%`);
  }

  lines.push('\n**Suggested Realistic Schedule:**');
  const pomodoros = Math.ceil(totalEstimatedMinutes / 25);
  lines.push(`- Study block: **${pomodoros} Pomodoro session${pomodoros !== 1 ? 's' : ''}** (25m focus + 5m break each)`);
  
  if (pomodoros > 4) {
    lines.push('- ⚠️ **Note:** That is a lot for one stretch. Take a longer **15-minute break** after the 4th session.');
  }

  return lines.join('\n');
}

function buildUnknown(): string {
  return [
    "🤔 I couldn't understand that. Here are things I can help with:\n",
    '- **Tasks:** *"today\'s tasks"*, *"complete task [name]"*, *"delete task [name]"*',
    '- **Goals:** *"pending goals"*, *"completed goals"*',
    '- **Pomodoro:** *"start pomodoro"*, *"stop timer"*, *"resume timer"*',
    '- **Analytics:** *"show analytics"*, *"study streak"*',
    '- **Subjects:** *"weak subjects"*, *"strong subjects"*',
    '- **Exams:** *"upcoming exam"*',
    '- **Quiz:** *"quiz me"*, *"generate quiz on [subject]"*',
    '- **Notes:** *"open notes"*',
  ].join('\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a human-readable markdown reply from a CommandResult.
 */
export function buildReply(result: CommandResult): string {
  switch (result.intent) {
    case 'TODAY_TASKS':             return buildTodayTasks(result);
    case 'TOMORROW_TASKS':          return buildTomorrowTasks(result);
    case 'PENDING_GOALS':           return buildPendingGoals(result);
    case 'COMPLETED_GOALS':         return buildCompletedGoals(result);
    case 'SHOW_ANALYTICS':          return buildAnalytics(result);
    case 'START_POMODORO':          return buildPomodoroNav('START_POMODORO');
    case 'STOP_POMODORO':           return buildPomodoroNav('STOP_POMODORO');
    case 'RESUME_TIMER':            return buildPomodoroNav('RESUME_TIMER');
    case 'COMPLETE_TASK':           return buildCompleteTask(result);
    case 'DELETE_TASK':             return buildDeleteTask(result);
    case 'MOVE_TASK':               return buildMoveTask(result);
    case 'GENERATE_QUIZ':           return buildGenerateQuiz(result);
    case 'OPEN_NOTES':              return buildOpenNotes();
    case 'WEAK_SUBJECTS':           return buildWeakSubjects(result);
    case 'STRONG_SUBJECTS':         return buildStrongSubjects(result);
    case 'STUDY_STREAK':            return buildStudyStreak(result);
    case 'UPCOMING_EXAM':           return buildUpcomingExam(result);
    case 'RECOMMENDED_STUDY_ORDER': return buildRecommendedStudyOrder(result);
    case 'ESTIMATE_COMPLETION':     return buildEstimateCompletion(result);
    case 'UNKNOWN':                 return buildUnknown();
    default:                        return buildUnknown();
  }
}
