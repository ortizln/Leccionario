package com.leccionario.backend.self.service;

import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.schedule.dto.CourseScheduleResponse;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SelfService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseScheduleRepository courseScheduleRepository;

    public Student findStudentByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        return studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("El usuario no tiene perfil de estudiante"));
    }

    public Teacher findTeacherByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("El usuario no tiene perfil de docente"));
    }

    @Transactional(readOnly = true)
    public AcademicCourseResponse getMyCourse(String username) {
        Student student = findStudentByUsername(username);
        Course course = student.getCourse();
        return new AcademicCourseResponse(
                course.getId(),
                course.getName(),
                course.getParallel(),
                course.getLevel(),
                course.getSection() != null ? course.getSection().name() : null,
                course.getSubLevel() != null ? course.getSubLevel().name() : null,
                course.getGrade(),
                course.getWeekStudent() != null ? course.getWeekStudent().getId() : null,
                course.getWeekStudent() != null
                        ? course.getWeekStudent().getEnrollmentNumber() + " - "
                                + course.getWeekStudent().getUser().getFirstName() + " "
                                + course.getWeekStudent().getUser().getLastName()
                        : null);
    }

    @Transactional(readOnly = true)
    public List<AcademicStudentResponse> getMyClassmates(String username) {
        Student student = findStudentByUsername(username);
        List<Student> classmates = studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(
                student.getCourse().getId());
        return classmates.stream()
                .filter(s -> !s.getId().equals(student.getId()))
                .map(this::toStudentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseScheduleResponse> getMySchedule(String username) {
        Student student = findStudentByUsername(username);
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByCourseIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        student.getCourse().getId(),
                        findActivePeriodId());
        return schedules.stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AcademicStudentResponse> getMyStudents(String username) {
        Teacher teacher = findTeacherByUsername(username);
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacher.getId(), findActivePeriodId());
        List<Long> courseIds = schedules.stream()
                .map(s -> s.getCourse().getId())
                .distinct()
                .toList();
        return courseIds.stream()
                .flatMap(cid -> studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(cid).stream())
                .map(this::toStudentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseScheduleResponse> getMyTeachingSchedule(String username) {
        Teacher teacher = findTeacherByUsername(username);
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacher.getId(), findActivePeriodId());
        return schedules.stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    private Long findActivePeriodId() {
        return courseScheduleRepository.findAll().stream()
                .findFirst()
                .map(s -> s.getPeriod().getId())
                .orElse(null);
    }

    private AcademicStudentResponse toStudentResponse(Student student) {
        User user = student.getUser();
        Course course = student.getCourse();
        return new AcademicStudentResponse(
                student.getId(),
                user.getId(),
                user.getUsername(),
                user.getIdentification(),
                user.getFirstName(),
                user.getLastName(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                user.isEnabled(),
                course.getId(),
                course.getName() + " " + course.getParallel(),
                student.getEnrollmentNumber(),
                student.getBirthDate(),
                student.getGender() != null ? student.getGender().name() : null);
    }

    private CourseScheduleResponse toScheduleResponse(CourseSchedule schedule) {
        return new CourseScheduleResponse(
                schedule.getId(),
                schedule.getCourse().getId(),
                schedule.getCourse().getName() + " " + schedule.getCourse().getParallel(),
                schedule.getPeriod().getId(),
                schedule.getPeriod().getName(),
                schedule.getScheduleBlock().getId(),
                schedule.getScheduleBlock().getLabel(),
                schedule.getSubject().getId(),
                schedule.getSubject().getName(),
                schedule.getTeacher().getId(),
                schedule.getTeacher().getUser().getFirstName() + " " + schedule.getTeacher().getUser().getLastName(),
                schedule.getWeekday(),
                schedule.getClassroom());
    }
}
