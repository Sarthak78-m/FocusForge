package com.mindsprint.analytics;

import com.mindsprint.analytics.dto.AnalyticsSummaryResponse;
import com.mindsprint.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Analytics", description = "Focus and productivity analytics APIs")
@RestController
@RequestMapping("/api/analytics")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get user analytics summary")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getSummary(Authentication authentication) {
        AnalyticsSummaryResponse summary = analyticsService.getSummary(authentication);
        return ResponseEntity.ok(ApiResponse.success("Analytics summary fetched successfully", summary));
    }
}
