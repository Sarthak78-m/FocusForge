package com.aistudycoach.goal;

import com.aistudycoach.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * GoalController
 *
 * Stub controller for the Goals module.
 * Returns empty lists until the full Goal domain (entity, service, repository)
 * is implemented in a future sprint.
 *
 * Frontend expects:
 *   GET /api/goals/active  → list of active goals
 *   GET /api/goals         → paginated goal list
 */
@Tag(name = "Goals", description = "Goal tracking APIs")
@RestController
@RequestMapping("/api/goals")
@SecurityRequirement(name = "bearerAuth")
public class GoalController {

    @Operation(summary = "Get all goals (paginated)")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getGoals() {
        Map<String, Object> empty = Map.of("content", List.of(), "totalElements", 0, "totalPages", 0);
        return ResponseEntity.ok(ApiResponse.success("Goals fetched", empty));
    }

    @Operation(summary = "Get active goals")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Object>>> getActiveGoals() {
        return ResponseEntity.ok(ApiResponse.success("Active goals fetched", List.of()));
    }
}
