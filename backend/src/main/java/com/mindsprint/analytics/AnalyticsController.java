package com.mindsprint.analytics;

import com.mindsprint.analytics.dto.AnalyticsSummaryResponse;
import com.mindsprint.analytics.dto.ChartDataResponse;
import com.mindsprint.analytics.dto.StreakResponse;
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
import java.util.List;

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

    @Operation(summary = "Get daily analytics")
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getDaily(Authentication authentication) {
        List<ChartDataResponse> data = analyticsService.getDaily(authentication);
        return ResponseEntity.ok(ApiResponse.success("Daily analytics fetched successfully", data));
    }

    @Operation(summary = "Get weekly analytics")
    @GetMapping("/weekly")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getWeekly(Authentication authentication) {
        List<ChartDataResponse> data = analyticsService.getWeekly(authentication);
        return ResponseEntity.ok(ApiResponse.success("Weekly analytics fetched successfully", data));
    }

    @Operation(summary = "Get monthly analytics")
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getMonthly(Authentication authentication) {
        List<ChartDataResponse> data = analyticsService.getMonthly(authentication);
        return ResponseEntity.ok(ApiResponse.success("Monthly analytics fetched successfully", data));
    }

    @Operation(summary = "Get productivity hours analytics")
    @GetMapping("/productivity-hours")
    public ResponseEntity<ApiResponse<List<ChartDataResponse>>> getProductivityHours(Authentication authentication) {
        List<ChartDataResponse> data = analyticsService.getProductivityHours(authentication);
        return ResponseEntity.ok(ApiResponse.success("Productivity hours fetched successfully", data));
    }

    @Operation(summary = "Get streak analytics")
    @GetMapping("/streak")
    public ResponseEntity<ApiResponse<StreakResponse>> getStreak(Authentication authentication) {
        StreakResponse data = analyticsService.getStreak(authentication);
        return ResponseEntity.ok(ApiResponse.success("Streak fetched successfully", data));
    }
}
