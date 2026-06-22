package com.leccionario.backend.dailylog.service;

import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.demerit.domain.Demerit;
import com.leccionario.backend.demerit.dto.DemeritOptionResponse;
import com.leccionario.backend.demerit.service.DemeritService;
import com.leccionario.backend.dailylog.domain.DailyLogAbsenceType;
import com.leccionario.backend.dailylog.domain.DailyLog;
import com.leccionario.backend.dailylog.domain.DailyLogEntry;
import com.leccionario.backend.dailylog.domain.DailyLogSignature;
import com.leccionario.backend.dailylog.domain.DailyLogSignatureType;
import com.leccionario.backend.dailylog.domain.DailyLogStatus;
import com.leccionario.backend.dailylog.domain.DailyLogStudentAbsence;
import com.leccionario.backend.dailylog.domain.DailyLogStudentIncident;
import com.leccionario.backend.dailylog.domain.TeacherSignatureStatus;
import com.leccionario.backend.dailylog.dto.DailyLogAbsenceResponse;
import com.leccionario.backend.dailylog.dto.DailyLogAbsenceItemRequest;
import com.leccionario.backend.dailylog.dto.DailyLogAbsenceUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogEntryResponse;
import com.leccionario.backend.dailylog.dto.DailyLogEntryUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogGenerateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogIncidentItemRequest;
import com.leccionario.backend.dailylog.dto.DailyLogIncidentResponse;
import com.leccionario.backend.dailylog.dto.DailyLogIncidentUpdateRequest;
import com.leccionario.backend.dailylog.dto.DailyLogResponse;
import com.leccionario.backend.dailylog.dto.DailyLogSignatureResponse;
import com.leccionario.backend.dailylog.dto.DailyLogStudentOptionResponse;
import com.leccionario.backend.dailylog.dto.MobileCloseRequest;
import com.leccionario.backend.dailylog.dto.MobileEntryCloseResponse;
import com.leccionario.backend.dailylog.dto.MobileLogCloseResponse;
import com.leccionario.backend.dailylog.dto.MobileLogSignatureResponse;
import com.leccionario.backend.dailylog.dto.MobileTodayEntryResponse;
import com.leccionario.backend.dailylog.dto.MobileTodayResponse;
import com.leccionario.backend.dailylog.repository.DailyLogEntryRepository;
import com.leccionario.backend.dailylog.repository.DailyLogRepository;
import com.leccionario.backend.dailylog.repository.DailyLogSignatureRepository;
import com.leccionario.backend.dailylog.repository.DailyLogStudentAbsenceRepository;
import com.leccionario.backend.dailylog.repository.DailyLogStudentIncidentRepository;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.schedule.domain.ScheduleBlockType;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DailyLogService {

    private final DailyLogRepository dailyLogRepository;
    private final DailyLogEntryRepository dailyLogEntryRepository;
    private final DailyLogStudentAbsenceRepository dailyLogStudentAbsenceRepository;
    private final DailyLogStudentIncidentRepository dailyLogStudentIncidentRepository;
    private final DailyLogSignatureRepository dailyLogSignatureRepository;
    private final CourseRepository courseRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ScheduleBlockRepository scheduleBlockRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final TeacherRepository teacherRepository;
    private final DemeritService demeritService;
    private final AuditService auditService;

    @Transactional
    public DailyLogResponse generate(DailyLogGenerateRequest request, String actor) {
        return dailyLogRepository.findByCourseIdAndLogDate(request.courseId(), request.logDate())
                .map(this::toResponse)
                .orElseGet(() -> createLog(request, actor));
    }

    @Transactional(readOnly = true)
    public DailyLogResponse findByCourseAndDate(Long courseId, LocalDate logDate) {
        DailyLog log = dailyLogRepository.findByCourseIdAndLogDate(courseId, logDate)
                .orElseThrow(() -> new ResourceNotFoundException("No existe leccionario diario para la fecha y curso indicados"));
        return toResponse(log);
    }

    @Transactional
    public DailyLogEntryResponse updateEntry(Long dailyLogId, Long entryId, DailyLogEntryUpdateRequest request, String actor) {
        DailyLogEntry entry = dailyLogEntryRepository.findByIdAndDailyLogId(entryId, dailyLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada de leccionario no encontrada"));
        ensureEntryEditable(entry);

        entry.setDidacticUnit(trimToNull(request.didacticUnit()));
        entry.setTopic(trimToNull(request.topic()));
        entry.setSpecificNotes(trimToNull(request.specificNotes()));
        entry.setGeneralNotes(trimToNull(request.generalNotes()));
        entry.setTeacherSignatureStatus(request.signed() ? TeacherSignatureStatus.SIGNED : TeacherSignatureStatus.PENDING);
        entry.setTeacherClosedAt(request.signed() ? LocalDateTime.now() : null);

        DailyLogEntry saved = dailyLogEntryRepository.save(entry);
        auditService.log(actor, "UPDATE", "DAILY_LOG", "Entrada actualizada en jornada ID " + dailyLogId);
        return toEntryResponse(saved);
    }

    @Transactional
    public DailyLogEntryResponse updateAbsences(Long dailyLogId, Long entryId, DailyLogAbsenceUpdateRequest request, String actor) {
        DailyLogEntry entry = dailyLogEntryRepository.findByIdAndDailyLogId(entryId, dailyLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada de leccionario no encontrada"));
        ensureEntryEditable(entry);

        dailyLogStudentAbsenceRepository.deleteByDailyLogEntryId(entry.getId());

        Map<Long, DailyLogAbsenceItemRequest> absenceByStudentId = request.absences().stream()
                .collect(java.util.stream.Collectors.toMap(
                        DailyLogAbsenceItemRequest::studentId,
                        Function.identity(),
                        (left, right) -> right));
        Set<Long> studentIds = absenceByStudentId.keySet();

        studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(entry.getDailyLog().getCourse().getId()).stream()
                .filter(student -> studentIds.contains(student.getId()))
                .forEach(student -> {
                    DailyLogAbsenceItemRequest item = absenceByStudentId.get(student.getId());
                    DailyLogStudentAbsence absence = new DailyLogStudentAbsence();
                    absence.setDailyLogEntry(entry);
                    absence.setStudent(student);
                    absence.setAbsenceType(parseAbsenceType(item.absenceType()));
                    absence.setNotes(trimToNull(item.notes()));
                    dailyLogStudentAbsenceRepository.save(absence);
                });

        auditService.log(actor, "UPDATE", "DAILY_LOG", "Inasistencias actualizadas en jornada ID " + dailyLogId);
        return toEntryResponse(entry);
    }

    @Transactional
    public DailyLogEntryResponse updateIncidents(Long dailyLogId, Long entryId, DailyLogIncidentUpdateRequest request, String actor) {
        DailyLogEntry entry = dailyLogEntryRepository.findByIdAndDailyLogId(entryId, dailyLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Entrada de leccionario no encontrada"));
        ensureEntryEditable(entry);

        dailyLogStudentIncidentRepository.deleteByDailyLogEntryId(entry.getId());

        Map<Long, DailyLogIncidentItemRequest> incidentsByStudentId = request.incidents().stream()
                .collect(java.util.stream.Collectors.toMap(
                        DailyLogIncidentItemRequest::studentId,
                        Function.identity(),
                        (left, right) -> right));
        Set<Long> studentIds = incidentsByStudentId.keySet();

        studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(entry.getDailyLog().getCourse().getId()).stream()
                .filter(student -> studentIds.contains(student.getId()))
                .forEach(student -> {
                    DailyLogIncidentItemRequest item = incidentsByStudentId.get(student.getId());
                    Demerit demerit = item.demeritId() != null ? demeritService.requireById(item.demeritId()) : null;
                    DailyLogStudentIncident incident = new DailyLogStudentIncident();
                    incident.setDailyLogEntry(entry);
                    incident.setStudent(student);
                    incident.setDemerit(demerit);
                    incident.setCategory(demerit != null ? demerit.getCategory() : defaultIncidentCategory(item.category()));
                    incident.setNotes(trimToNull(item.notes()));
                    dailyLogStudentIncidentRepository.save(incident);
                });

        auditService.log(actor, "UPDATE", "DAILY_LOG", "Novedades especificas actualizadas en jornada ID " + dailyLogId);
        return toEntryResponse(entry);
    }

    @Transactional(readOnly = true)
    public MobileEntryCloseResponse getMobileEntryClose(String token) {
        DailyLogEntry entry = dailyLogEntryRepository.findByCloseToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cierre de clase asociado a ese codigo."));
        return new MobileEntryCloseResponse(
                entry.getCloseToken(),
                entry.getDailyLog().getCourse().getName() + " " + entry.getDailyLog().getCourse().getParallel(),
                entry.getDailyLog().getLogDate().toString(),
                entry.getScheduleBlock().getLabel(),
                entry.getSubject() != null ? entry.getSubject().getName() : "Sin asignatura",
                entry.getTeacher() != null ? entry.getTeacher().getUser().getFirstName() + " " + entry.getTeacher().getUser().getLastName() : "Sin docente",
                entry.getTeacherSignatureStatus().name(),
                entry.getTeacherClosedAt() != null ? entry.getTeacherClosedAt().toString() : null);
    }

    @Transactional
    public MobileEntryCloseResponse closeEntryFromMobile(String token, MobileCloseRequest request) {
        DailyLogEntry entry = dailyLogEntryRepository.findByCloseToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cierre de clase asociado a ese codigo."));
        ensureEntryEditable(entry);

        if (entry.getTeacher() == null) {
            throw new BusinessException("Esta clase no tiene docente asignado para validar el cierre.");
        }

        User user = validateUserCode(request);
        if (!user.getId().equals(entry.getTeacher().getUser().getId())) {
            throw new BusinessException("El codigo ingresado no corresponde al docente asignado a esta clase.");
        }

        entry.setTeacherSignatureStatus(TeacherSignatureStatus.SIGNED);
        entry.setTeacherClosedAt(LocalDateTime.now());
        dailyLogEntryRepository.save(entry);
        auditService.log(user.getUsername(), "CLASS_CLOSE", "DAILY_LOG", "Cierre movil de bloque " + entry.getId());
        return getMobileEntryClose(token);
    }

    @Transactional(readOnly = true)
    public MobileLogCloseResponse getMobileLogClose(String token) {
        DailyLog log = dailyLogRepository.findByCloseToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cierre de leccionario asociado a ese codigo."));
        return new MobileLogCloseResponse(
                log.getCloseToken(),
                log.getCourse().getName() + " " + log.getCourse().getParallel(),
                log.getLogDate().toString(),
                log.getStatus().name(),
                log.getClosedAt() != null ? log.getClosedAt().toString() : null);
    }

    @Transactional(readOnly = true)
    public MobileLogSignatureResponse getMobileLogSignature(String token, DailyLogSignatureType signatureType) {
        DailyLog log = dailyLogRepository.findByCloseToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cierre de leccionario asociado a ese codigo."));
        DailyLogSignature signature = dailyLogSignatureRepository.findByDailyLogId(log.getId()).stream()
                .filter(item -> item.getSignatureType() == signatureType)
                .findFirst()
                .orElse(null);
        return new MobileLogSignatureResponse(
                log.getCloseToken(),
                log.getCourse().getName() + " " + log.getCourse().getParallel(),
                log.getLogDate().toString(),
                log.getStatus().name(),
                signatureType.name(),
                signature != null ? signature.getSignerUser().getFirstName() + " " + signature.getSignerUser().getLastName() : null,
                signature != null ? signature.getSignedAt().toString() : null);
    }

    @Transactional
    public MobileTodayResponse getMobileToday(LocalDate workDate, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("El usuario autenticado no tiene perfil de docente."));

        var activePeriod = academicPeriodRepository.findByActiveTrue()
                .filter(period -> !workDate.isBefore(period.getStartDate()) && !workDate.isAfter(period.getEndDate()));
        if (activePeriod.isEmpty()) {
            return new MobileTodayResponse(
                    user.getUsername(),
                    (user.getFirstName() + " " + user.getLastName()).trim(),
                    workDate.toString(),
                    List.of());
        }

        short weekday = (short) workDate.getDayOfWeek().getValue();
        List<CourseSchedule> schedules = courseScheduleRepository
                .findByTeacherIdAndPeriodIdAndWeekdayOrderByCourse_NameAscCourse_ParallelAscScheduleBlock_BlockOrderAsc(
                        teacher.getId(),
                        activePeriod.get().getId(),
                        weekday).stream()
                .filter(schedule -> schedule.getScheduleBlock().isActive())
                .filter(schedule -> schedule.getScheduleBlock().getBlockType() == ScheduleBlockType.CLASS)
                .toList();

        List<MobileTodayEntryResponse> entries = schedules.stream()
                .map(schedule -> {
                    DailyLog log = dailyLogRepository.findByCourseIdAndLogDate(schedule.getCourse().getId(), workDate)
                            .orElseGet(() -> createLogForMobile(schedule.getCourse().getId(), activePeriod.get().getId(), workDate, username));
                    DailyLogEntry entry = synchronizeEntryWithSchedule(log, schedule);
                    return log.getStatus() == DailyLogStatus.DRAFT ? toMobileTodayEntry(log, entry) : null;
                })
                .filter(java.util.Objects::nonNull)
                .toList();

        return new MobileTodayResponse(
                user.getUsername(),
                (user.getFirstName() + " " + user.getLastName()).trim(),
                workDate.toString(),
                entries);
    }

    @Transactional
    public MobileLogSignatureResponse signLogFromMobile(String token, DailyLogSignatureType signatureType, MobileCloseRequest request) {
        DailyLog log = dailyLogRepository.findByCloseToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cierre de leccionario asociado a ese codigo."));
        if (log.getStatus() == DailyLogStatus.CLOSED || log.getStatus() == DailyLogStatus.SIGNED) {
            throw new BusinessException("El leccionario ya fue cerrado.");
        }

        User user = validateUserCode(request);
        validateSignaturePermission(user, signatureType);
        validateAssignedSigner(log, user, signatureType);

        boolean alreadySigned = dailyLogSignatureRepository.findByDailyLogId(log.getId()).stream()
                .anyMatch(signature -> signature.getSignatureType() == signatureType);
        if (alreadySigned) {
            throw new BusinessException("Esa firma ya fue registrada en el leccionario.");
        }

        DailyLogSignature signature = new DailyLogSignature();
        signature.setDailyLog(log);
        signature.setSignerUser(user);
        signature.setSignerRole(user.getRoles().stream().findFirst().map(role -> role.getName()).orElse("ROLE_ESTUDIANTE"));
        signature.setSignatureType(signatureType);
        signature.setSignedAt(LocalDateTime.now());
        signature.setNotes(trimToNull(request.notes()));
        dailyLogSignatureRepository.save(signature);

        auditService.log(user.getUsername(), "LOG_SIGNATURE", "DAILY_LOG", "Firma " + signatureType.name() + " en jornada " + log.getId());
        return getMobileLogSignature(token, signatureType);
    }

    @Transactional
    public MobileLogCloseResponse closeLogFromMobile(String token, MobileCloseRequest request) {
        DailyLog log = dailyLogRepository.findByCloseToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("No existe un cierre de leccionario asociado a ese codigo."));
        if (log.getStatus() == DailyLogStatus.CLOSED || log.getStatus() == DailyLogStatus.SIGNED) {
            throw new BusinessException("El leccionario ya fue cerrado.");
        }

        boolean pendingTeacherSignatures = log.getEntries().stream()
                .filter(entry -> entry.getScheduleBlock().getBlockType() == ScheduleBlockType.CLASS)
                .anyMatch(entry -> entry.getTeacherSignatureStatus() != TeacherSignatureStatus.SIGNED);
        if (pendingTeacherSignatures) {
            throw new BusinessException("No se puede cerrar el leccionario mientras existan clases sin cierre docente.");
        }

        List<DailyLogSignature> existingSignatures = dailyLogSignatureRepository.findByDailyLogId(log.getId());
        boolean missingTutorSignature = existingSignatures.stream().noneMatch(signature -> signature.getSignatureType() == DailyLogSignatureType.TEACHER_TUTOR);
        boolean missingWeekStudentSignature = existingSignatures.stream().noneMatch(signature -> signature.getSignatureType() == DailyLogSignatureType.WEEK_STUDENT);
        if (missingTutorSignature || missingWeekStudentSignature) {
            throw new BusinessException("Antes del cierre final se requieren las firmas de docente tutor y semanero.");
        }

        User user = validateUserCode(request);
        boolean inspectorAllowed = user.getRoles().stream()
                .map(role -> role.getName())
                .anyMatch(role -> role.equals(RoleDefaults.ADMINISTRADOR) || role.equals(RoleDefaults.ADMINISTRATIVO));
        if (!inspectorAllowed) {
            throw new BusinessException("El usuario ingresado no tiene permisos para cerrar el leccionario.");
        }

        DailyLogSignature signature = new DailyLogSignature();
        signature.setDailyLog(log);
        signature.setSignerUser(user);
        signature.setSignerRole(user.getRoles().stream().findFirst().map(role -> role.getName()).orElse("ROLE_ADMINISTRATIVO"));
        signature.setSignatureType(DailyLogSignatureType.GENERAL_INSPECTOR);
        signature.setSignedAt(LocalDateTime.now());
        signature.setNotes(trimToNull(request.notes()));
        dailyLogSignatureRepository.save(signature);

        log.setStatus(DailyLogStatus.CLOSED);
        log.setClosedAt(LocalDateTime.now());
        dailyLogRepository.save(log);
        auditService.log(user.getUsername(), "LOG_CLOSE", "DAILY_LOG", "Cierre movil de jornada " + log.getId());
        return getMobileLogClose(token);
    }

    private DailyLogResponse createLog(DailyLogGenerateRequest request, String actor) {
        DailyLog saved = createAndPersistLog(
                request.courseId(),
                request.periodId(),
                request.logDate(),
                request.workDayNumber(),
                request.city(),
                request.generalNotes(),
                actor);
        auditService.log(actor, "CREATE", "DAILY_LOG", "Jornada generada para curso " + saved.getCourse().getName() + " en fecha " + saved.getLogDate());
        return toResponse(saved);
    }

    private DailyLog createLogForMobile(Long courseId, Long periodId, LocalDate logDate, String actor) {
        DailyLog saved = createAndPersistLog(courseId, periodId, logDate, null, null, null, actor);
        auditService.log(actor, "AUTO_CREATE_MOBILE", "DAILY_LOG", "Jornada movil creada para curso " + saved.getCourse().getName() + " en fecha " + saved.getLogDate());
        return saved;
    }

    private DailyLog createAndPersistLog(
            Long courseId,
            Long periodId,
            LocalDate logDate,
            Integer workDayNumber,
            String city,
            String generalNotes,
            String actor) {
        var createdBy = userRepository.findByUsername(actor)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        DailyLog log = new DailyLog();
        log.setCourse(courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado")));
        log.setPeriod(academicPeriodRepository.findById(periodId)
                .orElseThrow(() -> new ResourceNotFoundException("Periodo no encontrado")));
        log.setInstitution(createdBy.getInstitution());
        log.setCreatedBy(createdBy);
        log.setWorkDayNumber(workDayNumber);
        log.setLogDate(logDate);
        log.setCity(trimToNull(city));
        log.setGeneralNotes(trimToNull(generalNotes));
        log.setCloseToken(UUID.randomUUID().toString());

        DayOfWeek weekday = logDate.getDayOfWeek();
        Map<Long, com.leccionario.backend.schedule.domain.CourseSchedule> assignments = courseScheduleRepository
                .findByCourseIdAndPeriodIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(courseId, periodId).stream()
                .filter(schedule -> schedule.getWeekday() == weekday.getValue())
                .collect(java.util.stream.Collectors.toMap(schedule -> schedule.getScheduleBlock().getId(), Function.identity(), (left, right) -> left));

        scheduleBlockRepository.findAll().stream()
                .filter(block -> block.isActive())
                .sorted(Comparator.comparingInt(block -> block.getBlockOrder()))
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

    private DailyLogEntry synchronizeEntryWithSchedule(DailyLog log, CourseSchedule schedule) {
        DailyLogEntry entry = log.getEntries().stream()
                .filter(item -> item.getScheduleBlock().getId().equals(schedule.getScheduleBlock().getId()))
                .findFirst()
                .orElseGet(() -> {
                    DailyLogEntry newEntry = new DailyLogEntry();
                    newEntry.setDailyLog(log);
                    newEntry.setScheduleBlock(schedule.getScheduleBlock());
                    newEntry.setCloseToken(UUID.randomUUID().toString());
                    log.getEntries().add(newEntry);
                    return newEntry;
                });

        entry.setTeacher(schedule.getTeacher());
        entry.setSubject(schedule.getSubject());
        return dailyLogEntryRepository.save(entry);
    }

    private DailyLogResponse toResponse(DailyLog log) {
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
                dailyLogSignatureRepository.findByDailyLogId(log.getId()).stream()
                        .sorted(Comparator.comparing(DailyLogSignature::getSignedAt))
                        .map(signature -> new DailyLogSignatureResponse(
                                signature.getId(),
                                signature.getSignerUser().getFirstName() + " " + signature.getSignerUser().getLastName(),
                                signature.getSignerRole(),
                                signature.getSignatureType().name(),
                                signature.getSignedAt().toString(),
                                signature.getNotes()))
                        .toList(),
                studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(log.getCourse().getId()).stream()
                        .map(student -> new DailyLogStudentOptionResponse(
                                student.getId(),
                                student.getEnrollmentNumber(),
                                student.getUser().getFirstName() + " " + student.getUser().getLastName()))
                        .toList(),
                log.getEntries().stream()
                        .sorted(Comparator.comparing(entry -> entry.getScheduleBlock().getBlockOrder()))
                        .map(this::toEntryResponse)
                        .toList());
    }

    private DailyLogEntryResponse toEntryResponse(DailyLogEntry entry) {
        return new DailyLogEntryResponse(
                entry.getId(),
                entry.getScheduleBlock().getId(),
                entry.getScheduleBlock().getLabel(),
                entry.getScheduleBlock().getBlockType().name(),
                entry.getScheduleBlock().getStartTime().toString(),
                entry.getScheduleBlock().getEndTime().toString(),
                entry.getTeacher() != null ? entry.getTeacher().getId() : null,
                entry.getTeacher() != null ? entry.getTeacher().getUser().getFirstName() + " " + entry.getTeacher().getUser().getLastName() : null,
                entry.getSubject() != null ? entry.getSubject().getId() : null,
                entry.getSubject() != null ? entry.getSubject().getName() : null,
                entry.getDidacticUnit(),
                entry.getTopic(),
                entry.getCloseToken(),
                entry.getTeacherSignatureStatus().name(),
                entry.getTeacherClosedAt() != null ? entry.getTeacherClosedAt().toString() : null,
                entry.getSpecificNotes(),
                entry.getGeneralNotes(),
                dailyLogStudentAbsenceRepository.findByDailyLogEntryId(entry.getId()).stream()
                        .map(absence -> new DailyLogAbsenceResponse(
                                absence.getId(),
                                absence.getStudent().getId(),
                                absence.getStudent().getUser().getFirstName() + " " + absence.getStudent().getUser().getLastName(),
                                absence.getStudent().getEnrollmentNumber(),
                                absence.getAbsenceType().name(),
                                absence.getNotes()))
                        .toList(),
                dailyLogStudentIncidentRepository.findByDailyLogEntryId(entry.getId()).stream()
                        .map(incident -> new DailyLogIncidentResponse(
                                incident.getId(),
                                incident.getStudent().getId(),
                                incident.getStudent().getUser().getFirstName() + " " + incident.getStudent().getUser().getLastName(),
                                incident.getStudent().getEnrollmentNumber(),
                                incident.getDemerit() != null ? incident.getDemerit().getId() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getCode() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getCategory() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getDescription() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getScore() : null,
                                incident.getCategory(),
                                incident.getNotes()))
                        .toList());
    }

    private MobileTodayEntryResponse toMobileTodayEntry(DailyLog log, DailyLogEntry entry) {
        return new MobileTodayEntryResponse(
                entry.getId(),
                log.getId(),
                log.getCloseToken(),
                entry.getCloseToken(),
                log.getCourse().getId(),
                log.getCourse().getName() + " " + log.getCourse().getParallel(),
                log.getLogDate().toString(),
                log.getPeriod().getName(),
                entry.getScheduleBlock().getLabel(),
                entry.getScheduleBlock().getStartTime().toString(),
                entry.getScheduleBlock().getEndTime().toString(),
                entry.getSubject() != null ? entry.getSubject().getName() : null,
                entry.getTeacher() != null ? entry.getTeacher().getUser().getFirstName() + " " + entry.getTeacher().getUser().getLastName() : null,
                entry.getDidacticUnit(),
                entry.getTopic(),
                entry.getSpecificNotes(),
                entry.getGeneralNotes(),
                entry.getTeacherSignatureStatus().name(),
                demeritOptions(),
                studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(log.getCourse().getId()).stream()
                        .map(student -> new DailyLogStudentOptionResponse(
                                student.getId(),
                                student.getEnrollmentNumber(),
                                student.getUser().getFirstName() + " " + student.getUser().getLastName()))
                        .toList(),
                dailyLogStudentAbsenceRepository.findByDailyLogEntryId(entry.getId()).stream()
                        .map(absence -> new DailyLogAbsenceResponse(
                                absence.getId(),
                                absence.getStudent().getId(),
                                absence.getStudent().getUser().getFirstName() + " " + absence.getStudent().getUser().getLastName(),
                                absence.getStudent().getEnrollmentNumber(),
                                absence.getAbsenceType().name(),
                                absence.getNotes()))
                        .toList(),
                dailyLogStudentIncidentRepository.findByDailyLogEntryId(entry.getId()).stream()
                        .map(incident -> new DailyLogIncidentResponse(
                                incident.getId(),
                                incident.getStudent().getId(),
                                incident.getStudent().getUser().getFirstName() + " " + incident.getStudent().getUser().getLastName(),
                                incident.getStudent().getEnrollmentNumber(),
                                incident.getDemerit() != null ? incident.getDemerit().getId() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getCode() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getCategory() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getDescription() : null,
                                incident.getDemerit() != null ? incident.getDemerit().getScore() : null,
                                incident.getCategory(),
                                incident.getNotes()))
                        .toList());
    }

    private List<DemeritOptionResponse> demeritOptions() {
        return demeritService.findActiveOptions();
    }

    private void ensureEntryEditable(DailyLogEntry entry) {
        if (entry.getDailyLog().getStatus() != DailyLogStatus.DRAFT) {
            throw new BusinessException("La jornada ya fue cerrada y no admite cambios.");
        }
        if (entry.getTeacherSignatureStatus() == TeacherSignatureStatus.SIGNED) {
            throw new BusinessException("La clase ya fue cerrada por el docente y no admite cambios.");
        }
    }

    private User validateUserCode(MobileCloseRequest request) {
        User user = userRepository.findByUsername(request.username().trim())
                .orElseThrow(() -> new BusinessException("No existe un usuario con ese codigo."));
        if (!user.isEnabled()) {
            throw new BusinessException("El usuario se encuentra inactivo.");
        }
        if (!user.getIdentification().equals(request.code().trim())) {
            throw new BusinessException("El codigo institucional no es valido.");
        }
        return user;
    }

    private void validateSignaturePermission(User user, DailyLogSignatureType signatureType) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toSet());
        boolean allowed = switch (signatureType) {
            case TEACHER_TUTOR -> roles.contains(RoleDefaults.DOCENTE) || roles.contains(RoleDefaults.ADMINISTRADOR);
            case WEEK_STUDENT -> roles.contains(RoleDefaults.ESTUDIANTE) || roles.contains(RoleDefaults.ADMINISTRADOR);
            case GENERAL_INSPECTOR -> roles.contains(RoleDefaults.ADMINISTRATIVO) || roles.contains(RoleDefaults.ADMINISTRADOR);
        };
        if (!allowed) {
            throw new BusinessException("El usuario ingresado no tiene permisos para esta firma.");
        }
    }

    private void validateAssignedSigner(DailyLog log, User user, DailyLogSignatureType signatureType) {
        if (signatureType == DailyLogSignatureType.WEEK_STUDENT) {
            if (log.getCourse().getWeekStudent() == null) {
                throw new BusinessException("El curso no tiene semanero asignado.");
            }
            if (!log.getCourse().getWeekStudent().getUser().getId().equals(user.getId())) {
                throw new BusinessException("El usuario ingresado no corresponde al semanero asignado al curso.");
            }
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private DailyLogAbsenceType parseAbsenceType(String absenceType) {
        try {
            return DailyLogAbsenceType.valueOf(absenceType.trim().toUpperCase());
        } catch (Exception exception) {
            return DailyLogAbsenceType.ABSENT;
        }
    }

    private String defaultIncidentCategory(String category) {
        String normalized = trimToNull(category);
        return normalized == null ? "GENERAL" : normalized;
    }
}
