package com.leccionario.backend.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) { this.aiService = aiService; }

    @GetMapping("/models")
    public ResponseEntity<List<AiModel>> findAllModels(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.findAllModels(institutionId));
    }

    @PostMapping("/models")
    public ResponseEntity<AiModel> createModel(@RequestBody AiModel model) {
        return ResponseEntity.ok(aiService.createModel(model));
    }

    @DeleteMapping("/models/{id}")
    public ResponseEntity<Void> deleteModel(@PathVariable Long id) {
        aiService.deleteModel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/predictions/student/{studentId}")
    public ResponseEntity<List<AiPrediction>> getStudentPredictions(@PathVariable Long studentId) {
        return ResponseEntity.ok(aiService.getStudentPredictions(studentId));
    }

    @PostMapping("/predictions")
    public ResponseEntity<AiPrediction> createPrediction(@RequestBody AiPrediction pred) {
        return ResponseEntity.ok(aiService.createPrediction(pred));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<AiRecommendation>> getRecommendations(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getRecommendations(institutionId));
    }

    @GetMapping("/recommendations/pending")
    public ResponseEntity<List<AiRecommendation>> getPendingRecommendations(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getPendingRecommendations(institutionId));
    }

    @PostMapping("/recommendations/{id}/apply")
    public ResponseEntity<AiRecommendation> applyRecommendation(@PathVariable Long id) {
        return ResponseEntity.ok(aiService.applyRecommendation(id));
    }

    @PostMapping("/recommendations/{id}/dismiss")
    public ResponseEntity<Void> dismissRecommendation(@PathVariable Long id) {
        aiService.dismissRecommendation(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recommendations/stats")
    public ResponseEntity<Map<String, Object>> getRecommendationStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getRecommendationStats(institutionId));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<AiAnomaly>> getAnomalies(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getAnomalies(institutionId));
    }

    @GetMapping("/anomalies/critical")
    public ResponseEntity<List<AiAnomaly>> getCriticalAnomalies() {
        return ResponseEntity.ok(aiService.getCriticalAnomalies());
    }

    @PostMapping("/anomalies/{id}/resolve")
    public ResponseEntity<AiAnomaly> resolveAnomaly(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(aiService.resolveAnomaly(id, body.get("notes")));
    }

    @GetMapping("/profiles/{studentId}")
    public ResponseEntity<AiStudentProfile> getStudentProfile(@PathVariable Long studentId, @RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getStudentProfile(studentId, institutionId));
    }

    @GetMapping("/profiles/high-risk")
    public ResponseEntity<List<AiStudentProfile>> getHighRiskStudents(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getHighRiskStudents(institutionId));
    }

    @PostMapping("/analyze/{studentId}")
    public ResponseEntity<AiStudentProfile> analyzeStudent(@PathVariable Long studentId, @RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.analyzeStudent(studentId, institutionId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getInstitutionStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getInstitutionStats(institutionId));
    }

    @PostMapping("/analyze/bulk")
    public ResponseEntity<Map<String, Object>> analyzeAllStudents(@RequestParam Long institutionId) {
        List<Long> studentIds = aiService.getAllStudentIds(institutionId);
        int analyzed = 0;
        for (Long sid : studentIds) {
            try { aiService.analyzeStudent(sid, institutionId); analyzed++; } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(Map.of("total", studentIds.size(), "analyzed", analyzed));
    }

    @GetMapping("/predictions/stats")
    public ResponseEntity<Map<String, Object>> getPredictionStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(aiService.getPredictionStats(institutionId));
    }
}
