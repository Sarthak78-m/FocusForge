package com.mindsprint.note.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mindsprint.note.DocumentStatus;
import com.mindsprint.note.dto.DocumentResponse;
import com.mindsprint.note.dto.DocumentUploadResponse;
import com.mindsprint.note.service.DocumentService;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DocumentService documentService;

    @InjectMocks
    private DocumentController documentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentController).build();
    }

    @Test
    void uploadDocument_returnsCreated() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "notes.pdf",
                "application/pdf",
                "sample content".getBytes()
        );

        DocumentResponse doc = DocumentResponse.builder()
                .id(10L)
                .filename("notes-123.pdf")
                .originalName("notes.pdf")
                .subject("Physics")
                .status(DocumentStatus.READY)
                .uploadedAt(LocalDateTime.now())
                .build();

        DocumentUploadResponse uploadResponse = DocumentUploadResponse.builder()
                .document(doc)
                .uploadUrl("https://storage.mindsprint.io/documents/notes-123.pdf")
                .build();

        when(documentService.uploadDocument(any(), eq("Physics"), any())).thenReturn(uploadResponse);

        mockMvc.perform(multipart("/api/documents/upload")
                        .file(file)
                        .param("subject", "Physics"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.document.id").value(10L))
                .andExpect(jsonPath("$.data.document.originalName").value("notes.pdf"))
                .andExpect(jsonPath("$.data.uploadUrl").value("https://storage.mindsprint.io/documents/notes-123.pdf"));
    }

    @Test
    void getAllDocuments_returnsList() throws Exception {
        DocumentResponse doc = DocumentResponse.builder()
                .id(10L)
                .originalName("notes.pdf")
                .status(DocumentStatus.READY)
                .build();

        when(documentService.getAllDocuments(any())).thenReturn(List.of(doc));

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(10L));
    }

    @Test
    void getDocumentById_returnsDocument() throws Exception {
        DocumentResponse doc = DocumentResponse.builder()
                .id(10L)
                .originalName("notes.pdf")
                .status(DocumentStatus.READY)
                .build();

        when(documentService.getDocumentById(eq(10L), any())).thenReturn(doc);

        mockMvc.perform(get("/api/documents/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10L));
    }

    @Test
    void deleteDocument_returnsSuccess() throws Exception {
        doNothing().when(documentService).deleteDocument(eq(10L), any());

        mockMvc.perform(delete("/api/documents/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
