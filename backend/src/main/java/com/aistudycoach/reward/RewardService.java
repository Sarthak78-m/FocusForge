package com.aistudycoach.reward;

import com.aistudycoach.exception.ResourceNotFoundException;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.reward.dto.RewardSummaryResponse;
import com.aistudycoach.reward.dto.RewardSummaryResponse.BadgeDto;
import com.aistudycoach.user.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public RewardSummaryResponse getRewards(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<BadgeDto> badges = List.of(
                BadgeDto.builder().id("b1").name("First Sprint").description("Completed first 25m Pomodoro").icon("🔥").unlocked(true).unlockedAt("2026-08-01").build(),
                BadgeDto.builder().id("b2").name("Night Owl").description("Finished a study session past midnight").icon("🌙").unlocked(true).unlockedAt("2026-08-05").build(),
                BadgeDto.builder().id("b3").name("7-Day Streak Master").description("Maintained a 7-day study streak").icon("⚡").unlocked(true).unlockedAt("2026-08-09").build(),
                BadgeDto.builder().id("b4").name("Centurion Focus").description("Accumulated 100 total focus hours").icon("🏆").unlocked(false).unlockedAt(null).build(),
                BadgeDto.builder().id("b5").name("AI Tutor Prodigy").description("Asked 50 study questions to AI Coach").icon("🤖").unlocked(true).unlockedAt("2026-08-10").build()
        );

        return RewardSummaryResponse.builder()
                .currentXp(1250)
                .level(5)
                .title("Scholar Level 5")
                .nextLevelXp(2000)
                .streakDays(7)
                .badges(badges)
                .build();
    }
}
