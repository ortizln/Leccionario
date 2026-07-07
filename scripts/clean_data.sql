-- ============================================================================
-- LECCIONARIO - Limpieza de datos de transacción
-- Conserva: academic_years, subjects, schedule_blocks, roles, institutions,
--           school_days, school_modalities, demerit_categories, demerit_faltas,
--           branding, behavior_categories, behavior_offenses, demerits
-- ============================================================================

TRUNCATE TABLE
    evaluations,
    demerit_status_history,
    demerit_evidences,
    student_demer_details,
    student_demers,
    announcement_recipients,
    announcement_schedules,
    announcements,
    daily_log_student_incidents,
    daily_log_student_absences,
    daily_log_signatures,
    daily_log_entries,
    daily_logs,
    lesson_plans,
    student_demerits,
    week_student_assignments,
    students,
    teachers,
    teacher_courses,
    teacher_subjects,
    representatives,
    course_schedules,
    courses
CASCADE;

-- Resetear secuencias
ALTER SEQUENCE evaluations_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_log_student_incidents_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_log_student_absences_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_log_signatures_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_log_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE lesson_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE student_demerits_id_seq RESTART WITH 1;
ALTER SEQUENCE week_student_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE students_id_seq RESTART WITH 1;
ALTER SEQUENCE teachers_id_seq RESTART WITH 1;
ALTER SEQUENCE representatives_id_seq RESTART WITH 1;
ALTER SEQUENCE course_schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE student_demers_id_seq RESTART WITH 1;
ALTER SEQUENCE student_demer_details_id_seq RESTART WITH 1;
ALTER SEQUENCE demerit_evidences_id_seq RESTART WITH 1;
ALTER SEQUENCE demerit_status_history_id_seq RESTART WITH 1;
ALTER SEQUENCE announcements_id_seq RESTART WITH 1;
ALTER SEQUENCE announcement_recipients_id_seq RESTART WITH 1;
ALTER SEQUENCE announcement_schedules_id_seq RESTART WITH 1;

-- Refrescar la vista materializada
REFRESH MATERIALIZED VIEW demerit_accumulated;

-- Limpiar usuarios excepto admin
DELETE FROM user_roles WHERE user_id != 1;
DELETE FROM users WHERE id != 1;

SELECT 'Limpieza completada. Datos de referencia conservados.' AS resultado;
