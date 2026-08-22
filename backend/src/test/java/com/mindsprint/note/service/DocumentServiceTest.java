package com.mindsprint.note.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.note.Document;
import com.mindsprint.note.DocumentStatus;
import com.mindsprint.note.dto.DocumentResponse;
import com.mindsprint.note.dto.DocumentUploadResponse;
import com.mindsprint.note.repository.DocumentRepository;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DocumentService documentService;

    private User testUser;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Sarthak")
                .email("sarthak@example.com")
                .role(Role.USER)
                .build();

        authentication = new UsernamePasswordAuthenticationToken(
                "sarthak@example.com",
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    @Test
    void uploadDocument_success() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "lecture_notes.pdf",
                "application/pdf",
                "Dummy PDF content here".getBytes()
        );

        when(documentRepository.save(any(Document.class))).thenAnswer(invocation -> {
            Document doc = invocation.getArgument(0);
            doc.setId(50L);
            doc.setUploadedAt(LocalDateTime.now());
            return doc;
        });

        DocumentUploadResponse response = documentService.uploadDocument(file, "CS101", authentication);

        assertThat(response).isNotNull();
        assertThat(response.getDocument()).isNotNull();
        assertThat(response.getDocument().getId()).isEqualTo(50L);
        assertThat(response.getDocument().getOriginalName()).isEqualTo("lecture_notes.pdf");
        assertThat(response.getDocument().getSubject()).isEqualTo("CS101");
        assertThat(response.getDocument().getStatus()).isEqualTo(DocumentStatus.READY);
        assertThat(response.getUploadUrl()).isNotBlank();
    }

    @Test
    void uploadDocument_emptyFile_throwsException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> documentService.uploadDocument(emptyFile, "CS101", authentication))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void getAllDocuments_returnsList() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        Document doc = Document.builder()
                .id(10L)
                .user(testUser)
                .filename("unique_123.pdf")
                .originalName("doc.pdf")
                .status(DocumentStatus.READY)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(documentRepository.findByUserIdOrderByUploadedAtDesc(1L)).thenReturn(List.of(doc));

        List<DocumentResponse> list = documentService.getAllDocuments(authentication);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getOriginalName()).isEqualTo("doc.pdf");
    }

    @Test
    void getDocumentById_notFound_throwsException() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));
        when(documentRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> documentService.getDocumentById(999L, authentication))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteDocument_success() {
        when(userRepository.findByEmail("sarthak@example.com")).thenReturn(Optional.of(testUser));

        Document doc = Document.builder()
                .id(10L)
                .user(testUser)
                .build();

        when(documentRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(doc));

        documentService.deleteDocument(10L, authentication);

        verify(documentRepository).delete(doc);
    }
}
