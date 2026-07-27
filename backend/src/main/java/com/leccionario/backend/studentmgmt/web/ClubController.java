package com.leccionario.backend.studentmgmt.web;

import com.leccionario.backend.studentmgmt.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) { this.clubService = clubService; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Club club) { return ResponseEntity.ok(clubService.create(club)); }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Club club) { return ResponseEntity.ok(clubService.update(id, club)); }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { clubService.delete(id); return ResponseEntity.ok().build(); }

    @GetMapping("/institution/{institutionId}")
    public ResponseEntity<?> findByInstitution(@PathVariable Long institutionId) { return ResponseEntity.ok(clubService.findByInstitution(institutionId)); }

    @GetMapping("/institution/{institutionId}/all")
    public ResponseEntity<?> findAllByInstitution(@PathVariable Long institutionId) { return ResponseEntity.ok(clubService.findAllByInstitution(institutionId)); }

    @PostMapping("/{clubId}/enroll")
    public ResponseEntity<?> enroll(@PathVariable Long clubId, @RequestBody ClubMembership m) { m.setClubId(clubId); return ResponseEntity.ok(clubService.enroll(m)); }

    @DeleteMapping("/memberships/{id}")
    public ResponseEntity<?> unenroll(@PathVariable Long id) { clubService.unenroll(id); return ResponseEntity.ok().build(); }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<?> findMembers(@PathVariable Long clubId) { return ResponseEntity.ok(clubService.findMembers(clubId)); }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> findStudentClubs(@PathVariable Long studentId) { return ResponseEntity.ok(clubService.findStudentClubs(studentId)); }

    @GetMapping("/{clubId}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long clubId) { return ResponseEntity.ok(clubService.getStats(clubId)); }
}
