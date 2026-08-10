package com.aistudycoach.repository;

import com.aistudycoach.goal.Goal;
import com.aistudycoach.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    Page<Goal> findByUser(User user, Pageable pageable);
    List<Goal> findByUserAndCompletedFalse(User user);
    Optional<Goal> findByIdAndUser(Long id, User user);
}
