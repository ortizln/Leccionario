package com.leccionario.backend.dailylog.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.dailylog.domain.DailyLog;
import com.leccionario.backend.dailylog.domain.DailyLogStatus;
import com.leccionario.backend.dailylog.dto.DailyLogResponse;
import com.leccionario.backend.dailylog.repository.*;
import com.leccionario.backend.academic.repository.*;
import com.leccionario.backend.demerit.service.DemeritService;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.schedule.repository.*;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DailyLogServiceTest {

    private DailyLogRepository dailyLogRepository;
    private DailyLogEntryRepository entryRepository;
    private DailyLogStudentAbsenceRepository absenceRepository;
    private DailyLogStudentIncidentRepository incidentRepository;
    private DailyLogSignatureRepository signatureRepository;
    private CourseRepository courseRepository;
    private AcademicPeriodRepository periodRepository;
    private UserRepository userRepository;
    private StudentRepository studentRepository;
    private ScheduleBlockRepository blockRepository;
    private CourseScheduleRepository scheduleRepository;
    private TeacherRepository teacherRepository;
    private DemeritService demeritService;
    private AuditService auditService;
    private DailyLogService service;

    @BeforeEach
    void setUp() {
        dailyLogRepository = mock(DailyLogRepository.class);
        entryRepository = mock(DailyLogEntryRepository.class);
        absenceRepository = mock(DailyLogStudentAbsenceRepository.class);
        incidentRepository = mock(DailyLogStudentIncidentRepository.class);
        signatureRepository = mock(DailyLogSignatureRepository.class);
        courseRepository = mock(CourseRepository.class);
        periodRepository = mock(AcademicPeriodRepository.class);
        userRepository = mock(UserRepository.class);
        studentRepository = mock(StudentRepository.class);
        blockRepository = mock(ScheduleBlockRepository.class);
        scheduleRepository = mock(CourseScheduleRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        demeritService = mock(DemeritService.class);
        auditService = mock(AuditService.class);
        service = new DailyLogService(dailyLogRepository, entryRepository, absenceRepository,
            incidentRepository, signatureRepository, courseRepository, periodRepository,
            userRepository, studentRepository, blockRepository, scheduleRepository,
            teacherRepository, demeritService, auditService);
    }

    private DailyLog buildTestLog(Long id) {
        Course course = new Course();
        course.setId(id != null ? id : 1L);
        course.setName("Matemáticas");
        course.setParallel("A");

        AcademicPeriod period = new AcademicPeriod();
        period.setId(1L);
        period.setName("2024-Bimestre1");

        Institution institution = new Institution();
        institution.setId(1L);
        institution.setName("Unidad Educativa Test");

        User user = new User();
        user.setId(1L);
        user.setFirstName("Admin");
        user.setLastName("User");

        DailyLog log = new DailyLog();
        if (id != null) log.setId(id);
        log.setCourse(course);
        log.setPeriod(period);
        log.setInstitution(institution);
        log.setCreatedBy(user);
        log.setLogDate(LocalDate.of(2024, 6, 15));
        log.setWorkDayNumber(1);
        log.setCity("Guayaquil");
        log.setCloseToken("token-123");
        log.setStatus(DailyLogStatus.DRAFT);
        return log;
    }

    @Test
    void findByCourseAndDate_existingLog_returnsResponse() {
        DailyLog log = buildTestLog(1L);
        when(dailyLogRepository.findByCourseIdAndLogDate(1L, LocalDate.of(2024, 6, 15))).thenReturn(Optional.of(log));
        when(signatureRepository.findByDailyLogId(1L)).thenReturn(java.util.List.of());
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(java.util.List.of());
        DailyLogResponse result = service.findByCourseAndDate(1L, LocalDate.of(2024, 6, 15));
        assertNotNull(result);
    }

    @Test
    void findByCourseAndDate_notFound_throws() {
        when(dailyLogRepository.findByCourseIdAndLogDate(1L, LocalDate.of(2024, 6, 15))).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.findByCourseAndDate(1L, LocalDate.of(2024, 6, 15)));
    }

    @Test
    void generate_existingLog_returnsExisting() {
        DailyLog log = buildTestLog(1L);
        when(dailyLogRepository.findByCourseIdAndLogDate(1L, LocalDate.of(2024, 6, 15))).thenReturn(Optional.of(log));
        when(signatureRepository.findByDailyLogId(1L)).thenReturn(java.util.List.of());
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(java.util.List.of());
        var req = new com.leccionario.backend.dailylog.dto.DailyLogGenerateRequest(1L, 1L, LocalDate.of(2024, 6, 15), 1, "Guayaquil", null);
        DailyLogResponse result = service.generate(req, "teacher1");
        assertNotNull(result);
        verify(courseRepository, never()).findById(anyLong());
    }
}
