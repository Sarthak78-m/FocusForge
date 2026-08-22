package com.mindsprint.goal.repository;

import com.mindsprint.goal.Goal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    Page<Goal> findByUserId(Long userId, Pageable pageable);
    List<Goal> findByUserId(Long userId);
    List<Goal> findByUserIdAndStatus(Long userId, com.mindsprint.goal.GoalStatus status);
    Optional<Goal> findByIdAndUserId(Long id, Long userId);
}
