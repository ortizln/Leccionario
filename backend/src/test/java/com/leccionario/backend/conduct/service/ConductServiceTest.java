package com.leccionario.backend.conduct.service;

import com.leccionario.backend.conduct.domain.MeritCategory;
import com.leccionario.backend.conduct.domain.StudentMerit;
import com.leccionario.backend.conduct.dto.MeritCategoryResponse;
import com.leccionario.backend.conduct.dto.StudentMeritRequest;
import com.leccionario.backend.conduct.dto.StudentMeritResponse;
import com.leccionario.backend.conduct.repository.MeritCategoryRepository;
import com.leccionario.backend.conduct.repository.StudentMeritRepository;
import com.leccionario.backend.user.domain.Student;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.repository.StudentRepository;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.academic.domain.AcademicPeriod;
import com.leccionario.backend.academic.domain.Course;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ConductServiceTest {

    private MeritCategoryRepository meritCategoryRepository;
    private StudentMeritRepository studentMeritRepository;
    private StudentRepository studentRepository;
    private ConductService service;

    @BeforeEach
    void setUp() {
        meritCategoryRepository = mock(MeritCategoryRepository.class);
        studentMeritRepository = mock(StudentMeritRepository.class);
        studentRepository = mock(StudentRepository.class);
        service = new ConductService(meritCategoryRepository, studentMeritRepository, studentRepository);
    }

    @Test
    void getMeritCategories_delegatesToRepository() {
        when(meritCategoryRepository.findByInstitutionId(1L)).thenReturn(List.of());
        List<MeritCategoryResponse> result = service.getMeritCategories(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void createMeritCategory_savesAndReturns() {
        when(meritCategoryRepository.save(any(MeritCategory.class))).thenAnswer(inv -> {
            MeritCategory c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
        MeritCategoryResponse req = new MeritCategoryResponse();
        req.setName("Puntualidad");
        req.setMeritPoints(5);
        MeritCategoryResponse result = service.createMeritCategory(req, 1L);
        assertEquals("Puntualidad", result.getName());
        assertEquals(5, result.getMeritPoints());
    }

    @Test
    void deleteMeritCategory_delegatesToRepository() {
        service.deleteMeritCategory(1L);
        verify(meritCategoryRepository).deleteById(1L);
    }

    @Test
    void registerMerit_savesAndReturns() {
        Student student = new Student();
        student.setId(10L);
        User user = new User();
        user.setFirstName("Juan");
        user.setLastName("Perez");
        student.setUser(user);
        student.setEnrollmentNumber("E001");

        MeritCategory category = new MeritCategory();
        category.setId(1L);
        category.setName("Puntualidad");
        category.setMeritPoints(3);

        Institution inst = new Institution();
        inst.setId(1L);
        Course course = new Course();
        course.setId(5L);
        course.setName("Matematicas");
        AcademicPeriod period = new AcademicPeriod();
        period.setId(1L);
        period.setName("2024-1");

        when(studentRepository.findById(10L)).thenReturn(Optional.of(student));
        when(meritCategoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(studentMeritRepository.save(any(StudentMerit.class))).thenAnswer(inv -> {
            StudentMerit m = inv.getArgument(0);
            m.setId(1L);
            m.setStudent(student);
            m.setCourse(course);
            m.setAcademicPeriod(period);
            m.setCategory(category);
            return m;
        });

        StudentMeritRequest req = new StudentMeritRequest();
        req.setStudentId(10L);
        req.setCategoryId(1L);
        req.setInstitutionId(1L);
        req.setCourseId(5L);
        req.setAcademicPeriodId(1L);
        req.setPoints(3);
        req.setDescription("Puntual en clase");
        req.setMeritDate(LocalDate.now().toString());

        StudentMeritResponse result = service.registerMerit(req, "admin");
        assertEquals(10L, result.getStudentId());
        assertEquals("Puntualidad", result.getCategoryName());
        assertEquals(3, result.getPoints());
    }

    @Test
    void registerMerit_throwsWhenStudentNotFound() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());
        StudentMeritRequest req = new StudentMeritRequest();
        req.setStudentId(99L);
        req.setCategoryId(1L);
        assertThrows(ResourceNotFoundException.class, () ->
            service.registerMerit(req, "admin"));
    }

    @Test
    void getConductSummary_returnsBalance() {
        when(studentMeritRepository.sumPointsByStudentAndPeriod(10L, 1L)).thenReturn(15L);
        Map<String, Object> summary = service.getConductSummary(10L, 1L);
        assertEquals(15L, summary.get("meritPoints"));
        assertEquals(0L, summary.get("demeritPoints"));
        assertEquals(15L, summary.get("balance"));
    }
}
