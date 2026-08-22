package com.mindsprint.note.controller;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.note.dto.DocumentResponse;
import com.mindsprint.note.dto.DocumentUploadResponse;
import com.mindsprint.note.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Documents", description = "Uploaded study document (PDF) APIs")
@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "Get all uploaded documents for current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getAllDocuments(Authentication authentication) {
        List<DocumentResponse> documents = documentService.getAllDocuments(authentication);
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
    }

    @Operation(summary = "Get a document by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        DocumentResponse document = documentService.getDocumentById(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", document));
    }

    @Operation(summary = "Get recently uploaded documents")
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getRecentDocuments(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication
    ) {
        List<DocumentResponse> documents = documentService.getRecentDocuments(limit, authentication);
        return ResponseEntity.ok(ApiResponse.success("Recent documents fetched successfully", documents));
    }

    @Operation(summary = "Upload a document (PDF)")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentUploadResponse>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subject", required = false) String subject,
            Authentication authentication
    ) {
        DocumentUploadResponse response = documentService.uploadDocument(file, subject, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", response));
    }

    @Operation(summary = "Delete a document")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long id,
            Authentication authentication
    ) {
        documentService.deleteDocument(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
    }
}
