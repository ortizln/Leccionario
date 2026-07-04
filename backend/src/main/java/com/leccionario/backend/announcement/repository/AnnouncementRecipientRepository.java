package com.leccionario.backend.announcement.repository;

import com.leccionario.backend.announcement.domain.AnnouncementRecipient;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRecipientRepository extends JpaRepository<AnnouncementRecipient, Long> {

    List<AnnouncementRecipient> findByUserIdOrderByAnnouncement_CreatedAtDesc(Long userId);

    Optional<AnnouncementRecipient> findByAnnouncementIdAndUserId(Long announcementId, Long userId);

    long countByUserIdAndReadFalse(Long userId);

    @Modifying
    @Query("DELETE FROM AnnouncementRecipient ar WHERE ar.announcement.id = :announcementId")
    void deleteByAnnouncementId(@Param("announcementId") Long announcementId);

    @Modifying
    @Query("DELETE FROM AnnouncementRecipient ar WHERE ar.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
