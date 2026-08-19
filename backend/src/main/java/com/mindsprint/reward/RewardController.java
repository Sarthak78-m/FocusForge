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

@Tag(name = "Rewards", description = "Gamification and reward milestone APIs")
@RestController
@RequestMapping("/api/rewards")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class RewardController {

    private final RewardService rewardService;

    @Operation(summary = "Get user gamification rewards and badges")
    @GetMapping
    public ResponseEntity<ApiResponse<RewardSummaryResponse>> getRewards(Authentication authentication) {
        RewardSummaryResponse rewards = rewardService.getRewards(authentication);
        return ResponseEntity.ok(ApiResponse.success("Rewards fetched successfully", rewards));
    }
}
