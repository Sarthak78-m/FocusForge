package com.aistudycoach.analytics;

import com.aistudycoach.analytics.dto.AnalyticsSummaryResponse;
import com.aistudycoach.analytics.dto.AnalyticsSummaryResponse.DailyFocusMetric;
import com.aistudycoach.exception.ResourceNotFoundException;
import com.aistudycoach.repository.TaskRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.study.PomodoroSession;
import com.aistudycoach.study.PomodoroSessionRepository;
import com.aistudycoach.task.TaskStatus;
import com.aistudycoach.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PomodoroSessionRepository pomodoroSessionRepository;

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int totalTasks = (int) taskRepository.countByUserId(user.getId());
        int completedTasks = (int) taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.COMPLETED);
        int totalWorkMinutes = pomodoroSessionRepository.sumTotalWorkMinutes(user);
        long completedSessions = pomodoroSessionRepository.countByUserAndSessionType(user, PomodoroSession.SessionType.WORK);

        // Compute real weekly distribution for the last 7 days
        LocalDate today = LocalDate.now();
        List<DailyFocusMetric> weeklyDistribution = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime dayStart = day.atTime(LocalTime.MIN);
            LocalDateTime dayEnd = day.atTime(LocalTime.MAX);

            List<PomodoroSession> daySessions = pomodoroSessionRepository.findWorkSessionsInRange(user, dayStart, dayEnd);
            double hours = daySessions.stream().mapToInt(PomodoroSession::getDurationMinutes).sum() / 60.0;
            // Round to 1 decimal
            hours = Math.round(hours * 10.0) / 10.0;

            String dayLabel = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            weeklyDistribution.add(DailyFocusMetric.builder().day(dayLabel).hours(hours).build());
        }

        Map<String, Integer> categoryBreakdown = Map.of(
                "Exam Prep", 45,
                "Skill Mastery", 30,
                "Daily Habits", 25
        );

        int productivityScore = totalTasks > 0 ? Math.min(100, (completedTasks * 100) / totalTasks) : 100;
        int activeStreakDays = completedSessions > 0 ? Math.min(30, (int) completedSessions) : (completedTasks > 0 ? 1 : 0);

        return AnalyticsSummaryResponse.builder()
                .totalFocusHours(Math.round((totalWorkMinutes / 60.0) * 10.0) / 10.0)
                .completedSessions((int) completedSessions)
                .completedTasks(completedTasks)
                .activeStreakDays(activeStreakDays)
                .productivityScore(productivityScore)
                .weeklyDistribution(weeklyDistribution)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }
}
