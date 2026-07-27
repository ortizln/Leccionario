package com.leccionario.backend.evaluation.repository;

import com.leccionario.backend.evaluation.domain.ReportCardDetail;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportCardDetailRepository extends JpaRepository<ReportCardDetail, Long> {

    List<ReportCardDetail> findByReportCardId(Long reportCardId);

    void deleteByReportCardId(Long reportCardId);
}
