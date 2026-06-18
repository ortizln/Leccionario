package com.leccionario.backend.academic.web;

import com.leccionario.backend.academic.dto.AcademicCourseRequest;
import com.leccionario.backend.academic.dto.AcademicCourseResponse;
import com.leccionario.backend.academic.dto.AcademicOverviewResponse;
import com.leccionario.backend.academic.dto.AcademicStudentRequest;
import com.leccionario.backend.academic.dto.AcademicStudentResponse;
import com.leccionario.backend.academic.dto.AcademicSubjectRequest;
import com.leccionario.backend.academic.dto.AcademicSubjectResponse;
import com.leccionario.backend.academic.dto.AcademicTeacherRequest;
import com.leccionario.backend.academic.dto.AcademicTeacherResponse;
import com.leccionario.backend.academic.dto.RepresentativeRequest;
import com.leccionario.backend.academic.dto.RepresentativeResponse;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.academic.service.AcademicService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/academic")
@RequiredArgsConstructor
public class AcademicController {

    private final AcademicService academicService;

    @GetMapping("/overview")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<AcademicOverviewResponse> overview() {
        return ResponseEntity.ok(academicService.getOverview());
    }

    @GetMapping("/import-template/courses")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadCourseTemplate() {
        byte[] file = academicService.exportCourseTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cursos-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @GetMapping("/import-template/students")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadStudentTemplate() {
        byte[] file = academicService.exportStudentTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=estudiantes-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @GetMapping("/import-template/teachers")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadTeacherTemplate() {
        byte[] file = academicService.exportTeacherTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=docentes-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @PostMapping("/courses")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicCourseResponse> createCourse(
            @Valid @RequestBody AcademicCourseRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.createCourse(request, principal.getName()));
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicCourseResponse> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody AcademicCourseRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.updateCourse(id, request, principal.getName()));
    }

    @PostMapping("/students")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicStudentResponse> createStudent(
            @Valid @RequestBody AcademicStudentRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.createStudent(request, principal.getName()));
    }

    @PutMapping("/students/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicStudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody AcademicStudentRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.updateStudent(id, request, principal.getName()));
    }

    @PutMapping("/teachers/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicTeacherResponse> updateTeacher(
            @PathVariable Long id,
            @Valid @RequestBody AcademicTeacherRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.updateTeacher(id, request, principal.getName()));
    }

    @PostMapping("/subjects")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicSubjectResponse> createSubject(
            @Valid @RequestBody AcademicSubjectRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.createSubject(request, principal.getName()));
    }

    @PutMapping("/subjects/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicSubjectResponse> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody AcademicSubjectRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.updateSubject(id, request, principal.getName()));
    }

    @PostMapping("/teachers")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<AcademicTeacherResponse> createTeacher(
            @Valid @RequestBody AcademicTeacherRequest request,
            Principal principal) {
        return ResponseEntity.ok(academicService.createTeacher(request, principal.getName()));
    }

    @PostMapping("/import/courses")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importCourses(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(academicService.importCourses(file, principal.getName()));
    }

    @PostMapping("/import/students")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importStudents(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(academicService.importStudents(file, principal.getName()));
    }

    @PostMapping("/import/teachers")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importTeachers(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(academicService.importTeachers(file, principal.getName()));
    }

    @GetMapping("/representatives")
    @PreAuthorize("hasAuthority('ACADEMIC_VIEW')")
    public ResponseEntity<List<RepresentativeResponse>> listRepresentatives() {
        return ResponseEntity.ok(academicService.getAllRepresentatives());
    }

    @PostMapping("/representatives")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<RepresentativeResponse> createRepresentative(
            @Valid @RequestBody RepresentativeRequest request) {
        return ResponseEntity.ok(academicService.createRepresentative(request));
    }

    @PutMapping("/representatives/{id}")
    @PreAuthorize("hasAuthority('ACADEMIC_MANAGE')")
    public ResponseEntity<RepresentativeResponse> updateRepresentative(
            @PathVariable Long id,
            @Valid @RequestBody RepresentativeRequest request) {
        return ResponseEntity.ok(academicService.updateRepresentative(id, request));
    }

}
