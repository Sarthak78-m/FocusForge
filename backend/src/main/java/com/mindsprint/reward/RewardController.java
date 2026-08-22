package com.mindsprint.reward;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.reward.dto.RewardSummaryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Rewards", description = "Gamification and reward milestone APIs")
@RestController
@RequestMapping("/api/rewards")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @Operation(summary = "Get user gamification rewards summary")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<RewardSummaryResponse>> getSummary(Authentication authentication) {
        RewardSummaryResponse rewards = rewardService.getSummary(authentication);
        return ResponseEntity.ok(ApiResponse.success("Rewards summary fetched successfully", rewards));
    }

    @Operation(summary = "Get user reward transactions history")
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<RewardTransaction>>> getHistory(Authentication authentication) {
        List<RewardTransaction> history = rewardService.getHistory(authentication);
        return ResponseEntity.ok(ApiResponse.success("Rewards history fetched successfully", history));
    }

    @Operation(summary = "Get user unlocked achievements")
    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<UserAchievement>>> getAchievements(Authentication authentication) {
        List<UserAchievement> achievements = rewardService.getAchievements(authentication);
        return ResponseEntity.ok(ApiResponse.success("Achievements fetched successfully", achievements));
    }
}
