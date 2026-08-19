package com.mindsprint.study;

import com.mindsprint.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * ActivityController
 *
 * Stub controller for the Activity feed module.
 * Frontend expects:
 *   GET /api/activity/recent?limit=10  → recent activity events
 */
@Tag(name = "Activity", description = "User activity feed APIs")
@RestController
@RequestMapping("/api/activity")
@SecurityRequirement(name = "bearerAuth")
public class ActivityController {

    @Operation(summary = "Get recent activity")
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Object>>> getRecent(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success("Activity fetched", List.of()));
    }
}
