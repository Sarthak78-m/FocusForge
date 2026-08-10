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
 * StudyAnalyticsController
 *
 * Stub controller for the Study Analytics module.
 * Returns empty analytics until the Analytics domain is implemented.
 *
 * Frontend expects:
 *   GET /api/study-analytics/summary?range=30d  → analytics summary
 */
@Tag(name = "Study Analytics", description = "Study analytics APIs")
@RestController
@RequestMapping("/api/study-analytics")
@SecurityRequirement(name = "bearerAuth")
public class StudyAnalyticsController {

    @Operation(summary = "Get study analytics summary")
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

