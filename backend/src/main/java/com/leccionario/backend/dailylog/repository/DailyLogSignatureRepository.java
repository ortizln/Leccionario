package com.leccionario.backend.dailylog.repository;

import com.leccionario.backend.dailylog.domain.DailyLogSignature;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DailyLogSignatureRepository extends JpaRepository<DailyLogSignature, Long> {
    List<DailyLogSignature> findByDailyLogId(Long dailyLogId);
}
