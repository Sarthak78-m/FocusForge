package com.aistudycoach.study;

import com.aistudycoach.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * AnalyticsController
 *
 * Stub controller for the Analytics module.
 * Returns empty analytics until the Analytics domain is implemented.
 *
 * Frontend expects:
 *   GET /api/analytics/summary?range=30d  → analytics summary
 */
@Tag(name = "Analytics", description = "Study analytics APIs")
@RestController
@RequestMapping("/api/analytics")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    @Operation(summary = "Get analytics summary")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @RequestParam(defaultValue = "30d") String range
    ) {
        Map<String, Object> summary = Map.of(
                "weeklyCompletedTasks", 0,
                "taskCompletionRate", 0.0,
                "weakSubjects", List.of(),
                "strongSubjects", List.of(),
                "mostStudiedSubject", ""
        );
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched for range: " + range, summary));
    }
}
