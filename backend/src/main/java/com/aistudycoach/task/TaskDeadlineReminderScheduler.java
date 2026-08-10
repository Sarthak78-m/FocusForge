package com.aistudycoach.task;

import com.aistudycoach.auth.service.EmailService;
import com.aistudycoach.repository.TaskRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskDeadlineReminderScheduler {

    private final TaskRepository taskRepository;
    private final EmailService emailService;

    // Run every 5 minutes (300,000 ms)
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void processUpcomingTaskDeadlines() {
        LocalDate today = LocalDate.now();
        List<Task> upcomingTasks = taskRepository
                .findByDueDateLessThanEqualAndReminderSentFalseAndStatusNot(today, TaskStatus.COMPLETED);

        if (upcomingTasks.isEmpty()) {
            return;
        }

        log.info("Processing {} upcoming task deadline reminders", upcomingTasks.size());
        for (Task task : upcomingTasks) {
            try {
                if (task.getUser() != null) {
                    emailService.sendTaskDeadlineReminderEmail(
                            task.getUser(),
                            task.getTitle(),
                            task.getDueDate() != null ? task.getDueDate().toString() : "Today"
                    );
                    task.setReminderSent(true);
                    log.info("Sent 1-hour deadline reminder for task '{}' (ID: {}) to {}",
                            task.getTitle(), task.getId(), task.getUser().getEmail());
                }
            } catch (Exception ex) {
                log.error("Failed to send deadline reminder for task ID {}: {}", task.getId(), ex.getMessage());
            }
        }
    }
}
