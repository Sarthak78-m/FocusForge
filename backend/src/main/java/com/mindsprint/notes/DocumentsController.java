package com.mindsprint.notes;

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
 * DocumentsController
 *
 * Stub controller for PDF document uploads.
 * Frontend expects:
 *   GET /api/documents/recent?limit=5  → recently uploaded documents
 */
@Tag(name = "Documents", description = "Uploaded document (PDF) APIs")
@RestController
@RequestMapping("/api/documents")
@SecurityRequirement(name = "bearerAuth")
public class DocumentsController {

    @Operation(summary = "Get recently uploaded documents")
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<Object>>> getRecentDocuments(
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success("Documents fetched", List.of()));
    }
}
