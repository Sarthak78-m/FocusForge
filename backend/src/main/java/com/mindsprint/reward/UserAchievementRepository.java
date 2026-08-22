package com.mindsprint.reward;

import com.mindsprint.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    boolean existsByUserAndAchievementType(User user, AchievementType achievementType);
    List<UserAchievement> findByUserIdOrderByEarnedAtDesc(Long userId);
}
