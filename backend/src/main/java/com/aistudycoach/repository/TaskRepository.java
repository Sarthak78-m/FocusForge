package com.aistudycoach.repository;

import com.aistudycoach.task.Task;
import com.aistudycoach.task.TaskPriority;
import com.aistudycoach.task.TaskStatus;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, TaskStatus status);

    @Query("""
            select t from Task t
            where t.user.id = :userId
              and (:status is null or t.status = :status)
              and (:priority is null or t.priority = :priority)
              and (:dueBefore is null or t.dueDate <= :dueBefore)
            """)
    Page<Task> findUserTasks(
            @Param("userId") Long userId,
            @Param("status") TaskStatus status,
            @Param("priority") TaskPriority priority,
            @Param("dueBefore") LocalDate dueBefore,
            Pageable pageable
    );
}
