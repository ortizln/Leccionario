package com.leccionario.backend.announcement.repository;

import com.leccionario.backend.announcement.domain.Announcement;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByCreatedAtDesc();

    List<Announcement> findByCourseIdIsNullOrderByCreatedAtDesc();

    List<Announcement> findByCourseIdOrderByCreatedAtDesc(Long courseId);

    @Query("SELECT a FROM Announcement a WHERE a.course IS NULL OR a.course.id IN " +
           "(SELECT cs.course.id FROM CourseSchedule cs WHERE cs.teacher.id = :teacherId) " +
           "ORDER BY a.createdAt DESC")
    List<Announcement> findForTeacher(@Param("teacherId") Long teacherId);

    @Query("SELECT a FROM Announcement a WHERE a.course IS NULL OR a.course.id = " +
           "(SELECT s.course.id FROM Student s WHERE s.id = :studentId) " +
           "ORDER BY a.createdAt DESC")
    List<Announcement> findForStudent(@Param("studentId") Long studentId);

    @Query("SELECT a FROM Announcement a WHERE a.eventDate BETWEEN :start AND :end " +
           "ORDER BY a.eventDate ASC, a.createdAt DESC")
    List<Announcement> findByEventDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Modifying
    @Query("DELETE FROM Announcement a WHERE a.id = :id")
    void deleteByIdDirect(@Param("id") Long id);
}
