package com.aistudycoach.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatContextDto {
    private String fetchedAt;
    private List<TaskItem> pendingTasks;
    private List<TaskItem> overdueTasks;
    private List<GoalItem> activeGoals;
    private PomodoroStats pomodoroStats;
    private AnalyticsData analytics;
    private List<DeadlineItem> upcomingDeadlines;
    private List<QuizHistoryItem> quizHistory;
    private List<NoteItem> recentNotes;
    private List<DocumentItem> recentDocuments;
    private List<ActivityItem> recentActivity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskItem {
        private Long id;
        private String title;
        private String priority;
        private String status;
        private String dueDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalItem {
        private Long id;
        private String title;
        private Integer progressPercent;
        private String targetDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PomodoroStats {
        private Integer todaySessions;
        private Integer todayWorkMinutes;
        private Integer currentStreak;
        private Integer weeklyWorkMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyticsData {
        private Integer weeklyCompletedTasks;
        private Double taskCompletionRate;
        private List<String> weakSubjects;
        private List<String> strongSubjects;
        private String mostStudiedSubject;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeadlineItem {
        private Long id;
        private String title;
        private String dueDate;
        private boolean urgent;
        private String type;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizHistoryItem {
        private String subject;
        private Double averageScore;
        private String trend;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NoteItem {
        private Long id;
        private String title;
        private String subject;
        private String updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentItem {
        private Long id;
        private String originalName;
        private String subject;
        private String uploadedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItem {
        private String type;
        private String summary;
        private String occurredAt;
    }
}
