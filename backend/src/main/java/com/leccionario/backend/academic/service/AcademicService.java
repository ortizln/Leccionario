package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.CourseSection;
import com.leccionario.backend.academic.domain.CourseSubLevel;
import com.leccionario.backend.academic.domain.Subject;
import com.leccionario.backend.academic.dto.AcademicCourseRequest;
import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicOverviewResponse;
import com.leccionario.backend.academic.dto.AcademicPeriodResponse;
import com.leccionario.backend.academic.dto.AcademicStudentRequest;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.academic.dto.AcademicSubjectResponse;
import com.leccionario.backend.academic.dto.AcademicSubjectRequest;
import com.leccionario.backend.academic.dto.AcademicTeacherRequest;
import com.leccionario.backend.academic.dto.AcademicTeacherResponse;
import com.leccionario.backend.academic.dto.RepresentativeRequest;
import com.leccionario.backend.academic.dto.RepresentativeResponse;
import com.leccionario.backend.academic.dto.WeekStudentAssignmentResponse;
import com.leccionario.backend.academic.domain.WeekStudentAssignment;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.academic.repository.WeekStudentAssignmentRepository;
import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.user.domain.Representative;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.RepresentativeRepository;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AcademicService {

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TeacherRepository teacherRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final InstitutionRepository institutionRepository;
    private final AuditService auditService;
    private final PasswordEncoder passwordEncoder;
    private final RepresentativeRepository representativeRepository;
    private final WeekStudentAssignmentRepository weekStudentAssignmentRepository;

    @Transactional(readOnly = true)
    public AcademicOverviewResponse getOverview() {
        return new AcademicOverviewResponse(
                courseResponses(),
                subjectRepository.findAll().stream()
                        .sorted(Comparator.comparing(subject -> subject.getName() + subject.getCode()))
                        .map(subject -> new AcademicSubjectResponse(
                                subject.getId(),
                                subject.getName(),
                                subject.getCode(),
                                subject.getCurriculumArea()))
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
                studentResponses(),
                teacherResponses());
    }

    @Transactional
    public AcademicCourseResponse createCourse(AcademicCourseRequest request, String username) {
        Course course = new Course();
        applyCourse(course, request);
        Course saved = courseRepository.save(course);
        if (saved.getWeekStudent() != null) {
            createAssignment(saved, saved.getWeekStudent(), java.time.LocalDate.now());
        }
        auditService.log(username, "CREATE_COURSE", "ACADEMIC", saved.getName() + " " + saved.getParallel());
        return toCourseResponse(saved);
    }

    @Transactional
    public AcademicCourseResponse updateCourse(Long id, AcademicCourseRequest request, String username) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));
        Long previousWeekStudentId = course.getWeekStudent() != null ? course.getWeekStudent().getId() : null;
        applyCourse(course, request);
        Course saved = courseRepository.save(course);
        Long newWeekStudentId = saved.getWeekStudent() != null ? saved.getWeekStudent().getId() : null;
        if (!java.util.Objects.equals(previousWeekStudentId, newWeekStudentId)) {
            java.time.LocalDate today = java.time.LocalDate.now();
            weekStudentAssignmentRepository.findByCourseIdAndEndDateIsNull(saved.getId())
                    .ifPresent(active -> {
                        active.setEndDate(today);
                        weekStudentAssignmentRepository.save(active);
                    });
            if (saved.getWeekStudent() != null) {
                createAssignment(saved, saved.getWeekStudent(), today);
            }
        }
        auditService.log(username, "UPDATE_COURSE", "ACADEMIC", saved.getName() + " " + saved.getParallel());
        return toCourseResponse(saved);
    }

    @Transactional
    public AcademicStudentResponse createStudent(AcademicStudentRequest request, String username) {
        validateStudentUniqueness(request, null);

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));
        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("No existe una institucion configurada para registrar estudiantes."));

        User user = new User();
        user.setInstitution(institution);
        user.setPassword(passwordEncoder.encode("Cadete123*"));
        user.setRoles(Set.of(roleRepository.findByName(RoleDefaults.ESTUDIANTE)
                .orElseThrow(() -> new BusinessException("No existe el perfil de estudiante configurado."))));
        applyStudentUser(user, request);
        User savedUser = userRepository.save(user);

        Student student = new Student();
        student.setUser(savedUser);
        student.setCourse(course);
        student.setEnrollmentNumber(request.enrollmentNumber().trim());
        student.setBirthDate(request.birthDate());
        if (request.gender() != null) {
            student.setGender(Student.Gender.valueOf(request.gender()));
        }
        Student savedStudent = studentRepository.save(student);

        auditService.log(username, "CREATE_STUDENT", "ACADEMIC", savedUser.getUsername() + " -> " + course.getName() + " " + course.getParallel());
        return toStudentResponse(savedStudent);
    }

    @Transactional
    public AcademicStudentResponse updateStudent(Long id, AcademicStudentRequest request, String username) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El estudiante seleccionado no existe."));
        validateStudentUniqueness(request, student);
        Course previousCourse = student.getCourse();

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));

        applyStudentUser(student.getUser(), request);
        userRepository.save(student.getUser());

        student.setCourse(course);
        student.setEnrollmentNumber(request.enrollmentNumber().trim());
        student.setBirthDate(request.birthDate());
        if (request.gender() != null) {
            student.setGender(Student.Gender.valueOf(request.gender()));
        } else {
            student.setGender(null);
        }
        Student savedStudent = studentRepository.save(student);

        if (!previousCourse.getId().equals(course.getId())
                && previousCourse.getWeekStudent() != null
                && previousCourse.getWeekStudent().getId().equals(savedStudent.getId())) {
            previousCourse.setWeekStudent(null);
            courseRepository.save(previousCourse);
            weekStudentAssignmentRepository.findByCourseIdAndEndDateIsNull(previousCourse.getId())
                    .ifPresent(active -> {
                        active.setEndDate(java.time.LocalDate.now());
                        weekStudentAssignmentRepository.save(active);
                    });
        }

        auditService.log(username, "UPDATE_STUDENT", "ACADEMIC", savedStudent.getUser().getUsername() + " -> " + course.getName() + " " + course.getParallel());
        return toStudentResponse(savedStudent);
    }

    @Transactional
    public AcademicTeacherResponse createTeacher(AcademicTeacherRequest request, String username) {
        Teacher teacher = createTeacher(
                request.username(),
                request.email(),
                request.identification(),
                request.firstName(),
                request.lastName(),
                request.specialization(),
                request.enabled(),
                request.subjects(),
                request.courses(),
                username);
        return toTeacherResponse(teacher, java.util.List.of());
    }

    @Transactional(readOnly = true)
    public AcademicTeacherResponse getTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Docente no encontrado"));
        return toTeacherResponse(teacher,
                courseScheduleRepository.findByTeacherIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(id));
    }

    @Transactional
    public AcademicTeacherResponse updateTeacher(Long id, AcademicTeacherRequest request, String username) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El docente seleccionado no existe."));

        User user = teacher.getUser();
        if (!user.getUsername().equalsIgnoreCase(request.username().trim())
                && userRepository.existsByUsernameIgnoreCase(request.username().trim())) {
            throw new BusinessException("Ya existe un usuario con ese nombre de acceso.");
        }
        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("Ya existe un usuario con ese correo institucional.");
        }
        if (!user.getIdentification().equals(request.identification().trim())
                && userRepository.existsByIdentification(request.identification().trim())) {
            throw new BusinessException("Ya existe un usuario con esa identificacion institucional.");
        }

        user.setUsername(request.username().trim());
        user.setEmail(normalizedEmail);
        user.setIdentification(request.identification().trim());
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEnabled(request.enabled());
        userRepository.save(user);

        teacher.setSpecialization(request.specialization().trim());
        if (request.subjects() != null) {
            teacher.setSubjects(new java.util.ArrayList<>(request.subjects().stream().map(String::trim).toList()));
        }
        if (request.courses() != null) {
            teacher.setCourses(new java.util.ArrayList<>(request.courses().stream().map(String::trim).toList()));
        }
        Teacher saved = teacherRepository.save(teacher);

        auditService.log(username, "UPDATE_TEACHER", "ACADEMIC", saved.getUser().getUsername());
        return toTeacherResponse(saved, courseScheduleRepository.findByTeacherIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                saved.getId()));
    }

    @Transactional
    public AcademicSubjectResponse createSubject(AcademicSubjectRequest request, String username) {
        com.leccionario.backend.academic.domain.Subject subject = new com.leccionario.backend.academic.domain.Subject();
        subject.setName(request.name().trim());
        subject.setCode(request.code().trim().toUpperCase());
        subject.setCurriculumArea(request.curriculumArea() != null ? request.curriculumArea().trim() : null);
        com.leccionario.backend.academic.domain.Subject saved = subjectRepository.save(subject);
        auditService.log(username, "CREATE_SUBJECT", "ACADEMIC", saved.getName() + " (" + saved.getCode() + ")");
        return toSubjectResponse(saved);
    }

    @Transactional
    public AcademicSubjectResponse updateSubject(Long id, AcademicSubjectRequest request, String username) {
        com.leccionario.backend.academic.domain.Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException("La materia seleccionada no existe."));
        if (!subject.getCode().equalsIgnoreCase(request.code().trim())
                && subjectRepository.findByCodeIgnoreCase(request.code().trim()).isPresent()) {
            throw new BusinessException("Ya existe una materia con ese codigo.");
        }
        subject.setName(request.name().trim());
        subject.setCode(request.code().trim().toUpperCase());
        subject.setCurriculumArea(request.curriculumArea() != null ? request.curriculumArea().trim() : null);
        com.leccionario.backend.academic.domain.Subject saved = subjectRepository.save(subject);
        auditService.log(username, "UPDATE_SUBJECT", "ACADEMIC", saved.getName() + " (" + saved.getCode() + ")");
        return toSubjectResponse(saved);
    }

    @Transactional(readOnly = true)
    public byte[] exportCourseTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("cursos");
        ExcelSupport.writeHeaders(sheet, "name", "parallel", "level", "section", "subLevel", "grade", "weekStudentEnrollment");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("Primero BGU");
        sample.createCell(1).setCellValue("A");
        sample.createCell(2).setCellValue("Bachillerato");
        sample.createCell(3).setCellValue("BACHILLERATO");
        sample.createCell(4).setCellValue("BGU");
        sample.createCell(5).setCellValue(1);
        sample.createCell(6).setCellValue("1001");
        ExcelSupport.autoSize(sheet, 7);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional(readOnly = true)
    public byte[] exportStudentTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("estudiantes");
        ExcelSupport.writeHeaders(sheet, "username", "email", "identification", "firstName", "lastName", "enrollmentNumber", "courseName", "parallel", "enabled");
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

        Sheet catalog = workbook.createSheet("catalogos");
        ExcelSupport.writeHeaders(catalog, "courseName", "parallel", "level", "section", "subLevel", "grade");
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

        ExcelSupport.autoSize(sheet, 9);
        ExcelSupport.autoSize(catalog, 3);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional(readOnly = true)
    public byte[] exportTeacherTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("docentes");
        ExcelSupport.writeHeaders(sheet, "username", "email", "identification", "firstName", "lastName", "specialization", "enabled");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("docente.nuevo");
        sample.createCell(1).setCellValue("docente.nuevo@leccionario.local");
        sample.createCell(2).setCellValue("0101112223");
        sample.createCell(3).setCellValue("Docente");
        sample.createCell(4).setCellValue("Nuevo");
        sample.createCell(5).setCellValue("Matematica");
        sample.createCell(6).setCellValue("true");

        Sheet catalog = workbook.createSheet("catalogos");
        ExcelSupport.writeHeaders(catalog, "roles_docente", "especialidades_referenciales");
        var row = catalog.createRow(1);
        row.createCell(0).setCellValue(RoleDefaults.DOCENTE);
        row.createCell(1).setCellValue("Matematica");
        var row2 = catalog.createRow(2);
        row2.createCell(1).setCellValue("Lengua y Literatura");
        var row3 = catalog.createRow(3);
        row3.createCell(1).setCellValue("Ciencias Naturales");

        ExcelSupport.autoSize(sheet, 7);
        ExcelSupport.autoSize(catalog, 2);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional
    public ImportSummaryResponse importCourses(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 4)) {
                continue;
            }
            total++;
            int excelRow = rowIndex + 1;
            try {
                createCourse(new AcademicCourseRequest(
                        ExcelSupport.getString(row, 0),
                        ExcelSupport.getString(row, 1),
                        ExcelSupport.getString(row, 2),
                        null,
                        null,
                        null,
                        resolveWeekStudentId(
                                ExcelSupport.getString(row, 0),
                                ExcelSupport.getString(row, 1),
                                ExcelSupport.getString(row, 3))),
                        actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }
        return new ImportSummaryResponse(
                "ACADEMIC_COURSES",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Cursos importados correctamente."
                        : "Importacion completada con observaciones en cursos.",
                errors);
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
                        null,
                        null), actor);
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

    @Transactional
    public ImportSummaryResponse importTeachers(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        java.util.List<String> errors = new java.util.ArrayList<>();
        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 7)) {
                continue;
            }
            total++;
            int excelRow = rowIndex + 1;
            try {
                createTeacher(
                        ExcelSupport.getString(row, 0),
                        ExcelSupport.getString(row, 1),
                        ExcelSupport.getString(row, 2),
                        ExcelSupport.getString(row, 3),
                        ExcelSupport.getString(row, 4),
                        ExcelSupport.getString(row, 5),
                        ExcelSupport.getBoolean(row, 6, true),
                        java.util.List.of(),
                        java.util.List.of(),
                        actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }
        return new ImportSummaryResponse(
                "ACADEMIC_TEACHERS",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Docentes importados correctamente."
                        : "Importacion completada con observaciones en docentes.",
                errors);
    }

    private void applyCourse(Course course, AcademicCourseRequest request) {
        course.setName(request.name().trim());
        course.setParallel(request.parallel().trim().toUpperCase());
        course.setLevel(request.level().trim());
        if (request.section() != null) {
            course.setSection(CourseSection.valueOf(request.section().toUpperCase()));
        }
        if (request.subLevel() != null) {
            course.setSubLevel(CourseSubLevel.valueOf(request.subLevel().toUpperCase()));
        }
        if (request.grade() != null) {
            course.setGrade(request.grade());
        }
        course.setWeekStudent(resolveWeekStudent(request.weekStudentId(), course));
    }

    private Teacher createTeacher(
            String username,
            String email,
            String identification,
            String firstName,
            String lastName,
            String specialization,
            boolean enabled,
            java.util.List<String> subjects,
            java.util.List<String> courses,
            String actor) {

        User existingUser = userRepository.findByUsernameIgnoreCase(username.trim()).orElse(null);
        if (existingUser == null) {
            existingUser = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).orElse(null);
        }
        if (existingUser == null) {
            existingUser = userRepository.findByIdentification(identification.trim()).orElse(null);
        }

        Institution institution = institutionRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BusinessException("No existe una institucion configurada para registrar docentes."));

        Role teacherRole = roleRepository.findByName(RoleDefaults.DOCENTE)
                .orElseThrow(() -> new BusinessException("No existe el perfil de docente configurado."));

        User user;
        if (existingUser != null) {
            existingUser.setUsername(username.trim());
            existingUser.setEmail(email.trim().toLowerCase());
            existingUser.setIdentification(identification.trim());
            existingUser.setFirstName(firstName.trim());
            existingUser.setLastName(lastName.trim());
            existingUser.setEnabled(enabled);
            if (!existingUser.getRoles().contains(teacherRole)) {
                existingUser.getRoles().add(teacherRole);
            }
            user = userRepository.save(existingUser);
        } else {
            user = new User();
            user.setInstitution(institution);
            user.setPassword(passwordEncoder.encode("Docente123*"));
            user.setRoles(Set.of(teacherRole));
            user.setUsername(username.trim());
            user.setEmail(email.trim().toLowerCase());
            user.setIdentification(identification.trim());
            user.setFirstName(firstName.trim());
            user.setLastName(lastName.trim());
            user.setEnabled(enabled);
            user = userRepository.save(user);
        }

        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setSpecialization(specialization.trim());
        if (subjects != null) {
            teacher.setSubjects(new java.util.ArrayList<>(subjects.stream().map(String::trim).toList()));
        }
        if (courses != null) {
            teacher.setCourses(new java.util.ArrayList<>(courses.stream().map(String::trim).toList()));
        }
        Teacher savedTeacher = teacherRepository.save(teacher);

        auditService.log(actor, "CREATE_TEACHER", "ACADEMIC", user.getUsername() + " -> " + specialization.trim());
        return savedTeacher;
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

    private void validateTeacherUniqueness(String username, String email, String identification) {
        if (userRepository.existsByUsernameIgnoreCase(username.trim())) {
            throw new BusinessException("Ya existe un usuario con ese nombre de acceso.");
        }

        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BusinessException("Ya existe un usuario con ese correo institucional.");
        }

        if (userRepository.existsByIdentification(identification.trim())) {
            throw new BusinessException("Ya existe un usuario con esa identificacion institucional.");
        }
    }

    private java.util.List<AcademicCourseResponse> courseResponses() {
        return courseRepository.findAll().stream()
                .sorted(Comparator.comparing(course -> course.getName() + course.getParallel()))
                .map(this::toCourseResponse)
                .toList();
    }

    private java.util.List<AcademicStudentResponse> studentResponses() {
        return studentRepository.findAll().stream()
                .sorted(Comparator.comparing(student -> student.getCourse().getName()
                        + student.getCourse().getParallel()
                        + student.getEnrollmentNumber()))
                .map(this::toStudentResponse)
                .toList();
    }

    private java.util.List<AcademicTeacherResponse> teacherResponses() {
        var schedulesByTeacher = courseScheduleRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(schedule -> schedule.getTeacher().getId()));

        return teacherRepository.findAll().stream()
                .sorted(Comparator.comparing(teacher -> teacher.getUser().getLastName() + teacher.getUser().getFirstName()))
                .map(teacher -> toTeacherResponse(teacher, schedulesByTeacher.getOrDefault(teacher.getId(), java.util.List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.List<AcademicTeacherResponse> listTeachers() {
        return teacherResponses();
    }

    @Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, String>> listAreas() {
        return subjectRepository.findAll().stream()
                .map(Subject::getCurriculumArea)
                .filter(area -> area != null && !area.isBlank())
                .distinct()
                .sorted()
                .map(area -> java.util.Map.of("name", area))
                .toList();
    }

    private AcademicCourseResponse toCourseResponse(Course course) {
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

    private void createAssignment(Course course, Student student, java.time.LocalDate startDate) {
        WeekStudentAssignment assignment = new WeekStudentAssignment();
        assignment.setCourse(course);
        assignment.setStudent(student);
        assignment.setStartDate(startDate);
        weekStudentAssignmentRepository.save(assignment);
    }

    @Transactional(readOnly = true)
    public List<WeekStudentAssignmentResponse> getWeekStudentAssignments(Long courseId) {
        return weekStudentAssignmentRepository.findByCourseIdOrderByStartDateDesc(courseId)
                .stream()
                .map(this::toAssignmentResponse)
                .toList();
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

    private Student resolveWeekStudent(Long weekStudentId, Course course) {
        if (weekStudentId == null) {
            return null;
        }

        Student student = studentRepository.findById(weekStudentId)
                .orElseThrow(() -> new BusinessException("El semanero seleccionado no existe."));
        if (course.getId() != null && !student.getCourse().getId().equals(course.getId())) {
            throw new BusinessException("El semanero debe pertenecer al mismo curso.");
        }
        if (course.getId() == null) {
            boolean sameCourse = courseRepository.findByNameIgnoreCaseAndParallelIgnoreCase(
                            course.getName(),
                            course.getParallel())
                    .map(savedCourse -> student.getCourse().getId().equals(savedCourse.getId()))
                    .orElse(true);
            if (!sameCourse) {
                throw new BusinessException("El semanero debe pertenecer al mismo curso.");
            }
        }
        return student;
    }

    private Long resolveWeekStudentId(String courseName, String parallel, String enrollmentNumber) {
        if (enrollmentNumber == null || enrollmentNumber.trim().isBlank()) {
            return null;
        }

        Course course = courseRepository.findByNameIgnoreCaseAndParallelIgnoreCase(courseName, parallel)
                .orElse(null);
        if (course == null) {
            return null;
        }

        return studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(course.getId()).stream()
                .filter(student -> student.getEnrollmentNumber().equalsIgnoreCase(enrollmentNumber.trim()))
                .map(Student::getId)
                .findFirst()
                .orElseThrow(() -> new BusinessException("No existe el estudiante semanero en el curso indicado."));
    }

    @Transactional(readOnly = true)
    public List<RepresentativeResponse> getAllRepresentatives() {
        List<Representative> reps = representativeRepository.findAll();
        return reps.stream().map(this::toRepresentativeResponse).collect(Collectors.toList());
    }

    @Transactional
    public RepresentativeResponse createRepresentative(RepresentativeRequest request) {
        Representative rep = new Representative();
        applyRepresentative(rep, request);
        Representative saved = representativeRepository.save(rep);
        return toRepresentativeResponse(saved);
    }

    @Transactional
    public RepresentativeResponse updateRepresentative(Long id, RepresentativeRequest request) {
        Representative rep = representativeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El representante seleccionado no existe."));
        applyRepresentative(rep, request);
        Representative saved = representativeRepository.save(rep);
        return toRepresentativeResponse(saved);
    }

    private void applyRepresentative(Representative rep, RepresentativeRequest request) {
        rep.setStudentId(request.studentId());
        rep.setFullName(request.fullName().trim());
        rep.setRelationship(request.relationship().trim());
        rep.setPhone(request.phone().trim());
        rep.setEmail(request.email() != null ? request.email().trim() : null);
        rep.setEmergencyContact(request.emergencyContact() != null ? request.emergencyContact().trim() : null);
        rep.setEmergencyPhone(request.emergencyPhone() != null ? request.emergencyPhone().trim() : null);
        rep.setAddress(request.address() != null ? request.address().trim() : null);
    }

    private RepresentativeResponse toRepresentativeResponse(Representative rep) {
        String studentName = "";
        String enrollmentNumber = "";
        if (rep.getStudentId() != null) {
            var studentOpt = studentRepository.findById(rep.getStudentId());
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                User user = student.getUser();
                studentName = user.getFirstName() + " " + user.getLastName();
                enrollmentNumber = student.getEnrollmentNumber();
            }
        }
        return new RepresentativeResponse(
                rep.getId(),
                rep.getStudentId(),
                studentName,
                enrollmentNumber,
                rep.getFullName(),
                rep.getRelationship(),
                rep.getPhone(),
                rep.getEmail(),
                rep.getEmergencyContact(),
                rep.getEmergencyPhone(),
                rep.getAddress());
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

    private AcademicSubjectResponse toSubjectResponse(com.leccionario.backend.academic.domain.Subject subject) {
        return new AcademicSubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getCode(),
                subject.getCurriculumArea());
    }

    private AcademicTeacherResponse toTeacherResponse(
            Teacher teacher,
            java.util.List<com.leccionario.backend.schedule.domain.CourseSchedule> schedules) {
        User user = teacher.getUser();
        java.util.LinkedHashSet<String> subjects = new java.util.LinkedHashSet<>(teacher.getSubjects());
        java.util.LinkedHashSet<String> courses = new java.util.LinkedHashSet<>(teacher.getCourses());
        if (subjects.isEmpty()) {
            schedules.stream()
                    .map(s -> s.getSubject().getName())
                    .forEach(subjects::add);
        }
        if (courses.isEmpty()) {
            schedules.stream()
                    .map(s -> s.getCourse().getName() + " " + s.getCourse().getParallel())
                    .forEach(courses::add);
        }

        return new AcademicTeacherResponse(
                teacher.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getIdentification(),
                user.getFirstName(),
                user.getLastName(),
                user.getFirstName() + " " + user.getLastName(),
                teacher.getSpecialization(),
                user.isEnabled(),
                schedules.size(),
                java.util.List.copyOf(subjects),
                java.util.List.copyOf(courses));
    }
}
