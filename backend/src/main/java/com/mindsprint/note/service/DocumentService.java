package com.mindsprint.note.service;

import com.mindsprint.exception.ResourceNotFoundException;
import com.mindsprint.note.Document;
import com.mindsprint.note.DocumentStatus;
import com.mindsprint.note.dto.DocumentResponse;
import com.mindsprint.note.dto.DocumentUploadResponse;
import com.mindsprint.note.repository.DocumentRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.User;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Transactional
    public DocumentUploadResponse uploadDocument(
            MultipartFile file,
            String subject,
            Authentication authentication
    ) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        User user = getCurrentUser(authentication);

        String originalName = file.getOriginalFilename();
        if (!StringUtils.hasText(originalName)) {
            originalName = "document.pdf";
        } else {
            originalName = Paths.get(originalName).getFileName().toString();
        }

        String storedFilename = UUID.randomUUID() + "-" + originalName.replaceAll("[^a-zA-Z0-9.-]", "_");
        long size = file.getSize();
        int estimatedPages = Math.max(1, (int) Math.ceil((double) size / 65536.0));

        Document document = Document.builder()
                .user(user)
                .filename(storedFilename)
                .originalName(originalName)
                .subject(normalizeNullableText(subject))
                .pageCount(estimatedPages)
                .fileSizeBytes(size)
                .status(DocumentStatus.READY)
                .summary("AI summary for " + originalName + ": Key concepts and structured study materials.")
                .build();

        Document saved = documentRepository.save(document);
        String mockUploadUrl = "https://storage.mindsprint.io/documents/" + saved.getFilename();

        return DocumentUploadResponse.builder()
                .document(toResponse(saved))
                .uploadUrl(mockUploadUrl)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return documentRepository.findByUserIdOrderByUploadedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getDocuments(Authentication authentication, Pageable pageable) {
        User user = getCurrentUser(authentication);
        return documentRepository.findByUserIdOrderByUploadedAtDesc(user.getId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Document document = getOwnedDocument(id, user);
        return toResponse(document);
    }

    @Transactional
    public void deleteDocument(Long id, Authentication authentication) {
        User user = getCurrentUser(authentication);
        Document document = getOwnedDocument(id, user);
        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getRecentDocuments(int limit, Authentication authentication) {
        User user = getCurrentUser(authentication);
        return documentRepository.findByUserIdOrderByUploadedAtDesc(user.getId())
                .stream()
                .limit(limit)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private Document getOwnedDocument(Long id, User user) {
        return documentRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Authentication is required");
        }
        return userRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String normalizeNullableText(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId())
                .filename(document.getFilename())
                .originalName(document.getOriginalName())
                .subject(document.getSubject())
                .pageCount(document.getPageCount())
                .fileSizeBytes(document.getFileSizeBytes())
                .status(document.getStatus())
                .summary(document.getSummary())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}
