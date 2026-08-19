package com.aistudycoach.repository;

import com.aistudycoach.notes.Note;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoteRepository extends JpaRepository<Note, String> {

    List<Note> findByUserIdOrderByUpdatedAtDesc(Long userId);

    Optional<Note> findByIdAndUserId(String id, Long userId);

    void deleteByIdAndUserId(String id, Long userId);

    long countByUserId(Long userId);
}
