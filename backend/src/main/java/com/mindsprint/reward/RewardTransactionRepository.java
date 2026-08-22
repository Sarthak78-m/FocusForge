package com.mindsprint.reward;

import com.mindsprint.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    boolean existsByUserAndEventTypeAndReferenceId(User user, RewardEventType eventType, String referenceId);
    boolean existsByUserAndEventTypeAndReferenceIdStartingWith(User user, RewardEventType eventType, String prefix);
    List<RewardTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
