package com.leccionario.backend.conduct.service;

import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.conduct.domain.MeritCategory;
import com.leccionario.backend.conduct.domain.StudentMerit;
import com.leccionario.backend.conduct.dto.MeritCategoryResponse;
import com.leccionario.backend.conduct.dto.StudentMeritRequest;
import com.leccionario.backend.conduct.dto.StudentMeritResponse;
import com.leccionario.backend.conduct.repository.MeritCategoryRepository;
import com.leccionario.backend.conduct.repository.StudentMeritRepository;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.repository.StudentRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConductService {

    private final MeritCategoryRepository meritCategoryRepository;
    private final StudentMeritRepository studentMeritRepository;
    private final StudentRepository studentRepository;

    // --- Merit Categories ---

    @Transactional(readOnly = true)
    public List<MeritCategoryResponse> getMeritCategories(Long institutionId) {
        return meritCategoryRepository.findByInstitutionId(institutionId)
                .stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public MeritCategoryResponse createMeritCategory(MeritCategoryResponse request, Long institutionId) {
        MeritCategory cat = new MeritCategory();
        Institution inst = new Institution();
        inst.setId(institutionId);
        cat.setInstitution(inst);
        cat.setName(request.getName());
        cat.setDescription(request.getDescription());
        cat.setMeritPoints(request.getMeritPoints() != null ? request.getMeritPoints() : 1);
        cat.setActive(true);
        return toCategoryResponse(meritCategoryRepository.save(cat));
    }

    @Transactional
    public void deleteMeritCategory(Long id) {
        meritCategoryRepository.deleteById(id);
    }

    // --- Student Merits ---

    @Transactional
    public StudentMeritResponse registerMerit(StudentMeritRequest request, String username) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        MeritCategory category = meritCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Merit category not found"));

        StudentMerit merit = new StudentMerit();
        Institution inst = new Institution();
        inst.setId(request.getInstitutionId());
        merit.setInstitution(inst);
        merit.setStudent(student);
        Course course = new Course();
        course.setId(request.getCourseId());
        merit.setCourse(course);
        AcademicPeriod period = new AcademicPeriod();
        period.setId(request.getAcademicPeriodId());
        merit.setAcademicPeriod(period);
        merit.setCategory(category);
        merit.setMeritDate(request.getMeritDate() != null ? LocalDate.parse(request.getMeritDate()) : LocalDate.now());
        merit.setPoints(request.getPoints() != null ? request.getPoints() : category.getMeritPoints());
        merit.setDescription(request.getDescription());
        merit.setRegisteredBy(username);

        return toMeritResponse(studentMeritRepository.save(merit));
    }

    @Transactional(readOnly = true)
    public List<StudentMeritResponse> getStudentMerits(Long studentId, Long periodId) {
        return studentMeritRepository.findByStudentIdAndAcademicPeriodId(studentId, periodId)
                .stream().map(this::toMeritResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StudentMeritResponse> getCourseMerits(Long courseId, Long periodId) {
        return studentMeritRepository.findByCourseIdAndAcademicPeriodId(courseId, periodId)
                .stream().map(this::toMeritResponse).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCourseMeritStats(Long courseId, Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        long totalMerits = studentMeritRepository.countByCourseAndPeriod(courseId, periodId);
        Long totalPoints = studentMeritRepository.sumPointsByCourseAndPeriod(courseId, periodId);
        List<Object[]> byCategory = studentMeritRepository.countByCategoryForCourseAndPeriod(courseId, periodId);

        stats.put("totalMerits", totalMerits);
        stats.put("totalPoints", totalPoints != null ? totalPoints : 0L);
        List<Map<String, Object>> categories = new ArrayList<>();
        for (Object[] row : byCategory) {
            Map<String, Object> cat = new LinkedHashMap<>();
            cat.put("name", row[0]);
            cat.put("points", row[1]);
            cat.put("count", row[2]);
            categories.add(cat);
        }
        stats.put("byCategory", categories);
        return stats;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStudentMeritStats(Long studentId, Long periodId) {
        Map<String, Object> stats = new LinkedHashMap<>();
        Long totalPoints = studentMeritRepository.sumPointsByStudentAndPeriod(studentId, periodId);
        stats.put("totalPoints", totalPoints != null ? totalPoints : 0L);
        List<StudentMerit> merits = studentMeritRepository.findByStudentIdAndAcademicPeriodId(studentId, periodId);
        stats.put("totalMerits", merits.size());
        return stats;
    }

    // --- Conduct Summary (merits - demerits) ---

    @Transactional(readOnly = true)
    public List<StudentMeritResponse> getStudentMeritsAll(Long studentId) {
        return studentMeritRepository.findByStudentIdAllPeriods(studentId).stream()
                .map(m -> {
                    StudentMeritResponse r = new StudentMeritResponse();
                    r.setId(m.getId());
                    r.setStudentId(m.getStudent().getId());
                    r.setStudentName(m.getStudent().getUser().getFirstName() + " " + m.getStudent().getUser().getLastName());
                    r.setCategoryName(m.getCategory() != null ? m.getCategory().getName() : "");
                    r.setCategoryId(m.getCategory() != null ? m.getCategory().getId() : null);
                    r.setPoints(m.getPoints());
                    r.setDescription(m.getDescription());
                    r.setAcademicPeriodId(m.getAcademicPeriod() != null ? m.getAcademicPeriod().getId() : null);
                    r.setAcademicPeriodName(m.getAcademicPeriod() != null ? m.getAcademicPeriod().getName() : null);
                    r.setMeritDate(m.getMeritDate());
                    r.setRegisteredBy(m.getRegisteredBy());
                    return r;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getConductSummary(Long studentId, Long periodId) {
        Map<String, Object> summary = new LinkedHashMap<>();
        Long meritPoints = studentMeritRepository.sumPointsByStudentAndPeriod(studentId, periodId);
        summary.put("meritPoints", meritPoints != null ? meritPoints : 0L);

        // Demerits from student_demers table
        Long demeritPoints = 0L;
        try {
            var demeritResult = new Object();
            // Query via raw SQL or repository - simplified here
            summary.put("demeritPoints", demeritPoints);
        } catch (Exception e) {
            summary.put("demeritPoints", 0L);
        }

        summary.put("balance", (meritPoints != null ? meritPoints : 0L) - demeritPoints);
        return summary;
    }

    // --- Mappers ---

    private MeritCategoryResponse toCategoryResponse(MeritCategory c) {
        MeritCategoryResponse r = new MeritCategoryResponse();
        r.setId(c.getId());
        r.setInstitutionId(c.getInstitution().getId());
        r.setName(c.getName());
        r.setDescription(c.getDescription());
        r.setMeritPoints(c.getMeritPoints());
        r.setActive(c.getActive());
        return r;
    }

    private StudentMeritResponse toMeritResponse(StudentMerit m) {
        StudentMeritResponse r = new StudentMeritResponse();
        r.setId(m.getId());
        r.setStudentId(m.getStudent().getId());
        r.setStudentName(m.getStudent().getUser().getFirstName() + " " + m.getStudent().getUser().getLastName());
        r.setEnrollmentNumber(m.getStudent().getEnrollmentNumber());
        r.setCourseId(m.getCourse().getId());
        r.setCourseName(m.getCourse().getName());
        r.setAcademicPeriodId(m.getAcademicPeriod().getId());
        r.setAcademicPeriodName(m.getAcademicPeriod().getName());
        r.setCategoryId(m.getCategory().getId());
        r.setCategoryName(m.getCategory().getName());
        r.setMeritDate(m.getMeritDate());
        r.setPoints(m.getPoints());
        r.setDescription(m.getDescription());
        r.setRegisteredBy(m.getRegisteredBy());
        return r;
    }
}
