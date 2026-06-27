package com.leccionario.backend.self.service;

import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.dailylog.domain.DailyLog;
import com.leccionario.backend.dailylog.domain.DailyLogEntry;
import com.leccionario.backend.dailylog.domain.DailyLogStatus;
import com.leccionario.backend.dailylog.dto.DailyLogEntryResponse;
import com.leccionario.backend.dailylog.dto.DailyLogResponse;
import com.leccionario.backend.dailylog.dto.DailyLogSignatureResponse;
import com.leccionario.backend.dailylog.repository.DailyLogRepository;
import com.leccionario.backend.dailylog.repository.DailyLogSignatureRepository;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.schedule.domain.ScheduleBlockType;
import com.leccionario.backend.schedule.dto.CourseScheduleResponse;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.self.dto.JournalEntryResponse;
import com.leccionario.backend.self.dto.TeacherCourseResponse;
import com.leccionario.backend.self.dto.WeeklyJournalDayResponse;
import com.leccionario.backend.self.dto.WeeklyJournalResponse;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
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
    private final AcademicPeriodRepository academicPeriodRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;
    private final DailyLogRepository dailyLogRepository;
    private final DailyLogSignatureRepository dailyLogSignatureRepository;
    private final CourseRepository courseRepository;

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
                        : null,
                course.getAcademicYear() != null ? course.getAcademicYear().getId() : null,
                course.getAcademicYear() != null ? course.getAcademicYear().getYear() : null,
                course.getSchoolDay() != null ? course.getSchoolDay().getId() : null,
                course.getSchoolDay() != null ? course.getSchoolDay().getName() : null,
                course.getSchoolModality() != null ? course.getSchoolModality().getId() : null,
                course.getSchoolModality() != null ? course.getSchoolModality().getName() : null,
                course.getCapacity());
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
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        var teacherOpt = teacherRepository.findByUserId(user.getId());
        if (teacherOpt.isEmpty()) {
            return List.of();
        }
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacherOpt.get().getId(), findActivePeriodId());
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
    public List<TeacherCourseResponse> getMyCourses(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        var teacherOpt = teacherRepository.findByUserId(user.getId());
        if (teacherOpt.isEmpty()) {
            return List.of();
        }
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacherOpt.get().getId(), findActivePeriodId());
        Map<Long, Course> courseMap = new java.util.LinkedHashMap<>();
        for (CourseSchedule s : schedules) {
            courseMap.putIfAbsent(s.getCourse().getId(), s.getCourse());
        }
        return courseMap.values().stream().map(course -> {
            List<CourseSchedule> courseSchedules = schedules.stream()
                    .filter(s -> s.getCourse().getId().equals(course.getId()))
                    .toList();
            List<String> subjects = courseSchedules.stream()
                    .map(s -> s.getSubject().getName())
                    .distinct()
                    .toList();
            return new TeacherCourseResponse(
                    course.getId(),
                    course.getName(),
                    course.getParallel(),
                    course.getLevel(),
                    course.getSection() != null ? course.getSection().name() : null,
                    course.getSubLevel() != null ? course.getSubLevel().name() : null,
                    course.getGrade(),
                    subjects,
                    courseSchedules.size(),
                    course.getAcademicYear() != null ? course.getAcademicYear().getId() : null,
                    course.getAcademicYear() != null ? course.getAcademicYear().getYear() : null,
                    course.getSchoolDay() != null ? course.getSchoolDay().getId() : null,
                    course.getSchoolDay() != null ? course.getSchoolDay().getName() : null,
                    course.getSchoolModality() != null ? course.getSchoolModality().getId() : null,
                    course.getSchoolModality() != null ? course.getSchoolModality().getName() : null,
                    course.getCapacity());
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<AcademicStudentResponse> getMyCourseStudents(String username, Long courseId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        var teacherOpt = teacherRepository.findByUserId(user.getId());
        if (teacherOpt.isEmpty()) {
            return List.of();
        }
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacherOpt.get().getId(), findActivePeriodId());
        boolean authorized = schedules.stream()
                .anyMatch(s -> s.getCourse().getId().equals(courseId));
        if (!authorized) {
            return List.of();
        }
        return studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(courseId).stream()
                .map(this::toStudentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseScheduleResponse> getMyTeachingSchedule(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));
        var teacherOpt = teacherRepository.findByUserId(user.getId());
        if (teacherOpt.isEmpty()) {
            return List.of();
        }
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacherOpt.get().getId(), findActivePeriodId());
        return schedules.stream()
                .map(this::toScheduleResponse)
                .toList();
    }

    @Transactional
    public WeeklyJournalResponse getMyWeeklyJournal(String username, int weekOffset) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        var teacherOpt = teacherRepository.findByUserId(user.getId());
        if (teacherOpt.isEmpty()) {
            return new WeeklyJournalResponse(
                    (user.getFirstName() + " " + user.getLastName()).trim(),
                    "",
                    LocalDate.now(),
                    List.of());
        }

        Teacher teacher = teacherOpt.get();
        AcademicPeriod period = academicPeriodRepository.findByActiveTrue()
                .orElseThrow(() -> new BusinessException("No hay periodo academico activo"));

        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                        teacher.getId(), period.getId());

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).plusWeeks(weekOffset);

        List<WeeklyJournalDayResponse> days = new ArrayList<>();
        for (int wd = 1; wd <= 6; wd++) {
            final int weekday = wd;
            LocalDate logDate = weekStart.plusDays(weekday - 1);

            List<CourseSchedule> daySchedules = schedules.stream()
                    .filter(s -> s.getWeekday() == weekday)
                    .filter(s -> s.getScheduleBlock().isActive())
                    .toList();

            List<JournalEntryResponse> entries = daySchedules.stream()
                    .map(schedule -> {
                        DailyLog log = dailyLogRepository.findByCourseIdAndLogDate(
                                        schedule.getCourse().getId(), logDate)
                                .orElseGet(() -> createLogForDay(
                                        schedule.getCourse().getId(),
                                        period.getId(),
                                        logDate,
                                        username));
                        DailyLogEntry entry = log.getEntries().stream()
                                .filter(e -> e.getScheduleBlock().getId().equals(schedule.getScheduleBlock().getId()))
                                .findFirst()
                                .orElse(null);
                        if (entry == null) {
                            return null;
                        }
                        return new JournalEntryResponse(
                                log.getId(),
                                entry.getId(),
                                log.getCourse().getName() + " " + log.getCourse().getParallel(),
                                schedule.getScheduleBlock().getLabel(),
                                schedule.getScheduleBlock().getStartTime() != null
                                        ? schedule.getScheduleBlock().getStartTime().toString() : "",
                                schedule.getScheduleBlock().getEndTime() != null
                                        ? schedule.getScheduleBlock().getEndTime().toString() : "",
                                schedule.getSubject().getName(),
                                schedule.getTeacher().getUser().getFirstName() + " "
                                        + schedule.getTeacher().getUser().getLastName(),
                                schedule.getScheduleBlock().getBlockType().name(),
                                entry.getDidacticUnit(),
                                entry.getTopic(),
                                entry.getSpecificNotes(),
                                entry.getGeneralNotes(),
                                entry.getTeacherSignatureStatus().name(),
                                entry.getCloseToken());
                    })
                    .filter(e -> e != null)
                    .toList();

            String[] weekdayLabels = {"", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"};
            days.add(new WeeklyJournalDayResponse(weekday, weekdayLabels[weekday], logDate, entries));
        }

        return new WeeklyJournalResponse(
                (user.getFirstName() + " " + user.getLastName()).trim(),
                period.getName(),
                weekStart,
                days);
    }

    @Transactional(readOnly = true)
    public DailyLogResponse getMyCourseDailyLog(String username, String logDateStr) {
        Student student = findStudentByUsername(username);
        Course course = student.getCourse();
        LocalDate logDate = logDateStr != null ? LocalDate.parse(logDateStr) : LocalDate.now();

        return dailyLogRepository.findByCourseIdAndLogDate(course.getId(), logDate)
                .map(this::toDailyLogResponse)
                .orElse(null);
    }

    private DailyLogResponse toDailyLogResponse(DailyLog log) {
        List<DailyLogEntryResponse> entries = log.getEntries().stream()
                .map(entry -> new DailyLogEntryResponse(
                        entry.getId(),
                        entry.getScheduleBlock().getId(),
                        entry.getScheduleBlock().getLabel(),
                        entry.getScheduleBlock().getBlockType().name(),
                        entry.getScheduleBlock().getStartTime() != null
                                ? entry.getScheduleBlock().getStartTime().toString() : "",
                        entry.getScheduleBlock().getEndTime() != null
                                ? entry.getScheduleBlock().getEndTime().toString() : "",
                        entry.getTeacher() != null ? entry.getTeacher().getId() : null,
                        entry.getTeacher() != null
                                ? entry.getTeacher().getUser().getFirstName() + " " + entry.getTeacher().getUser().getLastName()
                                : null,
                        entry.getSubject() != null ? entry.getSubject().getId() : null,
                        entry.getSubject() != null ? entry.getSubject().getName() : null,
                        entry.getDidacticUnit(),
                        entry.getTopic(),
                        entry.getCloseToken(),
                        entry.getTeacherSignatureStatus().name(),
                        entry.getTeacherClosedAt() != null ? entry.getTeacherClosedAt().toString() : null,
                        entry.getSpecificNotes(),
                        entry.getGeneralNotes(),
                        List.of(),
                        List.of()))
                .toList();

        List<DailyLogSignatureResponse> signatures = dailyLogSignatureRepository.findByDailyLogId(log.getId()).stream()
                .map(sig -> new DailyLogSignatureResponse(
                        sig.getId(),
                        sig.getSignerUser().getFirstName() + " " + sig.getSignerUser().getLastName(),
                        sig.getSignerUser().getRoles().stream().findFirst().map(r -> r.getName()).orElse(""),
                        sig.getSignatureType().name(),
                        sig.getSignedAt().toString(),
                        sig.getNotes()))
                .toList();

        return new DailyLogResponse(
                log.getId(),
                log.getCourse().getId(),
                log.getCourse().getName() + " " + log.getCourse().getParallel(),
                log.getPeriod().getId(),
                log.getPeriod().getName(),
                log.getInstitution().getId(),
                log.getInstitution().getName(),
                log.getWorkDayNumber(),
                log.getLogDate(),
                log.getCity(),
                log.getGeneralNotes(),
                log.getCloseToken(),
                log.getStatus().name(),
                log.getClosedAt() != null ? log.getClosedAt().toString() : null,
                signatures,
                List.of(),
                entries);
    }

    private DailyLog createLogForDay(Long courseId, Long periodId, LocalDate logDate, String actor) {
        User createdBy = userRepository.findByUsername(actor)
                .orElseThrow(() -> new BusinessException("Usuario no encontrado"));

        DailyLog log = new DailyLog();
        log.setCourse(courseRepository.findById(courseId)
                .orElseThrow(() -> new BusinessException("Curso no encontrado")));
        log.setPeriod(academicPeriodRepository.findById(periodId)
                .orElseThrow(() -> new BusinessException("Periodo no encontrado")));
        log.setInstitution(createdBy.getInstitution());
        log.setCreatedBy(createdBy);
        log.setLogDate(logDate);
        log.setCloseToken(UUID.randomUUID().toString());

        Map<Long, CourseSchedule> assignments = courseScheduleRepository
                .findByCourseIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(courseId, periodId)
                .stream()
                .filter(s -> s.getWeekday() == logDate.getDayOfWeek().getValue())
                .collect(Collectors.toMap(
                        s -> s.getScheduleBlock().getId(),
                        Function.identity(),
                        (a, b) -> a));

        scheduleBlockRepository.findAll().stream()
                .filter(block -> block.isActive())
                .sorted(java.util.Comparator.comparingInt(block -> block.getBlockOrder()))
                .forEach(block -> {
                    DailyLogEntry entry = new DailyLogEntry();
                    entry.setDailyLog(log);
                    entry.setScheduleBlock(block);
                    entry.setCloseToken(UUID.randomUUID().toString());
                    var assignment = assignments.get(block.getId());
                    if (assignment != null && block.getBlockType() == ScheduleBlockType.CLASS) {
                        entry.setTeacher(assignment.getTeacher());
                        entry.setSubject(assignment.getSubject());
                    }
                    log.getEntries().add(entry);
                });

        return dailyLogRepository.save(log);
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
                schedule.getScheduleBlock().getStartTime() != null ? schedule.getScheduleBlock().getStartTime().toString() : "",
                schedule.getScheduleBlock().getEndTime() != null ? schedule.getScheduleBlock().getEndTime().toString() : "",
                schedule.getClassroom());
    }
}
