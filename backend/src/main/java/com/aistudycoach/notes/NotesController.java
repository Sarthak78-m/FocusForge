package com.aistudycoach.notes;

import com.aistudycoach.auth.dto.ApiResponse;
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
 * NotesController
 *
 * Stub controller for the Notes and Documents modules.
 * Frontend expects:
 *   GET /api/notes/recent?limit=5      → recent notes
 *   GET /api/documents/recent?limit=5  → recently uploaded PDFs
 */
@Tag(name = "Notes", description = "Study notes and document APIs")
@RestController
@RequestMapping("/api/notes")
@SecurityRequirement(name = "bearerAuth")
public class NotesController {

    @Operation(summary = "Get recent notes")
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Object>>> getRecentNotes(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success("Notes fetched", List.of()));
    }
}
