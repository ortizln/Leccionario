package com.leccionario.backend.user.web;

import com.leccionario.backend.user.dto.InstitutionOptionResponse;
import com.leccionario.backend.user.dto.UserPasswordResetRequest;
import com.leccionario.backend.user.dto.UserRequest;
import com.leccionario.backend.user.dto.UserResponse;
import com.leccionario.backend.user.dto.UserStatusUpdateRequest;
import com.leccionario.backend.user.dto.UserUpdateRequest;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.user.service.UserService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<List<UserResponse>> getUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/institutions")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<List<InstitutionOptionResponse>> getInstitutions() {
        return ResponseEntity.ok(userService.findInstitutions());
    }

    @GetMapping("/import-template")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public ResponseEntity<ByteArrayResource> downloadImportTemplate() {
        byte[] file = userService.exportImportTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=usuarios-plantilla.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new ByteArrayResource(file));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request, Principal principal) {
        return ResponseEntity.ok(userService.create(request, principal.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(userService.update(id, request, principal.getName()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<UserResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody UserStatusUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(userService.updateStatus(id, request, principal.getName()));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<UserResponse> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody UserPasswordResetRequest request,
            Principal principal) {
        return ResponseEntity.ok(userService.resetPassword(id, request, principal.getName()));
    }

    @PostMapping("/import")
    @PreAuthorize("hasAuthority('USER_MANAGE')")
    public ResponseEntity<ImportSummaryResponse> importUsers(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        return ResponseEntity.ok(userService.importUsers(file, principal.getName()));
    }
}
