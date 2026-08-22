package com.mindsprint.note.controller;

import com.mindsprint.auth.dto.ApiResponse;
import com.mindsprint.note.dto.CreateNoteRequest;
import com.mindsprint.note.dto.NoteResponse;
import com.mindsprint.note.dto.UpdateNoteRequest;
import com.mindsprint.note.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Notes", description = "Productivity notes and study vault APIs")
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class NoteController {

    private final NoteService noteService;

    @Operation(summary = "Get all notes for current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getAllNotes(Authentication authentication) {
        List<NoteResponse> notes = noteService.getAllNotes(authentication);
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved successfully", notes));
    }

    @Operation(summary = "Get a note by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        NoteResponse note = noteService.getNoteById(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Note retrieved successfully", note));
    }

    @Operation(summary = "Get recently updated notes")
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getRecentNotes(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication
    ) {
        List<NoteResponse> notes = noteService.getRecentNotes(limit, authentication);
        return ResponseEntity.ok(ApiResponse.success("Recent notes fetched successfully", notes));
    }

    @Operation(summary = "Create a new note")
    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> createNote(
            @Valid @RequestBody CreateNoteRequest request,
            Authentication authentication
    ) {
        NoteResponse created = noteService.createNote(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note created successfully", created));
    }

    @Operation(summary = "Update an existing note")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            @PathVariable Long id,
            @Valid @RequestBody UpdateNoteRequest request,
            Authentication authentication
    ) {
        NoteResponse updated = noteService.updateNote(id, request, authentication);
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", updated));
    }

    @Operation(summary = "Delete a note")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long id,
            Authentication authentication
    ) {
        noteService.deleteNote(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully", null));
    }

    @Operation(summary = "Toggle note favorite status")
    @PatchMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<NoteResponse>> toggleFavorite(
            @PathVariable Long id,
            Authentication authentication
    ) {
        NoteResponse note = noteService.toggleFavorite(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Favorite status updated successfully", note));
    }
}
