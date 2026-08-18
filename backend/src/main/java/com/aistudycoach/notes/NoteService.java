package com.aistudycoach.notes;

import com.aistudycoach.exception.ResourceNotFoundException;
import com.aistudycoach.repository.NoteRepository;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.user.User;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
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

    @Transactional(readOnly = true)
    public List<NoteDto> getAllNotes(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return noteRepository.findByUserIdOrderByUpdatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteDto getNoteById(String id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Note note = noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + id));
        return toDto(note);
    }

    @Transactional
    public NoteDto saveNote(NoteDto dto, Authentication authentication) {
        User user = getCurrentUser(authentication);
        long now = System.currentTimeMillis();

        String noteId = StringUtils.hasText(dto.getId()) ? dto.getId() : UUID.randomUUID().toString();
        Note note = noteRepository.findByIdAndUserId(noteId, user.getId())
                .orElse(Note.builder()
                        .id(noteId)
                        .user(user)
                        .createdAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : now)
                        .build());

        note.setTitle(StringUtils.hasText(dto.getTitle()) ? dto.getTitle().trim() : "Untitled");
        note.setContent(dto.getContent() != null ? dto.getContent() : "");
        note.setPreview(dto.getPreview() != null ? dto.getPreview() : extractPreview(note.getContent()));
        note.setFolder(StringUtils.hasText(dto.getFolder()) ? dto.getFolder() : "Inbox");
        note.setFavorite(dto.isFavorite());
        note.setWordCount(dto.getWordCount() > 0 ? dto.getWordCount() : countWords(note.getContent()));
        note.setTags(dto.getTags() != null ? String.join(",", dto.getTags()) : "");
        note.setUpdatedAt(now);

        return toDto(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(String id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        noteRepository.deleteByIdAndUserId(id, user.getId());
    }

    @Transactional
    public NoteDto toggleFavorite(String id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Note note = noteRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + id));
        note.setFavorite(!note.isFavorite());
        note.setUpdatedAt(System.currentTimeMillis());
        return toDto(noteRepository.save(note));
    }

    private NoteDto toDto(Note note) {
        List<String> tagList = StringUtils.hasText(note.getTags())
                ? Arrays.asList(note.getTags().split(","))
                : Collections.emptyList();

        return NoteDto.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .preview(note.getPreview())
                .folder(note.getFolder())
                .tags(tagList)
                .favorite(note.isFavorite())
                .wordCount(note.getWordCount())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }

    private String extractPreview(String content) {
        if (!StringUtils.hasText(content)) return "";
        String clean = content.replaceAll("\\s+", " ").trim();
        return clean.length() > 140 ? clean.substring(0, 140) : clean;
    }

    private int countWords(String content) {
        if (!StringUtils.hasText(content)) return 0;
        return content.trim().split("\\s+").length;
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
