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
   * @param snapshot       The current study context snapshot containing task state.
   * @param conversationId Optional conversation ID for session state tracking.
   */
  async processMessage(
    message: string,
    snapshot: ChatContextSnapshot | null,
    conversationId: string = 'default-session'
  ): Promise<CommandEngineResponse> {
    // 1. Intent Recognition
    const intent = recognize(message);

    // 2. If intent is UNKNOWN, route directly to the backend AI chat endpoint
    if (intent.type === 'UNKNOWN') {
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
          reply: "⚠️ **Study Coach AI service is currently offline or unreachable.**\n\nI couldn't contact the AI coach service. Please ensure the Spring Boot server is running on port 8080. You can still use task/streak/timer commands offline!",
          action: { type: 'NONE' },
          intent
        };
      }
    }

    // 3. Otherwise, execute locally using the command executor
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
