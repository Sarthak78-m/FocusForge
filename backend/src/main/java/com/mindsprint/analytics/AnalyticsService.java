package com.mindsprint.analytics;

import com.mindsprint.analytics.dto.AnalyticsSummaryResponse;
import com.mindsprint.analytics.dto.AnalyticsSummaryResponse.DailyFocusMetric;
import com.mindsprint.analytics.dto.ChartDataResponse;
import com.mindsprint.analytics.dto.StreakResponse;
import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.pomodoro.PomodoroSession;
import com.mindsprint.pomodoro.PomodoroSessionType;
import com.mindsprint.pomodoro.SessionStatus;
import com.mindsprint.pomodoro.repository.PomodoroSessionRepository;
import com.mindsprint.repository.TaskRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.task.TaskStatus;
import com.mindsprint.user.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
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
        User user = getCurrentUser(authentication);
        ZoneId zoneId = ZoneId.of(user.getTimezone());

        int totalTasks = (int) taskRepository.countByUserId(user.getId());
        int completedTasks = (int) taskRepository.countByUserIdAndStatus(user.getId(), TaskStatus.COMPLETED);
        
        List<PomodoroSession> focusSessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatus(
                user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED);
                
        List<PomodoroSession> interruptedSessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatus(
                user.getId(), PomodoroSessionType.FOCUS, SessionStatus.INTERRUPTED);

        int completedFocusCount = focusSessions.size();
        int interruptedFocusCount = interruptedSessions.size();
        
        long totalWorkMinutes = focusSessions.stream()
                .mapToLong(s -> s.getActualDuration() != null ? s.getActualDuration() : 0)
                .sum();

        // Calculate Streak
        StreakResponse streak = calculateStreakInternal(user, zoneId);

        // Focus Score Calculation
        double sessionCompletionRateScore = 0;
        if (completedFocusCount + interruptedFocusCount > 0) {
            sessionCompletionRateScore = ((double) completedFocusCount / (completedFocusCount + interruptedFocusCount)) * 40.0;
        }

        double taskCompletionRateScore = 0;
        if (totalTasks > 0) {
            taskCompletionRateScore = ((double) completedTasks / totalTasks) * 30.0;
        }

        double streakScore = Math.min((streak.getCurrentStreak() / 10.0) * 20.0, 20.0);

        double durationVarianceScore = 10.0; // max score if no sessions
        long totalPlanned = focusSessions.stream().mapToLong(PomodoroSession::getPlannedDuration).sum();
        long totalActual = focusSessions.stream().mapToLong(s -> s.getActualDuration() != null ? s.getActualDuration() : 0).sum();
        if (totalPlanned > 0) {
            double variance = Math.abs((double) totalPlanned - totalActual) / totalPlanned;
            durationVarianceScore = Math.max(0.0, 10.0 - (variance * 10.0));
        }

        int focusScore = (int) Math.round(sessionCompletionRateScore + taskCompletionRateScore + streakScore + durationVarianceScore);
        focusScore = Math.max(0, Math.min(100, focusScore));

        // Weekly Distribution
        LocalDate today = LocalDate.now(zoneId);
        List<DailyFocusMetric> weeklyDistribution = new ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime dayStartUTC = day.atStartOfDay(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            LocalDateTime dayEndUTC = day.atTime(LocalTime.MAX).atZone(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();

            List<PomodoroSession> daySessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(
                    user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED, dayStartUTC, dayEndUTC);
            
            double hours = daySessions.stream().mapToLong(s -> s.getActualDuration() != null ? s.getActualDuration() : 0).sum() / 60.0;
            hours = Math.round(hours * 10.0) / 10.0;

            String dayLabel = day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            weeklyDistribution.add(DailyFocusMetric.builder().day(dayLabel).hours(hours).build());
        }

        Map<String, Integer> categoryBreakdown = Map.of(
                "Focus", completedFocusCount,
                "Interrupted", interruptedFocusCount
        );

        return AnalyticsSummaryResponse.builder()
                .totalFocusHours(Math.round((totalWorkMinutes / 60.0) * 10.0) / 10.0)
                .completedSessions(completedFocusCount)
                .completedTasks(completedTasks)
                .activeStreakDays(streak.getCurrentStreak())
                .productivityScore(focusScore) // Using focus score here
                .weeklyDistribution(weeklyDistribution)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public StreakResponse getStreak(Authentication authentication) {
        User user = getCurrentUser(authentication);
        ZoneId zoneId = ZoneId.of(user.getTimezone());
        return calculateStreakInternal(user, zoneId);
    }
    
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getDaily(Authentication authentication) {
        User user = getCurrentUser(authentication);
        ZoneId zoneId = ZoneId.of(user.getTimezone());
        LocalDate today = LocalDate.now(zoneId);
        
        List<ChartDataResponse> res = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime dayStartUTC = day.atStartOfDay(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            LocalDateTime dayEndUTC = day.atTime(LocalTime.MAX).atZone(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            List<PomodoroSession> daySessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(
                    user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED, dayStartUTC, dayEndUTC);
            double hours = daySessions.stream().mapToLong(s -> s.getActualDuration() != null ? s.getActualDuration() : 0).sum() / 60.0;
            res.add(new ChartDataResponse(day.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), Math.round(hours * 10.0) / 10.0));
        }
        return res;
    }
    
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getWeekly(Authentication authentication) {
        User user = getCurrentUser(authentication);
        ZoneId zoneId = ZoneId.of(user.getTimezone());
        LocalDate today = LocalDate.now(zoneId);
        
        List<ChartDataResponse> res = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            LocalDate weekStart = today.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
            LocalDate weekEnd = weekStart.plusDays(6);
            LocalDateTime startUTC = weekStart.atStartOfDay(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            LocalDateTime endUTC = weekEnd.atTime(LocalTime.MAX).atZone(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            List<PomodoroSession> sessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(
                    user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED, startUTC, endUTC);
            double hours = sessions.stream().mapToLong(s -> s.getActualDuration() != null ? s.getActualDuration() : 0).sum() / 60.0;
            res.add(new ChartDataResponse("Week of " + weekStart.getMonthValue() + "/" + weekStart.getDayOfMonth(), Math.round(hours * 10.0) / 10.0));
        }
        return res;
    }
    
    @Transactional(readOnly = true)
    public List<ChartDataResponse> getMonthly(Authentication authentication) {
        User user = getCurrentUser(authentication);
        ZoneId zoneId = ZoneId.of(user.getTimezone());
        LocalDate today = LocalDate.now(zoneId);
        
        List<ChartDataResponse> res = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = today.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());
            LocalDateTime startUTC = monthStart.atStartOfDay(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            LocalDateTime endUTC = monthEnd.atTime(LocalTime.MAX).atZone(zoneId).withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
            List<PomodoroSession> sessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatusAndStartedAtBetween(
                    user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED, startUTC, endUTC);
            double hours = sessions.stream().mapToLong(s -> s.getActualDuration() != null ? s.getActualDuration() : 0).sum() / 60.0;
            res.add(new ChartDataResponse(monthStart.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH), Math.round(hours * 10.0) / 10.0));
        }
        return res;
    }

    @Transactional(readOnly = true)
    public List<ChartDataResponse> getProductivityHours(Authentication authentication) {
        User user = getCurrentUser(authentication);
        ZoneId zoneId = ZoneId.of(user.getTimezone());
        
        List<PomodoroSession> sessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatus(
                user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED);
                
        double[] hoursOfDay = new double[24];
        for (PomodoroSession s : sessions) {
            if (s.getStartedAt() != null) {
                int hour = s.getStartedAt().atZone(ZoneOffset.UTC).withZoneSameInstant(zoneId).getHour();
                hoursOfDay[hour] += (s.getActualDuration() != null ? s.getActualDuration() : 0) / 60.0;
            }
        }
        
        List<ChartDataResponse> res = new ArrayList<>();
        for (int i = 0; i < 24; i++) {
            res.add(new ChartDataResponse(String.format("%02d:00", i), Math.round(hoursOfDay[i] * 10.0) / 10.0));
        }
        return res;
    }

    private StreakResponse calculateStreakInternal(User user, ZoneId zoneId) {
        List<PomodoroSession> sessions = pomodoroSessionRepository.findByUserIdAndSessionTypeAndStatus(
                user.getId(), PomodoroSessionType.FOCUS, SessionStatus.COMPLETED);

        Set<LocalDate> activeDays = sessions.stream()
                .filter(s -> s.getStartedAt() != null)
                .map(s -> s.getStartedAt().atZone(ZoneOffset.UTC).withZoneSameInstant(zoneId).toLocalDate())
                .collect(Collectors.toSet());

        List<LocalDate> sortedDays = activeDays.stream().sorted().toList();
        int currentStreak = 0;
        int longestStreak = 0;
        int tempStreak = 0;
        LocalDate lastDay = null;
        LocalDate today = LocalDate.now(zoneId);

        for (LocalDate day : sortedDays) {
            if (lastDay == null) {
                tempStreak = 1;
            } else if (lastDay.plusDays(1).equals(day)) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            longestStreak = Math.max(longestStreak, tempStreak);
            lastDay = day;
        }

        if (lastDay != null && (lastDay.equals(today) || lastDay.equals(today.minusDays(1)))) {
            currentStreak = tempStreak;
        } else {
            currentStreak = 0;
        }

        return StreakResponse.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .build();
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("Authentication is required");
        }
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
