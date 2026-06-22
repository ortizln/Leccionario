package com.leccionario.backend.schedule.service;

import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicPeriodResponse;
import com.leccionario.backend.academic.dto.AcademicSubjectResponse;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.schedule.domain.ScheduleBlock;
import com.leccionario.backend.schedule.domain.Weekday;
import com.leccionario.backend.schedule.dto.CourseScheduleRequest;
import com.leccionario.backend.schedule.dto.CourseScheduleResponse;
import com.leccionario.backend.schedule.dto.ScheduleBlockRequest;
import com.leccionario.backend.schedule.dto.ScheduleBlockResponse;
import com.leccionario.backend.schedule.dto.ScheduleOverviewResponse;
import com.leccionario.backend.schedule.dto.ScheduleTeacherOptionResponse;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.schedule.repository.ScheduleBlockRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleBlockRepository scheduleBlockRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final CourseRepository courseRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public ScheduleOverviewResponse getOverview() {
        return new ScheduleOverviewResponse(
                scheduleBlockRepository.findAll().stream()
                        .sorted(Comparator.comparingInt(ScheduleBlock::getBlockOrder))
                        .map(this::toBlockResponse)
                        .toList(),
                courseScheduleRepository.findAll().stream()
                        .sorted(Comparator.comparingInt(CourseSchedule::getWeekday)
                                .thenComparing(schedule -> schedule.getCourse().getName() + schedule.getCourse().getParallel())
                                .thenComparing(schedule -> schedule.getScheduleBlock().getBlockOrder()))
                        .map(this::toCourseScheduleResponse)
                        .toList(),
                courseRepository.findAll().stream()
                        .sorted(Comparator.comparing(course -> course.getName() + course.getParallel()))
                        .map(course -> new AcademicCourseResponse(
                                course.getId(),
                                course.getName(),
                                course.getParallel(),
                                course.getLevel(),
                                course.getSection() != null ? course.getSection().name() : null,
                                course.getSubLevel() != null ? course.getSubLevel().name() : null,
                                course.getGrade(),
                                null,
                                null))
                        .toList(),
                academicPeriodRepository.findAll().stream()
                        .sorted(Comparator.comparing(period -> period.getStartDate().toString()))
                        .map(period -> new AcademicPeriodResponse(
                                period.getId(),
                                period.getName(),
                                period.getStartDate(),
                                period.getEndDate(),
                                period.isActive()))
                        .toList(),
                subjectRepository.findAll().stream()
                        .sorted(Comparator.comparing(subject -> subject.getName() + subject.getCode()))
                        .map(subject -> new AcademicSubjectResponse(
                                subject.getId(),
                                subject.getName(),
                                subject.getCode(),
                                subject.getCurriculumArea()))
                        .toList(),
                teacherRepository.findAll().stream()
                        .sorted(Comparator.comparing(teacher -> teacher.getUser().getLastName() + teacher.getUser().getFirstName()))
                        .map(teacher -> {
                            List<Long> subjectIds = courseScheduleRepository.findByTeacherIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(teacher.getId())
                                    .stream()
                                    .map(s -> s.getSubject().getId())
                                    .distinct()
                                    .toList();
                            return new ScheduleTeacherOptionResponse(
                                    teacher.getId(),
                                    teacher.getUser().getFirstName() + " " + teacher.getUser().getLastName(),
                                    teacher.getSpecialization(),
                                    subjectIds);
                        })
                        .toList());
    }

    @Transactional(readOnly = true)
    public List<CourseScheduleResponse> getCourseSchedules(Long courseId) {
        return courseScheduleRepository.findByCourseIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(courseId)
                .stream()
                .map(this::toCourseScheduleResponse)
                .toList();
    }

    @Transactional
    public ScheduleBlockResponse createBlock(ScheduleBlockRequest request, String actor) {
        validateBlock(request);
        ScheduleBlock block = new ScheduleBlock();
        applyBlock(block, request);
        ScheduleBlock saved = scheduleBlockRepository.save(block);
        auditService.log(actor, "CREATE", "SCHEDULE", "Bloque horario creado: " + saved.getLabel());
        return toBlockResponse(saved);
    }

    @Transactional
    public ScheduleBlockResponse updateBlock(Long id, ScheduleBlockRequest request, String actor) {
        validateBlock(request);
        ScheduleBlock block = scheduleBlockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bloque horario no encontrado"));
        applyBlock(block, request);
        ScheduleBlock saved = scheduleBlockRepository.save(block);
        auditService.log(actor, "UPDATE", "SCHEDULE", "Bloque horario actualizado: " + saved.getLabel());
        return toBlockResponse(saved);
    }

    @Transactional
    public CourseScheduleResponse createSchedule(CourseScheduleRequest request, String actor) {
        validateWeekday(request.weekday());
        validateScheduleAssignment(request, null);
        CourseSchedule schedule = new CourseSchedule();
        applySchedule(schedule, request);
        CourseSchedule saved = courseScheduleRepository.save(schedule);
        auditService.log(actor, "CREATE", "SCHEDULE", "Horario creado para curso: " + saved.getCourse().getName());
        return toCourseScheduleResponse(saved);
    }

    @Transactional
    public CourseScheduleResponse updateSchedule(Long id, CourseScheduleRequest request, String actor) {
        validateWeekday(request.weekday());
        validateScheduleAssignment(request, id);
        CourseSchedule schedule = courseScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horario no encontrado"));
        applySchedule(schedule, request);
        CourseSchedule saved = courseScheduleRepository.save(schedule);
        auditService.log(actor, "UPDATE", "SCHEDULE", "Horario actualizado para curso: " + saved.getCourse().getName());
        return toCourseScheduleResponse(saved);
    }

    @Transactional
    public void deleteSchedule(Long id, String actor) {
        CourseSchedule schedule = courseScheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Horario no encontrado"));
        courseScheduleRepository.delete(schedule);
        auditService.log(actor, "DELETE", "SCHEDULE", "Horario eliminado: " + schedule.getCourse().getName());
    }

    @Transactional(readOnly = true)
    public byte[] exportBlockTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("bloques");
        ExcelSupport.writeHeaders(sheet, "label", "startTime", "endTime", "blockOrder", "blockType", "active");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("07H00-07H40");
        sample.createCell(1).setCellValue("07:00");
        sample.createCell(2).setCellValue("07:40");
        sample.createCell(3).setCellValue("1");
        sample.createCell(4).setCellValue("CLASS");
        sample.createCell(5).setCellValue("true");
        ExcelSupport.autoSize(sheet, 6);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional(readOnly = true)
    public byte[] exportAssignmentTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("asignaciones");
        ExcelSupport.writeHeaders(sheet, "courseName", "parallel", "periodName", "blockLabel", "subjectCode", "teacherUsername", "weekday", "classroom");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue(courseRepository.findAll().stream().findFirst().map(course -> course.getName()).orElse("Primero BGU"));
        sample.createCell(1).setCellValue(courseRepository.findAll().stream().findFirst().map(course -> course.getParallel()).orElse("A"));
        sample.createCell(2).setCellValue(academicPeriodRepository.findAll().stream().findFirst().map(period -> period.getName()).orElse("Periodo Lectivo 2026"));
        sample.createCell(3).setCellValue(scheduleBlockRepository.findAll().stream().findFirst().map(ScheduleBlock::getLabel).orElse("07H00-07H40"));
        sample.createCell(4).setCellValue(subjectRepository.findAll().stream().findFirst().map(subject -> subject.getCode()).orElse("MAT-01"));
        sample.createCell(5).setCellValue(teacherRepository.findAll().stream().findFirst().map(teacher -> teacher.getUser().getUsername()).orElse("docente.demo"));
        sample.createCell(6).setCellValue("1");
        sample.createCell(7).setCellValue("Aula 1");

        Sheet catalog = workbook.createSheet("catalogos");
        ExcelSupport.writeHeaders(catalog, "courseName", "parallel", "periodName", "blockLabel", "subjectCode", "teacherUsername");
        int max = java.util.Collections.max(java.util.List.of(
                courseRepository.findAll().size(),
                academicPeriodRepository.findAll().size(),
                scheduleBlockRepository.findAll().size(),
                subjectRepository.findAll().size(),
                teacherRepository.findAll().size()));
        for (int index = 0; index < max; index++) {
            var row = catalog.createRow(index + 1);
            if (index < courseRepository.findAll().size()) {
                row.createCell(0).setCellValue(courseRepository.findAll().get(index).getName());
                row.createCell(1).setCellValue(courseRepository.findAll().get(index).getParallel());
            }
            if (index < academicPeriodRepository.findAll().size()) {
                row.createCell(2).setCellValue(academicPeriodRepository.findAll().get(index).getName());
            }
            if (index < scheduleBlockRepository.findAll().size()) {
                row.createCell(3).setCellValue(scheduleBlockRepository.findAll().get(index).getLabel());
            }
            if (index < subjectRepository.findAll().size()) {
                row.createCell(4).setCellValue(subjectRepository.findAll().get(index).getCode());
            }
            if (index < teacherRepository.findAll().size()) {
                row.createCell(5).setCellValue(teacherRepository.findAll().get(index).getUser().getUsername());
            }
        }

        ExcelSupport.autoSize(sheet, 8);
        ExcelSupport.autoSize(catalog, 6);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional
    public ImportSummaryResponse importBlocks(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 6)) {
                continue;
            }
            total++;
            int excelRow = rowIndex + 1;
            try {
                createBlock(new ScheduleBlockRequest(
                        ExcelSupport.getString(row, 0),
                        ExcelSupport.getTime(row, 1),
                        ExcelSupport.getTime(row, 2),
                        ExcelSupport.getInt(row, 3, 1),
                        parseBlockType(ExcelSupport.getString(row, 4)),
                        ExcelSupport.getBoolean(row, 5, true)), actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }
        return new ImportSummaryResponse(
                "SCHEDULE_BLOCKS",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Bloques horarios importados correctamente."
                        : "Importacion completada con observaciones en bloques horarios.",
                errors);
    }

    @Transactional
    public ImportSummaryResponse importAssignments(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 8)) {
                continue;
            }
            total++;
            int excelRow = rowIndex + 1;
            try {
                String courseName = ExcelSupport.getString(row, 0);
                String parallel = ExcelSupport.getString(row, 1);
                String periodName = ExcelSupport.getString(row, 2);
                String blockLabel = ExcelSupport.getString(row, 3);
                String subjectCode = ExcelSupport.getString(row, 4);
                String teacherUsername = ExcelSupport.getString(row, 5);

                var course = courseRepository.findByNameIgnoreCaseAndParallelIgnoreCase(courseName, parallel)
                        .orElseThrow(() -> new BusinessException("Curso no encontrado"));
                var period = academicPeriodRepository.findByNameIgnoreCase(periodName)
                        .orElseThrow(() -> new BusinessException("Periodo no encontrado"));
                var block = scheduleBlockRepository.findByLabel(blockLabel)
                        .orElseThrow(() -> new BusinessException("Bloque no encontrado"));
                var subject = subjectRepository.findByCodeIgnoreCase(subjectCode)
                        .orElseThrow(() -> new BusinessException("Materia no encontrada"));
                var teacher = teacherRepository.findByUser_UsernameIgnoreCase(teacherUsername)
                        .orElseThrow(() -> new BusinessException("Docente no encontrado"));

                createSchedule(new CourseScheduleRequest(
                        course.getId(),
                        period.getId(),
                        block.getId(),
                        subject.getId(),
                        teacher.getId(),
                        ExcelSupport.getShort(row, 6, (short) 1),
                        ExcelSupport.getString(row, 7)), actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }
        return new ImportSummaryResponse(
                "SCHEDULE_ASSIGNMENTS",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Asignaciones de horario importadas correctamente."
                        : "Importacion completada con observaciones en asignaciones.",
                errors);
    }

    private void validateBlock(ScheduleBlockRequest request) {
        if (!request.startTime().isBefore(request.endTime())) {
            throw new BusinessException("La hora de inicio debe ser menor que la hora de fin");
        }
    }

    private com.leccionario.backend.schedule.domain.ScheduleBlockType parseBlockType(String value) {
        return com.leccionario.backend.schedule.domain.ScheduleBlockType.valueOf(value.trim().toUpperCase());
    }

    private void validateWeekday(short weekday) {
        if (weekday < 1 || weekday > 7) {
            throw new BusinessException("El dia de la semana debe estar entre 1 y 7");
        }
    }

    private void validateScheduleAssignment(CourseScheduleRequest request, Long currentScheduleId) {
        boolean courseConflict = currentScheduleId == null
                ? courseScheduleRepository.existsByCourseIdAndPeriodIdAndScheduleBlockIdAndWeekday(
                        request.courseId(),
                        request.periodId(),
                        request.scheduleBlockId(),
                        request.weekday())
                : courseScheduleRepository.existsByCourseIdAndPeriodIdAndScheduleBlockIdAndWeekdayAndIdNot(
                        request.courseId(),
                        request.periodId(),
                        request.scheduleBlockId(),
                        request.weekday(),
                        currentScheduleId);
        if (courseConflict) {
            throw new BusinessException("El curso ya tiene una asignacion registrada para ese bloque, dia y periodo.");
        }

        boolean teacherConflict = currentScheduleId == null
                ? courseScheduleRepository.existsByTeacherIdAndPeriodIdAndScheduleBlockIdAndWeekday(
                        request.teacherId(),
                        request.periodId(),
                        request.scheduleBlockId(),
                        request.weekday())
                : courseScheduleRepository.existsByTeacherIdAndPeriodIdAndScheduleBlockIdAndWeekdayAndIdNot(
                        request.teacherId(),
                        request.periodId(),
                        request.scheduleBlockId(),
                        request.weekday(),
                        currentScheduleId);
        if (teacherConflict) {
            String blockLabel = scheduleBlockRepository.findById(request.scheduleBlockId())
                    .map(ScheduleBlock::getLabel)
                    .orElse("bloque seleccionado");
            throw new BusinessException("El docente ya tiene horario asignado el " + Weekday.label(request.weekday())
                    + " en el bloque " + blockLabel + " para ese periodo.");
        }

        boolean sameSubjectDifferentTeacher = currentScheduleId == null
                ? courseScheduleRepository.existsByCourseIdAndPeriodIdAndSubjectIdAndTeacherIdNot(
                        request.courseId(),
                        request.periodId(),
                        request.subjectId(),
                        request.teacherId())
                : courseScheduleRepository.existsByCourseIdAndPeriodIdAndSubjectIdAndTeacherIdNotAndIdNot(
                        request.courseId(),
                        request.periodId(),
                        request.subjectId(),
                        request.teacherId(),
                        currentScheduleId);
        if (sameSubjectDifferentTeacher) {
            String subjectName = subjectRepository.findById(request.subjectId())
                    .map(subject -> subject.getName())
                    .orElse("materia seleccionada");
            throw new BusinessException("El curso ya tiene un docente asignado para la materia " + subjectName
                    + ". No puede asignar dos docentes distintos a la misma materia en el mismo curso.");
        }
    }

    private void applyBlock(ScheduleBlock block, ScheduleBlockRequest request) {
        block.setLabel(request.label().trim());
        block.setStartTime(request.startTime());
        block.setEndTime(request.endTime());
        block.setBlockOrder(request.blockOrder());
        block.setBlockType(request.blockType());
        block.setActive(request.active());
    }

    private void applySchedule(CourseSchedule schedule, CourseScheduleRequest request) {
        schedule.setCourse(courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado")));
        schedule.setPeriod(academicPeriodRepository.findById(request.periodId())
                .orElseThrow(() -> new ResourceNotFoundException("Periodo no encontrado")));
        schedule.setScheduleBlock(scheduleBlockRepository.findById(request.scheduleBlockId())
                .orElseThrow(() -> new ResourceNotFoundException("Bloque horario no encontrado")));
        schedule.setSubject(subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Materia no encontrada")));
        schedule.setTeacher(teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Docente no encontrado")));
        schedule.setWeekday(request.weekday());
        schedule.setClassroom(request.classroom() == null ? null : request.classroom().trim());
    }

    private ScheduleBlockResponse toBlockResponse(ScheduleBlock block) {
        return new ScheduleBlockResponse(
                block.getId(),
                block.getLabel(),
                block.getStartTime(),
                block.getEndTime(),
                block.getBlockOrder(),
                block.getBlockType(),
                block.isActive());
    }

    private CourseScheduleResponse toCourseScheduleResponse(CourseSchedule schedule) {
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
