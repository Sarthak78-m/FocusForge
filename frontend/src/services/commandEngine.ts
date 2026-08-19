import type { ChatContextSnapshot } from '@/types/activity';
import { recognize, type RecognisedIntent } from '@/services/intentService';
import { execute, type ExecutionResult, type ChatAction } from '@/services/commandExecutor';
import { buildReply } from '@/services/contextBuilder';

export type CommandEngineResponse = {
  reply: string;
  action: ChatAction;
  intent: RecognisedIntent;
};

export const commandEngine = {
  /**
   * Processes a user message through the NLP parsing and command execution pipeline.
   *
   * @param message        The raw user text input.
   * @param snapshot       The current work context snapshot containing task state.
   * @param conversationId Optional conversation ID for session state tracking.
   * @param isOffline      Whether the app currently has no network connection.
   *                       Only blocks AI backend calls \u2014 local commands still work.
   */
  async processMessage(
    message: string,
    snapshot: ChatContextSnapshot | null,
    conversationId: string = 'default-session',
    isOffline: boolean = false
  ): Promise<CommandEngineResponse> {
    // 1. Intent Recognition
    const intent = recognize(message);

    // 2. If intent is UNKNOWN, route to the backend AI chat endpoint
    if (intent.type === 'UNKNOWN') {
      // Guard: backend requires network. Show friendly offline message for AI queries only.
      if (isOffline) {
        return {
          reply: "📶 **You're currently offline.**\n\nI can still help you with your tasks, timer, and work data \u2014 those work offline! For AI-powered coaching and general questions, please reconnect to the internet.\n\nTry: *\"What are my tasks today?\"* or *\"Show my streak\"*",
          action: { type: 'NONE' },
          intent,
        };
      }

      try {
        const { chatService } = await import('@/services/chat.service');
        const apiResponse = await chatService.sendMessage({
          conversationId,
          message,
          context: snapshot ?? {
            fetchedAt: new Date().toISOString(),
            pendingTasks: [],
            overdueTasks: [],
            activeGoals: [],
            pomodoroStats: null,
            analytics: null,
            upcomingDeadlines: [],
            quizHistory: [],
            recentActivity: [],
            recentNotes: [],
            recentDocuments: []
          }
        });
        return {
          reply: apiResponse.reply,
          action: { type: 'NONE' },
          intent
        };
      } catch (err) {
        return {
          reply: "⚠️ **productivity coach AI service is currently offline or unreachable.**\n\nI couldn't contact the AI coach service. Please ensure the Spring Boot server is running on port 8080.\n\nYou can still use task, streak, and timer commands \u2014 try *\"Today's tasks\"* or *\"Show my streak\"*!",
          action: { type: 'NONE' },
          intent
        };
      }
    }

    // 3. Otherwise, execute locally using the command executor (always works, even offline)
    const execution = await execute(intent, snapshot);

    // 4. Response Formatting (Reply Generation)
    const reply = buildReply(execution.commandResult);

    return {
      reply,
      action: execution.action,
      intent
    };
  }
};

