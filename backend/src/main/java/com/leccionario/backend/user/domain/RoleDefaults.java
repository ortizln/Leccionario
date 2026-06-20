package com.leccionario.backend.user.domain;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

public final class RoleDefaults {

    public static final String ADMINISTRADOR = "ROLE_ADMINISTRADOR";
    public static final String DOCENTE = "ROLE_DOCENTE";
    public static final String ADMINISTRATIVO = "ROLE_ADMINISTRATIVO";
    public static final String ESTUDIANTE = "ROLE_ESTUDIANTE";

    private RoleDefaults() {
    }

    public static List<String> defaultRoles() {
        return List.of(ADMINISTRADOR, DOCENTE, ADMINISTRATIVO, ESTUDIANTE);
    }

    public static String normalize(String roleName) {
        String normalized = roleName == null ? "" : roleName.trim().toUpperCase().replace(' ', '_');
        return normalized.startsWith("ROLE_") ? normalized : "ROLE_" + normalized;
    }

    public static String description(String roleName) {
        return switch (normalize(roleName)) {
            case ADMINISTRADOR -> "Administra usuarios, perfiles, catalogos y supervision total.";
            case DOCENTE -> "Gestiona el leccionario y consulta informacion academica necesaria para docencia.";
            case ADMINISTRATIVO -> "Consulta modulos institucionales, auditoria y reportes sin modificar leccionarios.";
            case ESTUDIANTE -> "Perfil de consulta restringida para futuras funciones estudiantiles.";
            default -> "Perfil personalizado del sistema.";
        };
    }

    public static Set<PermissionCode> permissions(String roleName) {
        return switch (normalize(roleName)) {
            case ADMINISTRADOR -> EnumSet.of(
                    PermissionCode.USER_VIEW,
                    PermissionCode.USER_MANAGE,
                    PermissionCode.ROLE_VIEW,
                    PermissionCode.ROLE_MANAGE,
                    PermissionCode.ACADEMIC_VIEW,
                    PermissionCode.ACADEMIC_MANAGE,
                    PermissionCode.LESSONPLAN_VIEW,
                    PermissionCode.LESSONPLAN_MANAGE,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.REPORT_EXPORT,
                    PermissionCode.AUDIT_VIEW,
                    PermissionCode.SETTINGS_VIEW,
                    PermissionCode.SETTINGS_MANAGE);
            case DOCENTE -> EnumSet.of(
                    PermissionCode.LESSONPLAN_VIEW,
                    PermissionCode.LESSONPLAN_MANAGE,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.TEACHER_SELF_VIEW);
            case ADMINISTRATIVO -> EnumSet.of(
                    PermissionCode.ACADEMIC_VIEW,
                    PermissionCode.ACADEMIC_MANAGE,
                    PermissionCode.LESSONPLAN_VIEW,
                    PermissionCode.REPORT_VIEW,
                    PermissionCode.REPORT_EXPORT,
                    PermissionCode.AUDIT_VIEW,
                    PermissionCode.SETTINGS_VIEW);
            case ESTUDIANTE -> EnumSet.of(
                    PermissionCode.STUDENT_SELF_VIEW);
            default -> EnumSet.noneOf(PermissionCode.class);
        };
    }
}
