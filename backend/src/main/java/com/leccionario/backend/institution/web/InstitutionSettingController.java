package com.leccionario.backend.institution.web;

import com.leccionario.backend.institution.domain.InstitutionSetting;
import com.leccionario.backend.institution.service.InstitutionSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/institution/settings")
public class InstitutionSettingController {

    private final InstitutionSettingService settingService;

    public InstitutionSettingController(InstitutionSettingService settingService) {
        this.settingService = settingService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InstitutionSetting setting) {
        return ResponseEntity.ok(settingService.create(setting));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody InstitutionSetting setting) {
        return ResponseEntity.ok(settingService.update(id, setting));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        settingService.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) {
        return ResponseEntity.ok(settingService.findByInstitution(institutionId));
    }

    @GetMapping("/institution/{institutionId}/category/{category}")
    public ResponseEntity<?> findByCategory(@PathVariable Long institutionId, @PathVariable String category) {
        return ResponseEntity.ok(settingService.findByCategory(institutionId, category));
    }

    @GetMapping("/institution/{institutionId}/key/{key}")
    public ResponseEntity<?> findByKey(@PathVariable Long institutionId, @PathVariable String key) {
        return ResponseEntity.ok(settingService.findByKey(institutionId, key));
    }

    @GetMapping("/institution/{institutionId}/map")
    public ResponseEntity<Map<String, String>> getSettingsMap(@PathVariable Long institutionId) {
        return ResponseEntity.ok(settingService.getSettingsMap(institutionId));
    }

    @PostMapping("/institution/{institutionId}/batch")
    public ResponseEntity<?> saveBatch(@PathVariable Long institutionId, @RequestBody List<InstitutionSetting> settings) {
        settingService.saveBatch(institutionId, settings);
        return ResponseEntity.ok().build();
    }
}
