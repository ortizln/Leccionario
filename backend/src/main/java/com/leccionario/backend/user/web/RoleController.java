package com.leccionario.backend.user.web;

import com.leccionario.backend.user.dto.RoleCreateRequest;
import com.leccionario.backend.user.dto.RoleResponse;
import com.leccionario.backend.user.dto.RoleUpdateRequest;
import com.leccionario.backend.user.service.RoleService;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    public ResponseEntity<List<RoleResponse>> getRoles() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ResponseEntity<RoleResponse> createRole(
            @Valid @RequestBody RoleCreateRequest request,
            Principal principal) {
        return ResponseEntity.ok(roleService.create(request, principal.getName()));
    }

    @PutMapping("/{roleName}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable String roleName,
            @Valid @RequestBody RoleUpdateRequest request,
            Principal principal) {
        return ResponseEntity.ok(roleService.update(roleName, request, principal.getName()));
    }

    @DeleteMapping("/{roleName}")
    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public ResponseEntity<Void> deleteRole(@PathVariable String roleName, Principal principal) {
        roleService.delete(roleName, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
