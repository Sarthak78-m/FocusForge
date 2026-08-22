package com.mindsprint.reward;

import com.mindsprint.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    boolean existsByUserAndEventTypeAndReferenceId(User user, RewardEventType eventType, String referenceId);
    boolean existsByUserAndEventTypeAndReferenceIdStartingWith(User user, RewardEventType eventType, String prefix);
    List<RewardTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT COALESCE(SUM(rt.xpAmount), 0) FROM RewardTransaction rt WHERE rt.user.id = :userId")
    Integer sumXpAmountByUserId(@Param("userId") Long userId);
}
