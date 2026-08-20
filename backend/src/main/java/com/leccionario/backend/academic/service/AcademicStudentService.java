package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.AcademicStudentRequest;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.academic.domain.WeekStudentAssignment;
import com.leccionario.backend.academic.dto.WeekStudentAssignmentResponse;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.academic.repository.WeekStudentAssignmentRepository;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AcademicStudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final WeekStudentAssignmentRepository weekStudentAssignmentRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AcademicStudentResponse> listStudents() {
        return studentRepository.findAll().stream()
                .sorted(Comparator.comparing(student -> student.getCourse().getName()
                        + student.getCourse().getParallel()
                        + student.getEnrollmentNumber()))
                .map(this::toStudentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AcademicStudentResponse getStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado"));
        return toStudentResponse(student);
    }

    @Transactional
    public AcademicStudentResponse createStudent(AcademicStudentRequest request, String username) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));

        validateStudentUniqueness(request, null);

        User user = new User();
        user.setInstitution(institutionRepository.findAll().stream().findFirst().orElse(null));
        String temporaryPassword = java.util.UUID.randomUUID().toString().substring(0, 12) + "A1!";
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        applyStudentUser(user, request);
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setCourse(course);
        student.setEnrollmentNumber(request.enrollmentNumber().trim());
        student.setBirthDate(request.birthDate());
        student.setGender(request.gender() != null ? Student.Gender.valueOf(request.gender().toUpperCase()) : null);
        Student saved = studentRepository.save(student);

        createAssignment(course, saved, LocalDate.now());
        return toStudentResponse(saved);
    }

    @Transactional
    public AcademicStudentResponse updateStudent(Long id, AcademicStudentRequest request, String username) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Estudiante no encontrado"));
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));

        validateStudentUniqueness(request, student);

        User user = student.getUser();
        applyStudentUser(user, request);
        userRepository.save(user);

        student.setEnrollmentNumber(request.enrollmentNumber().trim());
        student.setBirthDate(request.birthDate());
        student.setGender(request.gender() != null ? Student.Gender.valueOf(request.gender().toUpperCase()) : null);

        if (!student.getCourse().getId().equals(course.getId())) {
            WeekStudentAssignment prevAssignment = weekStudentAssignmentRepository.findByCourseIdAndEndDateIsNull(student.getCourse().getId()).orElse(null);
            if (prevAssignment != null) {
                prevAssignment.setEndDate(LocalDate.now());
                weekStudentAssignmentRepository.save(prevAssignment);
            }
            student.setCourse(course);
            createAssignment(course, student, LocalDate.now());
        }

        Student saved = studentRepository.save(student);
        return toStudentResponse(saved);
    }

    @Transactional
    public ImportSummaryResponse importStudents(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 9)) {
                continue;
            }
            total++;
            final int excelRow = rowIndex + 1;
            try {
                String courseName = ExcelSupport.getString(row, 6);
                String parallel = ExcelSupport.getString(row, 7);
                Course course = courseRepository.findByNameIgnoreCaseAndParallelIgnoreCase(courseName, parallel)
                        .orElseThrow(() -> new BusinessException("No existe el curso '" + courseName + " " + parallel + "'"));
                createStudent(new AcademicStudentRequest(
                        ExcelSupport.getString(row, 0),
                        ExcelSupport.getString(row, 1),
                        ExcelSupport.getString(row, 2),
                        ExcelSupport.getString(row, 3),
                        ExcelSupport.getString(row, 4),
                        ExcelSupport.getString(row, 5),
                        course.getId(),
                        ExcelSupport.getBoolean(row, 8, true),
                        ExcelSupport.getDate(row, 9),
                        ExcelSupport.getString(row, 10)), actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }
        return new ImportSummaryResponse(
                "ACADEMIC_STUDENTS",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Estudiantes importados correctamente."
                        : "Importacion completada con observaciones en estudiantes.",
                errors);
    }

    @Transactional(readOnly = true)
    public List<WeekStudentAssignmentResponse> getWeekStudentAssignments(Long courseId) {
        return weekStudentAssignmentRepository.findByCourseIdOrderByStartDateDesc(courseId)
                .stream()
                .map(this::toAssignmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] exportStudentTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("estudiantes");
        ExcelSupport.writeHeaders(sheet, "username", "email", "identification", "firstName", "lastName", "enrollmentNumber", "courseName", "parallel", "enabled", "birthDate", "gender");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("cadete.nuevo");
        sample.createCell(1).setCellValue("cadete.nuevo@leccionario.local");
        sample.createCell(2).setCellValue("0109998887");
        sample.createCell(3).setCellValue("Cadete");
        sample.createCell(4).setCellValue("Nuevo");
        sample.createCell(5).setCellValue("1005");
        sample.createCell(6).setCellValue(courseRepository.findAll().stream().findFirst().map(Course::getName).orElse("Primero BGU"));
        sample.createCell(7).setCellValue(courseRepository.findAll().stream().findFirst().map(Course::getParallel).orElse("A"));
        sample.createCell(8).setCellValue("true");
        sample.createCell(9).setCellValue("2010-05-15");
        sample.createCell(10).setCellValue("M");

        Sheet catalog = workbook.createSheet("catalogos");
        ExcelSupport.writeHeaders(catalog, "courseName", "parallel", "level", "section", "subLevel", "grade", "gender_values");
        var courses = courseRepository.findAll();
        for (int index = 0; index < courses.size(); index++) {
            var row = catalog.createRow(index + 1);
            row.createCell(0).setCellValue(courses.get(index).getName());
            row.createCell(1).setCellValue(courses.get(index).getParallel());
            row.createCell(2).setCellValue(courses.get(index).getLevel());
            row.createCell(3).setCellValue(courses.get(index).getSection() != null ? courses.get(index).getSection().name() : "");
            row.createCell(4).setCellValue(courses.get(index).getSubLevel() != null ? courses.get(index).getSubLevel().name() : "");
            if (courses.get(index).getGrade() != null) {
                row.createCell(5).setCellValue(courses.get(index).getGrade());
            }
        }
        var genderRow = catalog.createRow(1);
        genderRow.createCell(6).setCellValue("M = Masculino");
        var genderRow2 = catalog.createRow(2);
        genderRow2.createCell(6).setCellValue("F = Femenino");
        var genderRow3 = catalog.createRow(3);
        genderRow3.createCell(6).setCellValue("OTRO = Otro");

        ExcelSupport.autoSize(sheet, 11);
        ExcelSupport.autoSize(catalog, 7);
        return ExcelSupport.toBytes(workbook);
    }

    private void applyStudentUser(User user, AcademicStudentRequest request) {
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setIdentification(request.identification().trim());
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEnabled(request.enabled());
    }

    private void validateStudentUniqueness(AcademicStudentRequest request, Student currentStudent) {
        Long currentUserId = currentStudent == null ? null : currentStudent.getUser().getId();
        Long currentStudentId = currentStudent == null ? null : currentStudent.getId();

        boolean duplicatedUsername = currentUserId == null
                ? userRepository.existsByUsernameIgnoreCase(request.username().trim())
                : userRepository.existsByUsernameIgnoreCaseAndIdNot(request.username().trim(), currentUserId);
        if (duplicatedUsername) {
            throw new BusinessException("Ya existe un usuario con ese nombre de acceso.");
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        boolean duplicatedEmail = currentUserId == null
                ? userRepository.existsByEmailIgnoreCase(normalizedEmail)
                : userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, currentUserId);
        if (duplicatedEmail) {
            throw new BusinessException("Ya existe un usuario con ese correo institucional.");
        }

        boolean duplicatedEnrollment = currentStudentId == null
                ? studentRepository.existsByEnrollmentNumberIgnoreCaseAndCourseId(request.enrollmentNumber().trim(), request.courseId())
                : studentRepository.existsByEnrollmentNumberIgnoreCaseAndCourseIdAndIdNot(
                        request.enrollmentNumber().trim(),
                        request.courseId(),
                        currentStudentId);
        if (duplicatedEnrollment) {
            throw new BusinessException("Ese numero de matricula ya esta registrado en el curso seleccionado.");
        }
    }

    private void createAssignment(Course course, Student student, LocalDate startDate) {
        WeekStudentAssignment assignment = new WeekStudentAssignment();
        assignment.setCourse(course);
        assignment.setStudent(student);
        assignment.setStartDate(startDate);
        weekStudentAssignmentRepository.save(assignment);
    }

    private WeekStudentAssignmentResponse toAssignmentResponse(WeekStudentAssignment assignment) {
        Student student = assignment.getStudent();
        String studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();
        return new WeekStudentAssignmentResponse(
                assignment.getId(),
                assignment.getCourse().getId(),
                student.getId(),
                studentName,
                student.getEnrollmentNumber(),
                assignment.getStartDate(),
                assignment.getEndDate());
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
}
