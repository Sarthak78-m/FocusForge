package com.aistudycoach.chat.service;

import com.aistudycoach.chat.dto.ChatContextDto;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildPrompt(String userMessage, ChatContextDto context) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are the FocusForge AI Study Coach, an assistant designed to help the user learn smarter, organize their tasks, and study effectively.\n\n");
        sb.append("Here is the current study context and database state of the user:\n");

        if (context != null) {
            sb.append("--- USER CONTEXT ---\n");

            // Tasks
            if (context.getPendingTasks() != null && !context.getPendingTasks().isEmpty()) {
                sb.append("Pending Tasks:\n");
                for (var t : context.getPendingTasks()) {
                    sb.append("- ").append(t.getTitle())
                            .append(" (Priority: ").append(t.getPriority())
                            .append(", Status: ").append(t.getStatus())
                            .append(", Due: ").append(t.getDueDate() == null ? "None" : t.getDueDate())
                            .append(")\n");
                }
            } else {
                sb.append("No active pending tasks.\n");
            }

            if (context.getOverdueTasks() != null && !context.getOverdueTasks().isEmpty()) {
                sb.append("Overdue Tasks:\n");
                for (var t : context.getOverdueTasks()) {
                    sb.append("- ").append(t.getTitle())
                            .append(" (Due: ").append(t.getDueDate())
                            .append(")\n");
                }
            }

            // Goals
            if (context.getActiveGoals() != null && !context.getActiveGoals().isEmpty()) {
                sb.append("Active Goals:\n");
                for (var g : context.getActiveGoals()) {
                    sb.append("- ").append(g.getTitle())
                            .append(" (Progress: ").append(g.getProgressPercent())
                            .append("%, Target Date: ").append(g.getTargetDate())
                            .append(")\n");
                }
            }

            // Pomodoro Stats
            if (context.getPomodoroStats() != null) {
                var stats = context.getPomodoroStats();
                sb.append("Pomodoro History:\n");
                sb.append("- Sessions completed today: ").append(stats.getTodaySessions()).append("\n");
                sb.append("- Active work minutes today: ").append(stats.getTodayWorkMinutes()).append("m\n");
                sb.append("- Current day streak: ").append(stats.getCurrentStreak()).append(" days\n");
                sb.append("- Total work minutes this week: ").append(stats.getWeeklyWorkMinutes()).append("m\n");
            }

            // Analytics
            if (context.getAnalytics() != null) {
                var a = context.getAnalytics();
                sb.append("Study Analytics:\n");
                sb.append("- Task completion rate: ").append(a.getTaskCompletionRate() * 100).append("%\n");
                if (a.getWeakSubjects() != null && !a.getWeakSubjects().isEmpty()) {
                    sb.append("- Weak subjects (needs work): ").append(String.join(", ", a.getWeakSubjects())).append("\n");
                }
                if (a.getStrongSubjects() != null && !a.getStrongSubjects().isEmpty()) {
                    sb.append("- Strong subjects: ").append(String.join(", ", a.getStrongSubjects())).append("\n");
                }
                if (a.getMostStudiedSubject() != null) {
                    sb.append("- Most studied subject: ").append(a.getMostStudiedSubject()).append("\n");
                }
            }

            // Deadlines
            if (context.getUpcomingDeadlines() != null && !context.getUpcomingDeadlines().isEmpty()) {
                sb.append("Upcoming Deadlines:\n");
                for (var d : context.getUpcomingDeadlines()) {
                    sb.append("- ").append(d.getTitle())
                            .append(" (Due: ").append(d.getDueDate())
                            .append(", Type: ").append(d.getType())
                            .append(", Urgent: ").append(d.isUrgent())
                            .append(")\n");
                }
            }

            // Quiz History
            if (context.getQuizHistory() != null && !context.getQuizHistory().isEmpty()) {
                sb.append("Quiz History:\n");
                for (var q : context.getQuizHistory()) {
                    sb.append("- ").append(q.getSubject())
                            .append(" (Avg Score: ").append(q.getAverageScore())
                            .append("%, Trend: ").append(q.getTrend())
                            .append(")\n");
                }
            }

            // Recent Notes
            if (context.getRecentNotes() != null && !context.getRecentNotes().isEmpty()) {
                sb.append("Recent Notes:\n");
                for (var n : context.getRecentNotes()) {
                    sb.append("- ").append(n.getTitle())
                            .append(" (Subject: ").append(n.getSubject() == null ? "General" : n.getSubject())
                            .append(")\n");
                }
            }

            // Recent Documents
            if (context.getRecentDocuments() != null && !context.getRecentDocuments().isEmpty()) {
                sb.append("Uploaded PDFs/Documents:\n");
                for (var d : context.getRecentDocuments()) {
                    sb.append("- ").append(d.getOriginalName())
                            .append(" (Subject: ").append(d.getSubject() == null ? "Uncategorized" : d.getSubject())
                            .append(")\n");
                }
            }
            sb.append("---------------------\n\n");
        }

        sb.append("Strict Response Rules:\n");
        sb.append("1. Answer using ONLY the provided USER CONTEXT if the question relates to the user's tasks, goals, habits, history, schedule, stats, notes, or uploaded PDFs. Do NOT make up, invent, or hallucinate facts about their state. If the needed data is unavailable or not provided in the context, explicitly say so (e.g. 'I do not have record of notes on that subject').\n");
        sb.append("2. If the user asks general academic, conceptual, or programming questions (e.g., 'explain how dynamic programming works' or 'help me debug this JS code' or 'what is the mitochondria?'), you are allowed to use your external knowledge to answer fully and comprehensively, while keeping the tone helpful.\n");
        sb.append("3. Keep responses clean and concise. Use Markdown bullet points, bolding, and lists for clear structures.\n\n");

        sb.append("User Message: ").append(userMessage).append("\n\n");
        sb.append("Response:");

        return sb.toString();
    }
}
