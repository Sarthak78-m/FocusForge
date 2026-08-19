package com.mindsprint.study;

import com.mindsprint.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * DeadlineController
 *
 * Stub controller for the Deadlines module.
 * Frontend expects:
 *   GET /api/deadlines/upcoming  → upcoming deadlines list
 */
@Tag(name = "Deadlines", description = "Deadline tracking APIs")
@RestController
@RequestMapping("/api/deadlines")
@SecurityRequirement(name = "bearerAuth")
public class DeadlineController {

    @Operation(summary = "Get upcoming deadlines")
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Object>>> getUpcoming() {
        return ResponseEntity.ok(ApiResponse.success("Deadlines fetched", List.of()));
    }
}
