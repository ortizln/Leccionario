package com.leccionario.backend.dailylog.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.dailylog.domain.DailyLog;
import com.leccionario.backend.dailylog.domain.DailyLogEntry;
import com.leccionario.backend.dailylog.domain.DailyLogStatus;
import com.leccionario.backend.dailylog.domain.TeacherSignatureStatus;
import com.leccionario.backend.dailylog.dto.DailyLogAbsenceItemRequest;
import com.leccionario.backend.dailylog.dto.DailyLogAbsenceUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogEntryUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogGenerateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogIncidentItemRequest;
import com.leccionario.backend.dailylog.dto.DailyLogIncidentUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogResponse;
import com.leccionario.backend.dailylog.repository.*;
import com.leccionario.backend.demerit.service.DemeritService;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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

    private DailyLogEntry buildTestEntry(DailyLog log) {
        DailyLogEntry entry = new DailyLogEntry();
        entry.setId(1L);
        entry.setDailyLog(log);
        entry.setCloseToken("entry-token-123");
        entry.setTeacherSignatureStatus(TeacherSignatureStatus.PENDING);
        return entry;
    }

    @Test
    void findByCourseAndDate_existingLog_returnsResponse() {
        DailyLog log = buildTestLog(1L);
        when(dailyLogRepository.findByCourseIdAndLogDate(1L, LocalDate.of(2024, 6, 15))).thenReturn(Optional.of(log));
        when(signatureRepository.findByDailyLogId(1L)).thenReturn(List.of());
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(List.of());
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
        when(signatureRepository.findByDailyLogId(1L)).thenReturn(List.of());
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(List.of());
        var req = new DailyLogGenerateRequest(1L, 1L, LocalDate.of(2024, 6, 15), 1, "Guayaquil", null);
        DailyLogResponse result = service.generate(req, "teacher1");
        assertNotNull(result);
        verify(courseRepository, never()).findById(anyLong());
    }

    @Test
    void generate_newLog_createsAndAudits() {
        when(dailyLogRepository.findByCourseIdAndLogDate(1L, LocalDate.of(2024, 6, 15))).thenReturn(Optional.empty());

        User actor = new User();
        actor.setId(1L);
        actor.setUsername("teacher1");
        actor.setInstitution(new Institution());
        actor.getInstitution().setId(1L);
        when(userRepository.findByUsername("teacher1")).thenReturn(Optional.of(actor));

        Course course = new Course();
        course.setId(1L);
        course.setName("Matemáticas");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        AcademicPeriod period = new AcademicPeriod();
        period.setId(1L);
        when(periodRepository.findById(1L)).thenReturn(Optional.of(period));
        when(scheduleRepository.findByCourseIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(1L, 1L))
                .thenReturn(List.of());
        when(blockRepository.findAll()).thenReturn(List.of());
        when(dailyLogRepository.save(any())).thenAnswer(inv -> {
            DailyLog log = inv.getArgument(0);
            log.setId(1L);
            return log;
        });
        when(signatureRepository.findByDailyLogId(1L)).thenReturn(List.of());
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(List.of());

        var req = new DailyLogGenerateRequest(1L, 1L, LocalDate.of(2024, 6, 15), 1, "Guayaquil", null);
        DailyLogResponse result = service.generate(req, "teacher1");
        assertNotNull(result);
        verify(auditService).log(eq("teacher1"), eq("CREATE"), eq("DAILY_LOG"), any());
    }

    @Test
    void updateEntry_existingEntry_updatesAndAudits() {
        DailyLog log = buildTestLog(1L);
        DailyLogEntry entry = buildTestEntry(log);

        when(entryRepository.findByIdAndDailyLogId(1L, 1L)).thenReturn(Optional.of(entry));
        when(entryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var req = new DailyLogEntryUpdateRequest("Unidad 1", "Tema Algebra", "Notas especificas", "Notas generales", true);
        var result = service.updateEntry(1L, 1L, req, "teacher1");

        assertNotNull(result);
        assertEquals("Unidad 1", result.didacticUnit());
        assertEquals("Tema Algebra", result.topic());
        verify(auditService).log(eq("teacher1"), eq("UPDATE"), eq("DAILY_LOG"), any());
    }

    @Test
    void updateEntry_notFound_throws() {
        when(entryRepository.findByIdAndDailyLogId(99L, 1L)).thenReturn(Optional.empty());
        var req = new DailyLogEntryUpdateRequest("U1", "T1", null, null, false);
        assertThrows(ResourceNotFoundException.class, () -> service.updateEntry(1L, 99L, req, "teacher1"));
    }

    @Test
    void updateAbsences_existingEntry_updatesAbsences() {
        DailyLog log = buildTestLog(1L);
        DailyLogEntry entry = buildTestEntry(log);

        when(entryRepository.findByIdAndDailyLogId(1L, 1L)).thenReturn(Optional.of(entry));
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(List.of());

        var absenceItem = new DailyLogAbsenceItemRequest(10L, "INJUSTIFICADA", "Falta grave");
        var req = new DailyLogAbsenceUpdateRequest(List.of(absenceItem));
        var result = service.updateAbsences(1L, 1L, req, "teacher1");

        assertNotNull(result);
        verify(absenceRepository).deleteByDailyLogEntryId(1L);
        verify(auditService).log(eq("teacher1"), eq("UPDATE"), eq("DAILY_LOG"), any());
    }

    @Test
    void updateIncidents_existingEntry_updatesIncidents() {
        DailyLog log = buildTestLog(1L);
        DailyLogEntry entry = buildTestEntry(log);

        when(entryRepository.findByIdAndDailyLogId(1L, 1L)).thenReturn(Optional.of(entry));
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(List.of());

        var incidentItem = new DailyLogIncidentItemRequest(10L, null, "COMPORTAMIENTO", "Irrespetuoso");
        var req = new DailyLogIncidentUpdateRequest(List.of(incidentItem));
        var result = service.updateIncidents(1L, 1L, req, "teacher1");

        assertNotNull(result);
        verify(incidentRepository).deleteByDailyLogEntryId(1L);
        verify(auditService).log(eq("teacher1"), eq("UPDATE"), eq("DAILY_LOG"), any());
    }

    @Test
    void findByCourseAndDate_withSignatures_returnsResponse() {
        DailyLog log = buildTestLog(1L);
        when(dailyLogRepository.findByCourseIdAndLogDate(1L, LocalDate.of(2024, 6, 15))).thenReturn(Optional.of(log));
        when(signatureRepository.findByDailyLogId(1L)).thenReturn(List.of());
        when(studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(1L)).thenReturn(List.of());

        DailyLogResponse result = service.findByCourseAndDate(1L, LocalDate.of(2024, 6, 15));
        assertNotNull(result);
        assertEquals(DailyLogStatus.DRAFT, result.status());
    }
}
