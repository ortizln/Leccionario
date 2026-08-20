package com.leccionario.backend.academic.service;

import com.leccionario.backend.academic.dto.AcademicCourseRequest;
import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicOverviewResponse;
import com.leccionario.backend.academic.dto.AcademicPeriodResponse;
import com.leccionario.backend.academic.dto.AcademicStudentRequest;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.academic.dto.AcademicSubjectRequest;
import com.leccionario.backend.academic.dto.AcademicSubjectResponse;
import com.leccionario.backend.academic.dto.AcademicTeacherRequest;
import com.leccionario.backend.academic.dto.AcademicTeacherResponse;
import com.leccionario.backend.academic.dto.AcademicYearRequest;
import com.leccionario.backend.academic.dto.AcademicYearResponse;
import com.leccionario.backend.academic.dto.RepresentativeRequest;
import com.leccionario.backend.academic.dto.RepresentativeResponse;
import com.leccionario.backend.academic.dto.SchoolDayRequest;
import com.leccionario.backend.academic.dto.SchoolDayResponse;
import com.leccionario.backend.academic.dto.SchoolModalityRequest;
import com.leccionario.backend.academic.dto.SchoolModalityResponse;
import com.leccionario.backend.academic.dto.WeekStudentAssignmentResponse;
import com.leccionario.backend.academic.repository.AcademicPeriodRepository;
import com.leccionario.backend.academic.repository.CourseRepository;
import com.leccionario.backend.academic.repository.SubjectRepository;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.demerit.repository.StudentDemerRepository;
import com.leccionario.backend.dailylog.repository.DailyLogRepository;
import com.leccionario.backend.dailylog.repository.DailyLogEntryRepository;
import com.leccionario.backend.dailylog.repository.DailyLogSignatureRepository;
import com.leccionario.backend.dailylog.repository.DailyLogStudentAbsenceRepository;
import com.leccionario.backend.dailylog.repository.DailyLogStudentIncidentRepository;
import com.leccionario.backend.evaluation.repository.EvaluationRepository;
import com.leccionario.backend.lessonplan.repository.LessonPlanRepository;
import com.leccionario.backend.schedule.repository.CourseScheduleRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.user.repository.UserRepository;
import com.leccionario.backend.academic.repository.WeekStudentAssignmentRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AcademicService {

    private final AcademicCourseService courseService;
    private final AcademicStudentService studentService;
    private final AcademicTeacherService teacherService;
    private final AcademicSubjectService subjectService;
    private final AcademicCatalogService catalogService;
    private final RepresentativeService representativeService;

    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CourseScheduleRepository courseScheduleRepository;
    private final WeekStudentAssignmentRepository weekStudentAssignmentRepository;
    private final DailyLogRepository dailyLogRepository;
    private final DailyLogEntryRepository dailyLogEntryRepository;
    private final DailyLogSignatureRepository dailyLogSignatureRepository;
    private final DailyLogStudentAbsenceRepository dailyLogStudentAbsenceRepository;
    private final DailyLogStudentIncidentRepository dailyLogStudentIncidentRepository;
    private final EvaluationRepository evaluationRepository;
    private final LessonPlanRepository lessonPlanRepository;
    private final StudentDemerRepository studentDemerRepository;

    @Transactional(readOnly = true)
    public AcademicOverviewResponse getOverview() {
        return new AcademicOverviewResponse(
                courseService.listCourses(),
                subjectService.listSubjects(),
                academicPeriodRepository.findAll().stream()
                        .sorted(Comparator.comparing(period -> period.getStartDate().toString()))
                        .map(period -> new AcademicPeriodResponse(
                                period.getId(),
                                period.getName(),
                                period.getStartDate(),
                                period.getEndDate(),
                                period.isActive()))
                        .toList(),
                studentService.listStudents(),
                teacherService.listTeachers());
    }

    @Transactional
    public AcademicCourseResponse createCourse(AcademicCourseRequest request, String username) {
        return courseService.createCourse(request, username);
    }

    @Transactional
    public AcademicCourseResponse updateCourse(Long id, AcademicCourseRequest request, String username) {
        return courseService.updateCourse(id, request, username);
    }

    @Transactional
    public void deleteCourse(Long id, String username) {
        com.leccionario.backend.academic.domain.Course course = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El curso seleccionado no existe."));
        long studentCount = studentRepository.countByCourseId(id);
        if (studentCount > 0) {
            throw new BusinessException("No se puede eliminar el curso porque tiene " + studentCount + " estudiante(s) matriculado(s). Retire los estudiantes primero.");
        }
        courseScheduleRepository.deleteByCourseId(id);
        weekStudentAssignmentRepository.deleteByCourseId(id);
        dailyLogStudentAbsenceRepository.deleteByCourseId(id);
        dailyLogStudentIncidentRepository.deleteByCourseId(id);
        dailyLogEntryRepository.deleteByCourseId(id);
        dailyLogSignatureRepository.deleteByCourseId(id);
        dailyLogRepository.deleteByCourseId(id);
        evaluationRepository.deleteByCourseId(id);
        lessonPlanRepository.deleteByCourseId(id);
        studentDemerRepository.deleteByCourseId(id);
        courseRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AcademicCourseResponse> listCourses() {
        return courseService.listCourses();
    }

    @Transactional(readOnly = true)
    public AcademicCourseResponse getCourse(Long id) {
        return courseService.getCourse(id);
    }

    @Transactional
    public void deleteStudent(Long id, String username) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("El estudiante seleccionado no existe."));
        User user = student.getUser();
        Long studentId = student.getId();

        evaluationRepository.deleteByStudentId(studentId);
        studentDemerRepository.deleteByStudentId(studentId);
        dailyLogStudentAbsenceRepository.deleteByStudentId(studentId);
        dailyLogStudentIncidentRepository.deleteByStudentId(studentId);
        weekStudentAssignmentRepository.deleteByStudentId(studentId);
        studentRepository.deleteById(studentId);
        userRepository.deleteById(user.getId());
    }

    @Transactional(readOnly = true)
    public List<AcademicStudentResponse> listStudents() {
        return studentService.listStudents();
    }

    @Transactional(readOnly = true)
    public AcademicStudentResponse getStudent(Long id) {
        return studentService.getStudent(id);
    }

    @Transactional
    public AcademicStudentResponse createStudent(AcademicStudentRequest request, String username) {
        return studentService.createStudent(request, username);
    }

    @Transactional
    public AcademicStudentResponse updateStudent(Long id, AcademicStudentRequest request, String username) {
        return studentService.updateStudent(id, request, username);
    }

    @Transactional(readOnly = true)
    public List<AcademicTeacherResponse> listTeachers() {
        return teacherService.listTeachers();
    }

    @Transactional(readOnly = true)
    public AcademicTeacherResponse getTeacher(Long id) {
        return teacherService.getTeacher(id);
    }

    @Transactional
    public AcademicTeacherResponse createTeacher(AcademicTeacherRequest request, String username) {
        return teacherService.createTeacher(request, username);
    }

    @Transactional
    public AcademicTeacherResponse updateTeacher(Long id, AcademicTeacherRequest request, String username) {
        return teacherService.updateTeacher(id, request, username);
    }

    @Transactional
    public void deleteTeacher(Long id, String username) {
        teacherService.deleteTeacher(id, username);
    }

    @Transactional(readOnly = true)
    public List<AcademicSubjectResponse> listSubjects() {
        return subjectService.listSubjects();
    }

    @Transactional
    public AcademicSubjectResponse createSubject(AcademicSubjectRequest request, String username) {
        return subjectService.createSubject(request, username);
    }

    @Transactional
    public AcademicSubjectResponse updateSubject(Long id, AcademicSubjectRequest request, String username) {
        return subjectService.updateSubject(id, request, username);
    }

    @Transactional(readOnly = true)
    public List<Map<String, String>> listAreas() {
        return subjectService.listAreas();
    }

    @Transactional(readOnly = true)
    public List<AcademicYearResponse> listAcademicYears() {
        return catalogService.listAcademicYears();
    }

    @Transactional
    public AcademicYearResponse createAcademicYear(AcademicYearRequest request, String username) {
        return catalogService.createAcademicYear(request, username);
    }

    @Transactional
    public AcademicYearResponse updateAcademicYear(Long id, AcademicYearRequest request, String username) {
        return catalogService.updateAcademicYear(id, request, username);
    }

    @Transactional(readOnly = true)
    public List<SchoolDayResponse> listSchoolDays() {
        return catalogService.listSchoolDays();
    }

    @Transactional
    public SchoolDayResponse createSchoolDay(SchoolDayRequest request, String username) {
        return catalogService.createSchoolDay(request, username);
    }

    @Transactional
    public SchoolDayResponse updateSchoolDay(Long id, SchoolDayRequest request, String username) {
        return catalogService.updateSchoolDay(id, request, username);
    }

    @Transactional(readOnly = true)
    public List<SchoolModalityResponse> listSchoolModalities() {
        return catalogService.listSchoolModalities();
    }

    @Transactional
    public SchoolModalityResponse createSchoolModality(SchoolModalityRequest request, String username) {
        return catalogService.createSchoolModality(request, username);
    }

    @Transactional
    public SchoolModalityResponse updateSchoolModality(Long id, SchoolModalityRequest request, String username) {
        return catalogService.updateSchoolModality(id, request, username);
    }

    @Transactional(readOnly = true)
    public List<RepresentativeResponse> getAllRepresentatives() {
        return representativeService.getAllRepresentatives();
    }

    @Transactional
    public RepresentativeResponse createRepresentative(RepresentativeRequest request) {
        return representativeService.createRepresentative(request);
    }

    @Transactional
    public RepresentativeResponse updateRepresentative(Long id, RepresentativeRequest request) {
        return representativeService.updateRepresentative(id, request);
    }

    @Transactional
    public void deleteRepresentative(Long id, String username) {
        representativeService.deleteRepresentative(id, username);
    }

    @Transactional(readOnly = true)
    public List<WeekStudentAssignmentResponse> getWeekStudentAssignments(Long courseId) {
        return studentService.getWeekStudentAssignments(courseId);
    }

    @Transactional(readOnly = true)
    public byte[] exportCourseTemplate() {
        return courseService.exportCourseTemplate();
    }

    @Transactional(readOnly = true)
    public byte[] exportStudentTemplate() {
        return studentService.exportStudentTemplate();
    }

    @Transactional(readOnly = true)
    public byte[] exportTeacherTemplate() {
        return teacherService.exportTeacherTemplate();
    }

    @Transactional
    public ImportSummaryResponse importCourses(MultipartFile file, String actor) {
        return courseService.importCourses(file, actor);
    }

    @Transactional
    public ImportSummaryResponse importStudents(MultipartFile file, String actor) {
        return studentService.importStudents(file, actor);
    }

    @Transactional
    public ImportSummaryResponse importTeachers(MultipartFile file, String actor) {
        return teacherService.importTeachers(file, actor);
    }
}
