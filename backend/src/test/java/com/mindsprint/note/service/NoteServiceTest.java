package com.mindsprint.note.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.note.Note;
import com.mindsprint.note.dto.CreateNoteRequest;
import com.mindsprint.note.dto.NoteResponse;
import com.mindsprint.note.dto.UpdateNoteRequest;
import com.mindsprint.note.repository.NoteRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.Role;
import com.mindsprint.user.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@ExtendWith(MockitoExtension.class)
class NoteServiceTest {

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NoteService noteService;

    private User testUser;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Sarthak")
                .email("sarthak@example.com")
                .password("encoded_pwd")
                .role(Role.USER)
                .emailVerified(true)
                .build();

        authentication = new UsernamePasswordAuthenticationToken(
                "sarthak@example.com",
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void createNote_success() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        CreateNoteRequest request = CreateNoteRequest.builder()
                .title("Spring Boot Notes")
                .content("Detailed architecture notes")
                .subject("Computer Science")
                .tags(List.of("java", "spring"))
                .folder("Backend")
                .favorite(true)
                .linkedTaskId(10L)
                .linkedGoalId(20L)
                .build();

        Note savedNote = Note.builder()
                .id(100L)
                .user(testUser)
                .title(request.getTitle())
                .content(request.getContent())
                .subject(request.getSubject())
                .tags(request.getTags())
                .folder(request.getFolder())
                .favorite(true)
                .wordCount(3)
                .linkedTaskId(10L)
                .linkedGoalId(20L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(noteRepository.save(any(Note.class))).thenReturn(savedNote);

        NoteResponse response = noteService.createNote(request, authentication);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTitle()).isEqualTo("Spring Boot Notes");
        assertThat(response.getSubject()).isEqualTo("Computer Science");
        assertThat(response.getWordCount()).isEqualTo(3);
        assertThat(response.isFavorite()).isTrue();
    }

    @Test
    void getAllNotes_returnsUserNotes() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        Note note = Note.builder()
                .id(1L)
                .user(testUser)
                .title("Test Note")
                .content("Some content")
                .tags(List.of("tag1"))
                .wordCount(2)
                .build();

        when(noteRepository.findByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(note));

        List<NoteResponse> notes = noteService.getAllNotes(authentication);

        assertThat(notes).hasSize(1);
        assertThat(notes.get(0).getTitle()).isEqualTo("Test Note");
    }

    @Test
    void getNoteById_notFound_throwsException() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));
        when(noteRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> noteService.getNoteById(99L, authentication))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateNote_success() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        Note note = Note.builder()
                .id(1L)
                .user(testUser)
                .title("Old Title")
                .content("Old Content")
                .build();

        when(noteRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(note));
        when(noteRepository.save(any(Note.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateNoteRequest request = UpdateNoteRequest.builder()
                .title("New Title")
                .content("New Content Here")
                .build();

        NoteResponse updated = noteService.updateNote(1L, request, authentication);

        assertThat(updated.getTitle()).isEqualTo("New Title");
        assertThat(updated.getContent()).isEqualTo("New Content Here");
        assertThat(updated.getWordCount()).isEqualTo(3);
    }

    @Test
    void toggleFavorite_success() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        Note note = Note.builder()
                .id(1L)
                .user(testUser)
                .favorite(false)
                .build();

        when(noteRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(note));
        when(noteRepository.save(any(Note.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NoteResponse response = noteService.toggleFavorite(1L, authentication);

        assertThat(response.isFavorite()).isTrue();
    }

    @Test
    void deleteNote_success() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        Note note = Note.builder()
                .id(1L)
                .user(testUser)
                .build();

        when(noteRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(note));

        noteService.deleteNote(1L, authentication);

        verify(noteRepository).delete(note);
    }
}
