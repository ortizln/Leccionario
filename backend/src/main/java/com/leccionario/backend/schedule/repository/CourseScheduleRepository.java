package com.leccionario.backend.schedule.repository;

import com.leccionario.backend.schedule.domain.CourseSchedule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseScheduleRepository extends JpaRepository<CourseSchedule, Long> {
    List<CourseSchedule> findByCourseIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(Long courseId);

    List<CourseSchedule> findByCourseIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(Long courseId, Long periodId);

    List<CourseSchedule> findByTeacherIdAndPeriodIdAndWeekdayOrderByCourse_NameAscCourse_ParallelAscScheduleBlock_BlockOrderAsc(
            Long teacherId,
            Long periodId,
            short weekday);

    boolean existsByCourseIdAndPeriodIdAndScheduleBlockIdAndWeekday(
            Long courseId,
            Long periodId,
            Long scheduleBlockId,
            short weekday);

    boolean existsByCourseIdAndPeriodIdAndScheduleBlockIdAndWeekdayAndIdNot(
            Long courseId,
            Long periodId,
            Long scheduleBlockId,
            short weekday,
            Long id);

    boolean existsByTeacherIdAndPeriodIdAndScheduleBlockIdAndWeekday(
            Long teacherId,
            Long periodId,
            Long scheduleBlockId,
            short weekday);

    boolean existsByTeacherIdAndPeriodIdAndScheduleBlockIdAndWeekdayAndIdNot(
            Long teacherId,
            Long periodId,
            Long scheduleBlockId,
            short weekday,
            Long id);

    List<CourseSchedule> findByTeacherIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(Long teacherId);

    List<CourseSchedule> findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(Long teacherId, Long periodId);

    boolean existsByCourseIdAndPeriodIdAndTeacherIdAndSubjectIdAndWeekday(
            Long courseId,
            Long periodId,
            Long teacherId,
            Long subjectId,
            short weekday);
}
