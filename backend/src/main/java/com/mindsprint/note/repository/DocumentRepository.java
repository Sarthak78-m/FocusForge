package com.mindsprint.note.repository;

import com.mindsprint.note.Document;
import com.mindsprint.note.DocumentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserIdOrderByUploadedAtDesc(Long userId);

    Page<Document> findByUserIdOrderByUploadedAtDesc(Long userId, Pageable pageable);

    Optional<Document> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    List<Document> findByUserIdAndStatusOrderByUploadedAtDesc(Long userId, DocumentStatus status);

    List<Document> findByUserIdAndSubjectOrderByUploadedAtDesc(Long userId, String subject);

    List<Document> findTop5ByUserIdOrderByUploadedAtDesc(Long userId);
}
