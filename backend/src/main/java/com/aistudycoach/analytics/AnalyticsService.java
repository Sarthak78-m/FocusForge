package com.aistudycoach.analytics;

import com.aistudycoach.analytics.dto.AnalyticsSummaryResponse;
import com.aistudycoach.analytics.dto.AnalyticsSummaryResponse.DailyFocusMetric;
import com.aistudycoach.exception.ResourceNotFoundException;
import com.aistudycoach.repository.TaskRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.task.TaskStatus;
import com.aistudycoach.user.User;
import java.util.List;
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

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int totalTasks = (int) taskRepository.countByUserId(user.getId());
        int completedTasks = (int) taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.COMPLETED);

        List<DailyFocusMetric> weeklyDistribution = List.of(
                DailyFocusMetric.builder().day("Mon").hours(2.5).build(),
                DailyFocusMetric.builder().day("Tue").hours(3.0).build(),
                DailyFocusMetric.builder().day("Wed").hours(4.2).build(),
                DailyFocusMetric.builder().day("Thu").hours(1.8).build(),
                DailyFocusMetric.builder().day("Fri").hours(3.5).build(),
                DailyFocusMetric.builder().day("Sat").hours(5.0).build(),
                DailyFocusMetric.builder().day("Sun").hours(2.0).build()
        );

        Map<String, Integer> categoryBreakdown = Map.of(
                "Exam Prep", 45,
                "Skill Mastery", 30,
                "Daily Habits", 25
        );

        return AnalyticsSummaryResponse.builder()
                .totalFocusHours(22.0)
                .completedSessions(18)
                .completedTasks(completedTasks)
                .activeStreakDays(7)
                .productivityScore(totalTasks > 0 ? (completedTasks * 100) / totalTasks : 85)
                .weeklyDistribution(weeklyDistribution)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }
}
