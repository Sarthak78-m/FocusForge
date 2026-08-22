package com.mindsprint.note.service;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.note.Note;
import com.mindsprint.note.dto.CreateNoteRequest;
import com.mindsprint.note.dto.NoteResponse;
import com.mindsprint.note.dto.UpdateNoteRequest;
import com.mindsprint.note.repository.NoteRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.User;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Transactional
    public NoteResponse createNote(CreateNoteRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);

        String content = request.getContent() != null ? request.getContent() : "";
        List<String> tags = request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>();

        Note note = Note.builder()
                .user(user)
                .title(request.getTitle().trim())
                .content(content)
                .subject(normalizeNullableText(request.getSubject()))
                .tags(tags)
                .folder(normalizeNullableText(request.getFolder()))
                .favorite(Boolean.TRUE.equals(request.getFavorite()))
                .wordCount(countWords(content))
                .linkedTaskId(request.getLinkedTaskId())
                .linkedGoalId(request.getLinkedGoalId())
                .build();

        return toResponse(noteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getAllNotes(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NoteResponse> getNotes(Authentication authentication, Pageable pageable) {
        User user = getCurrentUser(authentication);
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Note note = getOwnedNote(id, user);
        return toResponse(note);
    }

    @Transactional
    public NoteResponse updateNote(Long id, UpdateNoteRequest request, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Note note = getOwnedNote(id, user);

        if (request.getTitle() != null) {
            if (!StringUtils.hasText(request.getTitle())) {
                throw new IllegalArgumentException("Title cannot be blank");
            }
            note.setTitle(request.getTitle().trim());
        }

        if (request.getContent() != null) {
            note.setContent(request.getContent());
            note.setWordCount(countWords(request.getContent()));
        }

        if (request.getSubject() != null) {
            note.setSubject(normalizeNullableText(request.getSubject()));
        }

        if (request.getTags() != null) {
            note.setTags(new ArrayList<>(request.getTags()));
        }

        if (request.getFolder() != null) {
            note.setFolder(normalizeNullableText(request.getFolder()));
        }

        if (request.getFavorite() != null) {
            note.setFavorite(request.getFavorite());
        }

        if (request.getLinkedTaskId() != null) {
            note.setLinkedTaskId(request.getLinkedTaskId());
        }

        if (request.getLinkedGoalId() != null) {
            note.setLinkedGoalId(request.getLinkedGoalId());
        }

        return toResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Note note = getOwnedNote(id, user);
        noteRepository.delete(note);
    }

    @Transactional
    public NoteResponse toggleFavorite(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Note note = getOwnedNote(id, user);
        note.setFavorite(!note.isFavorite());
        return toResponse(noteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getRecentNotes(int limit, Authentication authentication) {
        User user = getCurrentUser(authentication);
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Note getOwnedNote(Long id, User user) {
        return noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private int countWords(String content) {
        if (!StringUtils.hasText(content)) {
            return 0;
        }
        return content.trim().split("\\s+").length;
    }

    private String normalizeNullableText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private NoteResponse toResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .subject(note.getSubject())
                .tags(note.getTags() != null ? new ArrayList<>(note.getTags()) : new ArrayList<>())
                .folder(note.getFolder())
                .favorite(note.isFavorite())
                .wordCount(note.getWordCount())
                .linkedTaskId(note.getLinkedTaskId())
                .linkedGoalId(note.getLinkedGoalId())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
