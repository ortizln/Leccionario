package com.leccionario.backend.demerit.repository;

import com.leccionario.backend.demerit.domain.StudentDemerDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentDemerDetailRepository extends JpaRepository<StudentDemerDetail, Long> {
    List<StudentDemerDetail> findByStudentDemerId(Long studentDemerId);
    void deleteByStudentDemerId(Long studentDemerId);
}
