package com.leccionario.backend.evaluation.web;

import com.leccionario.backend.evaluation.dto.EvaluationRequest;
import com.leccionario.backend.evaluation.dto.EvaluationResponse;
import com.leccionario.backend.evaluation.dto.EvaluationTypeRequest;
import com.leccionario.backend.evaluation.dto.EvaluationTypeResponse;
import com.leccionario.backend.evaluation.dto.GradeRequest;
import com.leccionario.backend.evaluation.dto.GradeResponse;
import com.leccionario.backend.evaluation.dto.GradeScaleRequest;
import com.leccionario.backend.evaluation.dto.GradeScaleResponse;
import com.leccionario.backend.evaluation.service.GradingService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grading")
@RequiredArgsConstructor
public class GradingController {

    private final GradingService gradingService;

    // --- Grade Scales ---

    @PostMapping("/scales")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<GradeScaleResponse> createScale(
            @Valid @RequestBody GradeScaleRequest request,
            @RequestParam Long institutionId,
            Principal principal) {
        return ResponseEntity.ok(gradingService.createScale(request, institutionId, principal.getName()));
    }

    @GetMapping("/scales")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<List<GradeScaleResponse>> getScales(@RequestParam Long institutionId) {
        return ResponseEntity.ok(gradingService.getScalesByInstitution(institutionId));
    }

    @PutMapping("/scales/{id}")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<GradeScaleResponse> updateScale(
            @PathVariable Long id,
            @Valid @RequestBody GradeScaleRequest request,
            @RequestParam Long institutionId,
            Principal principal) {
        return ResponseEntity.ok(gradingService.updateScale(id, request, institutionId, principal.getName()));
    }

    @DeleteMapping("/scales/{id}")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<Void> deleteScale(
            @PathVariable Long id,
            @RequestParam Long institutionId,
            Principal principal) {
        gradingService.deleteScale(id, institutionId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    // --- Evaluation Types ---

    @PostMapping("/types")
    @PreAuthorize("hasAuthority('EVALUATION_MANAGE')")
    public ResponseEntity<EvaluationTypeResponse> createType(
            @Valid @RequestBody EvaluationTypeRequest request,
            @RequestParam Long institutionId,
            Principal principal) {
        return ResponseEntity.ok(gradingService.createEvaluationType(request, institutionId, principal.getName()));
    }

    @GetMapping("/types")
    @PreAuthorize("hasAuthority('EVALUATION_VIEW')")
    public ResponseEntity<List<EvaluationTypeResponse>> getTypes(@RequestParam Long institutionId) {
        return ResponseEntity.ok(gradingService.getEvaluationTypesByInstitution(institutionId));
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("hasAuthority('EVALUATION_MANAGE')")
    public ResponseEntity<EvaluationTypeResponse> updateType(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationTypeRequest request,
            @RequestParam Long institutionId,
            Principal principal) {
        return ResponseEntity.ok(gradingService.updateEvaluationType(id, request, institutionId, principal.getName()));
    }

    @DeleteMapping("/types/{id}")
    @PreAuthorize("hasAuthority('EVALUATION_MANAGE')")
    public ResponseEntity<Void> deleteType(
            @PathVariable Long id,
            @RequestParam Long institutionId,
            Principal principal) {
        gradingService.deleteEvaluationType(id, institutionId, principal.getName());
        return ResponseEntity.noContent().build();
    }

    // --- Evaluations ---

    @PostMapping("/evaluations")
    @PreAuthorize("hasAuthority('EVALUATION_MANAGE')")
    public ResponseEntity<EvaluationResponse> createEvaluation(
            @Valid @RequestBody EvaluationRequest request,
            Principal principal) {
        return ResponseEntity.ok(gradingService.createEvaluation(request, principal.getName()));
    }

    @GetMapping("/evaluations")
    @PreAuthorize("hasAuthority('EVALUATION_VIEW')")
    public ResponseEntity<List<EvaluationResponse>> getEvaluations(
            @RequestParam(required = false) Long lessonPlanId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long subjectId) {
        if (lessonPlanId != null) {
            return ResponseEntity.ok(gradingService.getEvaluationsByLessonPlan(lessonPlanId));
        }
        if (courseId != null && subjectId != null) {
            return ResponseEntity.ok(gradingService.getEvaluationsByCourseAndSubject(courseId, subjectId));
        }
        return ResponseEntity.ok(List.of());
    }

    // --- Grades ---

    @PostMapping("/grades")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<GradeResponse> saveGrade(
            @Valid @RequestBody GradeRequest request,
            Principal principal) {
        return ResponseEntity.ok(gradingService.saveGrade(request, principal.getName()));
    }

    @PostMapping("/grades/bulk")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<List<GradeResponse>> saveBulkGrades(
            @Valid @RequestBody List<GradeRequest> requests,
            Principal principal) {
        return ResponseEntity.ok(gradingService.saveBulkGrades(requests, principal.getName()));
    }

    @GetMapping("/grades")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<List<GradeResponse>> getGrades(@RequestParam Long evaluationId) {
        return ResponseEntity.ok(gradingService.getGradesByEvaluation(evaluationId));
    }

    // --- Grade Grid ---

    @GetMapping("/grid")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<?> getGradeGrid(
            @RequestParam Long courseId,
            @RequestParam Long subjectId,
            @RequestParam Long periodId) {
        return ResponseEntity.ok(gradingService.getGradeGrid(courseId, subjectId, periodId));
    }

    // --- Period Grades ---

    @GetMapping("/period")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<?> getPeriodGrades(
            @RequestParam Long courseId,
            @RequestParam Long periodId,
            @RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return ResponseEntity.ok(gradingService.getStudentPeriodGrades(studentId, periodId));
        }
        return ResponseEntity.ok(gradingService.getPeriodGrades(courseId, periodId));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<?> getStatistics(
            @RequestParam Long courseId,
            @RequestParam Long subjectId,
            @RequestParam Long periodId) {
        return ResponseEntity.ok(gradingService.getGradeStatistics(courseId, subjectId, periodId));
    }

    @PostMapping("/period/recalculate")
    @PreAuthorize("hasAuthority('GRADE_MANAGE')")
    public ResponseEntity<Void> recalculate(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam Long subjectId,
            @RequestParam Long periodId) {
        gradingService.recalculatePeriodGrade(studentId, courseId, subjectId, periodId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<?> getGradesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradingService.getGradesByStudent(studentId));
    }

    // --- Dashboard ---

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('GRADE_VIEW')")
    public ResponseEntity<?> getDashboard(@RequestParam Long periodId) {
        return ResponseEntity.ok(gradingService.getDashboard(periodId));
    }
}
