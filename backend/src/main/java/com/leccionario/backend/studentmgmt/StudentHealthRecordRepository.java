package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentHealthRecordRepository extends JpaRepository<StudentHealthRecord, Long> {
    Optional<StudentHealthRecord> findByStudentId(Long studentId);
}
