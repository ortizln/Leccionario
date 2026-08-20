package com.leccionario.backend.user.service;

import com.leccionario.backend.audit.service.AuditService;
import com.leccionario.backend.common.excel.ExcelSupport;
import com.leccionario.backend.common.excel.ImportSummaryResponse;
import com.leccionario.backend.common.exception.BusinessException;
import com.leccionario.backend.common.exception.ResourceNotFoundException;
import com.leccionario.backend.institution.domain.Institution;
import com.leccionario.backend.institution.repository.InstitutionRepository;
import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.dto.InstitutionOptionResponse;
import com.leccionario.backend.user.dto.UserPasswordResetRequest;
import com.leccionario.backend.user.dto.UserRequest;
import com.leccionario.backend.user.dto.UserResponse;
import com.leccionario.backend.user.dto.UserStatusUpdateRequest;
import com.leccionario.backend.user.dto.UserUpdateRequest;
import com.leccionario.backend.user.mapper.UserMapper;
import com.leccionario.backend.user.repository.RoleRepository;
import com.leccionario.backend.user.repository.TeacherRepository;
import com.leccionario.backend.user.repository.UserRepository;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final TeacherRepository teacherRepository;
    private final AuditService auditService;

    @Transactional
    public UserResponse create(UserRequest request, String actor) {
        User user = new User();
        applyUserData(user, request.username(), request.email(), request.password(), request.identification(),
                request.firstName(), request.lastName(), request.institutionId(), request.enabled(), request.roles());

        User saved = userRepository.save(user);
        auditService.log(actor, "CREATE", "USER", "Usuario creado: " + saved.getUsername());
        return toResponse(saved);
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request, String actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        applyUserData(user, request.username(), request.email(), request.password(), request.identification(),
                request.firstName(), request.lastName(), request.institutionId(), request.enabled(), request.roles());

        User saved = userRepository.save(user);
        auditService.log(actor, "UPDATE", "USER", "Usuario actualizado: " + saved.getUsername());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(User::getUsername))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<InstitutionOptionResponse> findInstitutions() {
        return institutionRepository.findAll().stream()
                .sorted(java.util.Comparator.comparing(Institution::getName))
                .map(institution -> new InstitutionOptionResponse(institution.getId(), institution.getName()))
                .toList();
    }

    @Transactional
    public UserResponse updateStatus(Long id, UserStatusUpdateRequest request, String actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        user.setEnabled(request.enabled());
        User saved = userRepository.save(user);
        auditService.log(actor, request.enabled() ? "ENABLE" : "DISABLE", "USER", "Estado actualizado para: " + saved.getUsername());
        return toResponse(saved);
    }

    @Transactional
    public UserResponse resetPassword(Long id, UserPasswordResetRequest request, String actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        auditService.log(actor, "RESET_PASSWORD", "USER", "Clave restablecida para: " + saved.getUsername());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public byte[] exportImportTemplate() {
        Workbook workbook = ExcelSupport.newWorkbook();
        Sheet sheet = workbook.createSheet("usuarios");
        ExcelSupport.writeHeaders(sheet,
                "username",
                "email",
                "password",
                "identification",
                "firstName",
                "lastName",
                "institutionName",
                "enabled",
                "roles");

        var sample = sheet.createRow(1);
        sample.createCell(0).setCellValue("nuevo.usuario");
        sample.createCell(1).setCellValue("nuevo.usuario@leccionario.local");
        sample.createCell(2).setCellValue("Temp123*");
        sample.createCell(3).setCellValue("0102030406");
        sample.createCell(4).setCellValue("Nuevo");
        sample.createCell(5).setCellValue("Usuario");
        sample.createCell(6).setCellValue(institutionRepository.findAll().stream().findFirst().map(Institution::getName).orElse("Unidad Educativa Fiscal Demo"));
        sample.createCell(7).setCellValue("true");
        sample.createCell(8).setCellValue("ROLE_DOCENTE");

        Sheet catalog = workbook.createSheet("catalogos");
        ExcelSupport.writeHeaders(catalog, "instituciones", "roles");
        int max = Math.max(institutionRepository.findAll().size(), roleRepository.findAll().size());
        for (int index = 0; index < max; index++) {
            var row = catalog.createRow(index + 1);
            if (index < institutionRepository.findAll().size()) {
                row.createCell(0).setCellValue(institutionRepository.findAll().get(index).getName());
            }
            if (index < roleRepository.findAll().size()) {
                row.createCell(1).setCellValue(roleRepository.findAll().get(index).getName());
            }
        }

        ExcelSupport.autoSize(sheet, 9);
        ExcelSupport.autoSize(catalog, 2);
        return ExcelSupport.toBytes(workbook);
    }

    @Transactional
    public ImportSummaryResponse importUsers(MultipartFile file, String actor) {
        Workbook workbook = ExcelSupport.openWorkbook(file);
        Sheet sheet = workbook.getSheetAt(0);
        int imported = 0;
        int total = 0;
        List<String> errors = new java.util.ArrayList<>();

        for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            var row = sheet.getRow(rowIndex);
            if (row == null || ExcelSupport.rowIsEmpty(row, 9)) {
                continue;
            }
            total++;
            int excelRow = rowIndex + 1;
            try {
                String institutionName = ExcelSupport.getString(row, 6);
                Institution institution = institutionRepository.findByNameIgnoreCase(institutionName)
                        .orElseThrow(() -> new BusinessException("No existe la institucion '" + institutionName + "'"));
                String rolesCell = ExcelSupport.getString(row, 8);
                Set<String> roles = java.util.Arrays.stream(rolesCell.split("[,;|]"))
                        .map(String::trim)
                        .filter(value -> !value.isBlank())
                        .collect(Collectors.toSet());

                create(new UserRequest(
                        ExcelSupport.getString(row, 0),
                        ExcelSupport.getString(row, 1),
                        ExcelSupport.getString(row, 2),
                        ExcelSupport.getString(row, 3),
                        ExcelSupport.getString(row, 4),
                        ExcelSupport.getString(row, 5),
                        institution.getId(),
                        ExcelSupport.getBoolean(row, 7, true),
                        roles), actor);
                imported++;
            } catch (Exception exception) {
                errors.add("Fila " + excelRow + ": " + exception.getMessage());
            }
        }

        return new ImportSummaryResponse(
                "USERS",
                total,
                imported,
                errors.size(),
                errors.isEmpty()
                        ? "Usuarios importados correctamente."
                        : "Importacion completada con observaciones en usuarios.",
                errors);
    }

    private void applyUserData(
            User user,
            String username,
            String email,
            String password,
            String identification,
            String firstName,
            String lastName,
            Long institutionId,
            boolean enabled,
            java.util.Set<String> roles) {
        user.setUsername(username);
        user.setEmail(email);
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        user.setIdentification(identification);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(enabled);
        user.setInstitution(institutionRepository.findById(institutionId)
                .orElseThrow(() -> new ResourceNotFoundException("Institución no encontrada")));
        user.setRoles(roles.stream()
                .map(com.leccionario.backend.user.domain.RoleDefaults::normalize)
                .map(roleName -> roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + roleName)))
                .collect(Collectors.toSet()));
    }

    private UserResponse toResponse(User user) {
        UserResponse base = userMapper.toResponse(user);
        String specialization = teacherRepository.findByUserId(user.getId())
                .map(teacher -> teacher.getSpecialization())
                .orElse(null);
        return new UserResponse(
                base.id(),
                base.username(),
                base.email(),
                base.identification(),
                base.firstName(),
                base.lastName(),
                base.enabled(),
                base.institutionId(),
                base.institutionName(),
                specialization,
                base.roles());
    }
}
