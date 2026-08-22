package com.mindsprint.note.repository;

import com.mindsprint.note.Note;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Page<Note> findByUserIdOrderByUpdatedAtDesc(Long userId, Pageable pageable);

    Optional<Note> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    List<Note> findByUserIdAndSubjectOrderByUpdatedAtDesc(Long userId, String subject);

    List<Note> findByUserIdAndFavoriteTrueOrderByUpdatedAtDesc(Long userId);

    List<Note> findTop5ByUserIdOrderByUpdatedAtDesc(Long userId);
}
