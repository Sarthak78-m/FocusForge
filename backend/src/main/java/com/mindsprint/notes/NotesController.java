package com.mindsprint.notes;

import com.mindsprint.auth.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "Notes", description = "Study notes and knowledge vault APIs")
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class NotesController {

    private final NoteService noteService;

    @Operation(summary = "Get all notes for current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteDto>>> getAllNotes(Authentication authentication) {
        List<NoteDto> notes = noteService.getAllNotes(authentication);
        return ResponseEntity.ok(ApiResponse.success("Notes retrieved successfully", notes));
    }

    @Operation(summary = "Get a single note by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteDto>> getNoteById(
            @PathVariable String id,
            Authentication authentication
    ) {
        NoteDto note = noteService.getNoteById(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Note retrieved", note));
    }

    @Operation(summary = "Create or save a note")
    @PostMapping
    public ResponseEntity<ApiResponse<NoteDto>> createNote(
            @RequestBody NoteDto noteDto,
            Authentication authentication
    ) {
        NoteDto saved = noteService.saveNote(noteDto, authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Note saved successfully", saved));
    }

    @Operation(summary = "Update an existing note")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteDto>> updateNote(
            @PathVariable String id,
            @RequestBody NoteDto noteDto,
            Authentication authentication
    ) {
        noteDto.setId(id);
        NoteDto updated = noteService.saveNote(noteDto, authentication);
        return ResponseEntity.ok(ApiResponse.success("Note updated successfully", updated));
    }

    @Operation(summary = "Delete a note")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable String id,
            Authentication authentication
    ) {
        noteService.deleteNote(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully", null));
    }

    @Operation(summary = "Toggle note favorite status")
    @PatchMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<NoteDto>> toggleFavorite(
            @PathVariable String id,
            Authentication authentication
    ) {
        NoteDto note = noteService.toggleFavorite(id, authentication);
        return ResponseEntity.ok(ApiResponse.success("Favorite updated", note));
    }

    @Operation(summary = "Get recent notes")
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<NoteDto>>> getRecentNotes(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication
    ) {
        List<NoteDto> notes = noteService.getAllNotes(authentication);
        List<NoteDto> recent = notes.stream().limit(limit).toList();
        return ResponseEntity.ok(ApiResponse.success("Recent notes fetched", recent));
    }
}

