package com.leccionario.backend.questionbank.web;

import com.leccionario.backend.questionbank.dto.QuestionCategoryResponse;
import com.leccionario.backend.questionbank.dto.QuestionRequest;
import com.leccionario.backend.questionbank.dto.QuestionResponse;
import com.leccionario.backend.questionbank.service.QuestionBankService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
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
@RequestMapping("/api/question-bank")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    // --- Categories ---

    @GetMapping("/categories")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_VIEW')")
    public ResponseEntity<List<QuestionCategoryResponse>> getCategories(@RequestParam Long institutionId) {
        return ResponseEntity.ok(questionBankService.getCategories(institutionId));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_MANAGE')")
    public ResponseEntity<QuestionCategoryResponse> createCategory(
            @RequestBody QuestionCategoryResponse request,
            @RequestParam Long institutionId) {
        return ResponseEntity.ok(questionBankService.createCategory(request, institutionId));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_MANAGE')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        questionBankService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // --- Questions ---

    @PostMapping("/questions")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_MANAGE')")
    public ResponseEntity<QuestionResponse> createQuestion(
            @Valid @RequestBody QuestionRequest request,
            Principal principal) {
        return ResponseEntity.ok(questionBankService.createQuestion(request, principal.getName()));
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_MANAGE')")
    public ResponseEntity<QuestionResponse> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {
        return ResponseEntity.ok(questionBankService.updateQuestion(id, request));
    }

    @GetMapping("/questions/{id}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_VIEW')")
    public ResponseEntity<QuestionResponse> getQuestion(@PathVariable Long id) {
        return ResponseEntity.ok(questionBankService.getQuestion(id));
    }

    @GetMapping("/questions/subject/{subjectId}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_VIEW')")
    public ResponseEntity<List<QuestionResponse>> getBySubject(@PathVariable Long subjectId) {
        return ResponseEntity.ok(questionBankService.getBySubject(subjectId));
    }

    @GetMapping("/questions/category/{categoryId}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_VIEW')")
    public ResponseEntity<List<QuestionResponse>> getByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(questionBankService.getByCategory(categoryId));
    }

    @GetMapping("/questions/search")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_VIEW')")
    public ResponseEntity<List<QuestionResponse>> search(
            @RequestParam Long institutionId,
            @RequestParam String q) {
        return ResponseEntity.ok(questionBankService.search(institutionId, q));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_MANAGE')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        questionBankService.deactivate(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/{institutionId}")
    @PreAuthorize("hasAuthority('BANCO_PREGUNTAS_VIEW')")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long institutionId) {
        return ResponseEntity.ok(questionBankService.getStats(institutionId));
    }
}
