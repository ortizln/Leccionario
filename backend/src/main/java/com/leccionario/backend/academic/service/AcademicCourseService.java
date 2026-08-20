package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.AcademicCourseRequest;
import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.domain.AcademicYear;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.academic.domain.CourseSection;
import com.leccionario.backend.academic.domain.CourseSubLevel;
import com.leccionario.backend.academic.domain.SchoolDay;
import com.leccionario.backend.academic.domain.SchoolModality;
import com.leccionario.backend.academic.domain.Student;
import com.leccionario.backend.academic.repository.AcademicYearRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SchoolDayRepository;
import com.leccionario.backend.academic.repository.SchoolModalityRepository;
import com.leccionario.backend.academic.repository.StudentRepository;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
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
public class AcademicCourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SchoolDayRepository schoolDayRepository;
    private final SchoolModalityRepository schoolModalityRepository;

    @Transactional(readOnly = true)
    public List<AcademicCourseResponse> listCourses() {
        return courseRepository.findAll().stream()
                .sorted(Comparator.comparing(course -> course.getName() + course.getParallel()))
                .map(this::toCourseResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AcademicCourseResponse getCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Curso no encontrado"));
        return toCourseResponse(course);
    }

    @Transactional
    public AcademicCourseResponse createCourse(AcademicCourseRequest request, String username) {
        validateCourseUniqueness(request, null);
        Course course = new Course();
        applyCourse(course, request);
        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Transactional
    public AcademicCourseResponse updateCourse(Long id, AcademicCourseRequest request, String username) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Curso no encontrado"));
        validateCourseUniqueness(request, id);
        applyCourse(course, request);
        Course saved = courseRepository.save(course);
        return toCourseResponse(saved);
    }

    @Transactional
    public void deleteCourse(Long id, String username) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Curso no encontrado"));
        boolean hasStudents = studentRepository.findByCourseIdOrderByEnrollmentNumberAsc(id).isPresent();
        if (hasStudents) {
            throw new BusinessException("No se puede eliminar un curso que tiene estudiantes asignados.");
        }
        courseRepository.deleteById(id);
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
                        ExcelSupport.getString(row, 3),
                        ExcelSupport.getString(row, 4),
                        ExcelSupport.getInt(row, 5, 0),
                        null,
                        null,
                        null,
                        null,
                        ExcelSupport.getInt(row, 6, 40)),
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

    @Transactional(readOnly = true)
    public byte[] exportCourseTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("cursos");
        ExcelSupport.writeHeaders(sheet, "name", "parallel", "level", "section", "subLevel", "grade", "capacity");
        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("Primero BGU");
        sample.createCell(1).setCellValue("A");
        sample.createCell(2).setCellValue("1. Grado de EGB");
        sample.createCell(3).setCellValue("EGB");
        sample.createCell(4).setCellValue("PREPARATORIA");
        sample.createCell(5).setCellValue(1);
        sample.createCell(6).setCellValue(40);

        Sheet catalog = workbook.createSheet("catalogos");
        ExcelSupport.writeHeaders(catalog, "secciones", "subniveles", "grados_por_subnivel");
        catalog.createRow(1).createCell(0).setCellValue("EGB");
        catalog.createRow(2).createCell(0).setCellValue("INICIAL");
        catalog.createRow(3).createCell(0).setCellValue("BACHILLERATO");
        catalog.createRow(1).createCell(1).setCellValue("INICIAL -> Grados 1, 2");
        catalog.createRow(2).createCell(1).setCellValue("PREPARATORIA -> Grado 1");
        catalog.createRow(3).createCell(1).setCellValue("ELEMENTAL -> Grados 2, 3, 4");
        catalog.createRow(4).createCell(1).setCellValue("MEDIA -> Grados 5, 6, 7");
        catalog.createRow(5).createCell(1).setCellValue("SUPERIOR -> Grados 8, 9, 10");
        catalog.createRow(6).createCell(1).setCellValue("BGU -> Cursos 1, 2, 3");
        catalog.createRow(1).createCell(2).setCellValue("El nombre del curso se auto-genera: Grado + Paralelo");

        ExcelSupport.autoSize(sheet, 7);
        ExcelSupport.autoSize(catalog, 3);
        return ExcelSupport.toBytes(workbook);
    }

    private void applyCourse(Course course, AcademicCourseRequest request) {
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
        if (request.academicYearId() != null) {
            course.setAcademicYear(academicYearRepository.findById(request.academicYearId()).orElse(null));
        } else {
            course.setAcademicYear(academicYearRepository.findByActiveTrue().orElse(null));
        }
        if (request.schoolDayId() != null) {
            course.setSchoolDay(schoolDayRepository.findById(request.schoolDayId()).orElse(null));
        }
        if (request.schoolModalityId() != null) {
            course.setSchoolModality(schoolModalityRepository.findById(request.schoolModalityId()).orElse(null));
        }
        course.setCapacity(request.capacity());
        course.setName(generateCourseName(course.getGrade(), course.getParallel()));
        course.setWeekStudent(resolveWeekStudent(request.weekStudentId(), course));
    }

    private void validateCourseUniqueness(AcademicCourseRequest request, Long currentCourseId) {
        if (request.grade() == null || request.subLevel() == null) {
            return;
        }
        boolean exists = courseRepository.findAll().stream()
                .filter(c -> !c.getId().equals(currentCourseId))
                .anyMatch(c -> c.getGrade() != null
                        && c.getGrade().equals(request.grade())
                        && c.getParallel().equalsIgnoreCase(request.parallel().trim())
                        && c.getSubLevel() != null
                        && c.getSubLevel().name().equalsIgnoreCase(request.subLevel().trim()));
        if (exists) {
            throw new BusinessException("Ya existe un curso con ese subnivel, grado y paralelo. No se permiten duplicados.");
        }
        boolean existsWithoutSubLevel = courseRepository.findAll().stream()
                .filter(c -> !c.getId().equals(currentCourseId))
                .anyMatch(c -> c.getGrade() != null
                        && c.getGrade().equals(request.grade())
                        && c.getParallel().equalsIgnoreCase(request.parallel().trim())
                        && c.getSubLevel() == null);
        if (existsWithoutSubLevel) {
            throw new BusinessException("Ya existe un curso con ese grado y paralelo (sin subnivel asignado). Edite el curso existente primero.");
        }
    }

    private String generateCourseName(Integer grade, String parallel) {
        if (grade == null || parallel == null || parallel.isBlank()) {
            return "Sin nombre";
        }
        return switch (grade) {
            case 1 -> "Primero " + parallel.trim().toUpperCase();
            case 2 -> "Segundo " + parallel.trim().toUpperCase();
            case 3 -> "Tercero " + parallel.trim().toUpperCase();
            case 4 -> "Cuarto " + parallel.trim().toUpperCase();
            case 5 -> "Quinto " + parallel.trim().toUpperCase();
            case 6 -> "Sexto " + parallel.trim().toUpperCase();
            case 7 -> "Septimo " + parallel.trim().toUpperCase();
            case 8 -> "Octavo " + parallel.trim().toUpperCase();
            case 9 -> "Noveno " + parallel.trim().toUpperCase();
            case 10 -> "Decimo " + parallel.trim().toUpperCase();
            case 11 -> "Undecimo " + parallel.trim().toUpperCase();
            default -> "Grado " + grade + " " + parallel.trim().toUpperCase();
        };
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
                        : null,
                course.getAcademicYear() != null ? course.getAcademicYear().getId() : null,
                course.getAcademicYear() != null ? course.getAcademicYear().getYear() : null,
                course.getSchoolDay() != null ? course.getSchoolDay().getId() : null,
                course.getSchoolDay() != null ? course.getSchoolDay().getName() : null,
                course.getSchoolModality() != null ? course.getSchoolModality().getId() : null,
                course.getSchoolModality() != null ? course.getSchoolModality().getName() : null,
                course.getCapacity());
    }
}
