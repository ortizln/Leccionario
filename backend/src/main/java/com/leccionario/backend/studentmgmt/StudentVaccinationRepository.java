package com.leccionario.backend.studentmgmt;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentVaccinationRepository extends JpaRepository<StudentVaccination, Long> {
    List<StudentVaccination> findByStudentIdOrderByDoseDateDesc(Long studentId);
}
