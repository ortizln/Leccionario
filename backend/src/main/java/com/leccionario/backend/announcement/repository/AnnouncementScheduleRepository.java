package com.leccionario.backend.announcement.repository;

import com.leccionario.backend.announcement.domain.AnnouncementSchedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementScheduleRepository extends JpaRepository<AnnouncementSchedule, Long> {

    List<AnnouncementSchedule> findByAnnouncementIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(Long announcementId);

    @Modifying
    @Query("DELETE FROM AnnouncementSchedule a WHERE a.announcement.id = :announcementId")
    void deleteByAnnouncementId(@Param("announcementId") Long announcementId);
}
