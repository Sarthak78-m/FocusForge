package com.mindsprint.note.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindsprint.note.dto.CreateNoteRequest;
import com.mindsprint.note.dto.NoteResponse;
import com.mindsprint.note.dto.UpdateNoteRequest;
import com.mindsprint.note.service.NoteService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class NoteControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NoteService noteService;

    @InjectMocks
    private NoteController noteController;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(noteController).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void createNote_returnsCreated() throws Exception {
        CreateNoteRequest request = CreateNoteRequest.builder()
                .title("DSA Study Note")
                .content("Binary Trees and Heaps")
                .subject("Algorithms")
                .tags(List.of("dsa", "cs"))
                .build();

        NoteResponse response = NoteResponse.builder()
                .id(1L)
                .title("DSA Study Note")
                .content("Binary Trees and Heaps")
                .subject("Algorithms")
                .tags(List.of("dsa", "cs"))
                .createdAt(LocalDateTime.now())
                .build();

        when(noteService.createNote(any(CreateNoteRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.title").value("DSA Study Note"));
    }

    @Test
    void getAllNotes_returnsList() throws Exception {
        NoteResponse response = NoteResponse.builder()
                .id(1L)
                .title("DSA Study Note")
                .build();

        when(noteService.getAllNotes(any())).thenReturn(List.of(response));

        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("DSA Study Note"));
    }

    @Test
    void getNoteById_returnsNote() throws Exception {
        NoteResponse response = NoteResponse.builder()
                .id(1L)
                .title("DSA Study Note")
                .build();

        when(noteService.getNoteById(eq(1L), any())).thenReturn(response);

        mockMvc.perform(get("/api/notes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1L));
    }

    @Test
    void updateNote_returnsUpdated() throws Exception {
        UpdateNoteRequest request = UpdateNoteRequest.builder()
                .title("Updated DSA")
                .build();

        NoteResponse response = NoteResponse.builder()
                .id(1L)
                .title("Updated DSA")
                .build();

        when(noteService.updateNote(eq(1L), any(UpdateNoteRequest.class), any())).thenReturn(response);

        mockMvc.perform(put("/api/notes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Updated DSA"));
    }

    @Test
    void deleteNote_returnsSuccess() throws Exception {
        doNothing().when(noteService).deleteNote(eq(1L), any());

        mockMvc.perform(delete("/api/notes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void toggleFavorite_returnsUpdated() throws Exception {
        NoteResponse response = NoteResponse.builder()
                .id(1L)
                .title("DSA Note")
                .favorite(true)
                .build();

        when(noteService.toggleFavorite(eq(1L), any())).thenReturn(response);

        mockMvc.perform(patch("/api/notes/1/favorite"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.favorite").value(true));
    }
}
