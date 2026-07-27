package com.leccionario.backend.tutoring.repository;

import com.leccionario.backend.tutoring.domain.TutoringFollowUp;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TutoringFollowUpRepository extends JpaRepository<TutoringFollowUp, Long> {

    List<TutoringFollowUp> findBySessionId(Long sessionId);

    void deleteBySessionId(Long sessionId);
}
