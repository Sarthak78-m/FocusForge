package com.mindsprint.goal.controller;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.goal.dto.CreateGoalRequest;
import com.mindsprint.goal.dto.UpdateGoalRequest;
import com.mindsprint.goal.dto.GoalResponse;
import com.mindsprint.goal.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Goals", description = "Goal tracking APIs")
@RestController
@RequestMapping("/api/goals")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @Operation(summary = "Get all goals (paginated)")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<GoalResponse>>> getGoals(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<GoalResponse> page = goalService.getGoals(authentication, pageable);
        return ResponseEntity.ok(ApiResponse.success("Goals fetched successfully", page));
    }

    @Operation(summary = "Get active goals")
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getActiveGoals(Authentication authentication) {
        List<GoalResponse> activeGoals = goalService.getActiveGoals(authentication);
        return ResponseEntity.ok(ApiResponse.success("Active goals fetched successfully", activeGoals));
    }

    @Operation(summary = "Create a new goal")
    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            Authentication authentication,
            @Valid @RequestBody CreateGoalRequest request
    ) {
        GoalResponse created = goalService.createGoal(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", created));
    }

    @Operation(summary = "Update goal")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalRequest request
    ) {
        GoalResponse updated = goalService.updateGoal(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", updated));
    }

    @Operation(summary = "Delete goal")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            Authentication authentication,
            @PathVariable Long id
    ) {
        goalService.deleteGoal(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }
}
