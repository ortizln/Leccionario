package com.leccionario.backend.search.web;

import com.leccionario.backend.search.SearchService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('USER_VIEW','ACADEMIC_VIEW','FINANCE_VIEW','HR_VIEW','LIBRARY_VIEW','ASSET_VIEW')")
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") Long institutionId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(searchService.search(q, institutionId, limit));
    }
}
