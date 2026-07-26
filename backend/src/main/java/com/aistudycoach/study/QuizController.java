package com.aistudycoach.study;

import com.aistudycoach.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * QuizController
 *
 * Stub controller for the Quiz module.
 * Frontend expects:
 *   GET /api/quiz/summary  → quiz history / score summary
 */
@Tag(name = "Quiz", description = "Quiz and assessment APIs")
@RestController
@RequestMapping("/api/quiz")
@SecurityRequirement(name = "bearerAuth")
public class QuizController {

    @Operation(summary = "Get quiz summary")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<List<Object>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Quiz summary fetched", List.of()));
    }
}
