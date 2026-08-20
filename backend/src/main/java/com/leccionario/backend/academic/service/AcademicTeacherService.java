package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.AcademicTeacherRequest;
import com.leccionario.backend.academic.dto.AcademicTeacherResponse;
import com.leccionario.backend.user.domain.Teacher;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.domain.Role;
import com.leccionario.backend.user.domain.RoleDefaults;
import com.leccionario.backend.user.repository.UserRepository;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.schedule.domain.CourseSchedule;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AcademicTeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AcademicTeacherResponse> listTeachers() {
        var schedulesByTeacher = courseScheduleRepository.findAll().stream()
                .collect(java.util.stream.Collectors.groupingBy(schedule -> schedule.getTeacher().getId()));

        return teacherRepository.findAll().stream()
                .sorted(Comparator.comparing(teacher -> teacher.getUser().getLastName() + teacher.getUser().getFirstName()))
                .map(teacher -> toTeacherResponse(teacher, schedulesByTeacher.getOrDefault(teacher.getId(), java.util.List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AcademicTeacherResponse getTeacher(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Docente no encontrado"));
        return toTeacherResponse(teacher,
                courseScheduleRepository.findByTeacherIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(id));
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

        return toTeacherResponse(saved, courseScheduleRepository.findByTeacherIdOrderByWeekdayAscScheduleBlock_BlockOrderAsc(
                saved.getId()));
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
        ExcelSupport.writeHeaders(catalog, "especialidades_referenciales", "notas");
        var areas = new String[]{
            "Matematica", "Lengua y Literatura", "Ciencias Naturales",
            "Estudios Sociales", "Ingles", "Educacion Fisica",
            "Artes Plasticas", "Musica", "Tecnologia e Informatica",
            "Formacion Ciudadana", "Religion", "Emprendimiento"
        };
        for (int i = 0; i < areas.length; i++) {
            catalog.createRow(i + 1).createCell(0).setCellValue(areas[i]);
        }
        catalog.createRow(1).createCell(1).setCellValue("Las especialidades son orientaciones.");
        catalog.createRow(2).createCell(1).setCellValue("Las materias y cursos se asignan por separado.");

        ExcelSupport.autoSize(sheet, 7);
        ExcelSupport.autoSize(catalog, 2);
        return ExcelSupport.toBytes(workbook);
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

        com.leccionario.backend.institution.domain.Institution institution = institutionRepository.findAll().stream().findFirst()
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
            String temporaryPassword = java.util.UUID.randomUUID().toString().substring(0, 12) + "A1!";
            user.setPassword(passwordEncoder.encode(temporaryPassword));
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

        return savedTeacher;
    }

    private AcademicTeacherResponse toTeacherResponse(
            Teacher teacher,
            java.util.List<CourseSchedule> schedules) {
        User user = teacher.getUser();
        LinkedHashSet<String> subjects = new LinkedHashSet<>(teacher.getSubjects());
        LinkedHashSet<String> courses = new LinkedHashSet<>(teacher.getCourses());
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
