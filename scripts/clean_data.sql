-- ============================================================================
-- LECCIONARIO - Limpieza de datos de transacción
-- Conserva: academic_years, subjects, schedule_blocks, roles, institutions,
--           school_days, school_modalities, demerit_categories, demerit_faltas,
--           branding, behavior_categories, behavior_offenses, demerits
-- ============================================================================

TRUNCATE TABLE
    payroll_entries,
    payrolls,
    ai_student_profiles,
    ai_anomalies,
    ai_recommendations,
    ai_predictions,
    ai_models,
    communication_group_members,
    communication_groups,
    parent_communications,
    message_recipients,
    internal_messages,
    notifications,
    notification_templates,
    book_reservations,
    book_loans,
    books,
    book_categories,
    asset_maintenances,
    asset_assignments,
    assets,
    asset_categories,
    credit_notes,
    accounts_receivable,
    tuition_payments,
    student_tuitions,
    tuition_plans,
    invoice_items,
    invoices,
    cash_transactions,
    cash_registers,
    transport_assignments,
    transport_routes,
    club_memberships,
    clubs,
    scholarship_applications,
    scholarship_types,
    student_insurance,
    student_vaccinations,
    student_health_records,
    training_enrollments,
    training_courses,
    staff_permissions,
    vacation_requests,
    vacation_periods,
    employment_contracts,
    employees,
    institution_settings,
    school_calendar_events,
    classrooms,
    shifts,
    campus,
    dece_follow_ups,
    dece_cases,
    curricular_adaptations,
    special_needs,
    enrollments,
    questions,
    question_categories,
    tutoring_follow_ups,
    tutoring_sessions,
    student_merits,
    merit_categories,
    certificate_details,
    certificates,
    report_card_details,
    report_cards,
    grade_history,
    period_grades,
    grades,
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
ALTER SEQUENCE payroll_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE payrolls_id_seq RESTART WITH 1;
ALTER SEQUENCE ai_student_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE ai_anomalies_id_seq RESTART WITH 1;
ALTER SEQUENCE ai_recommendations_id_seq RESTART WITH 1;
ALTER SEQUENCE ai_predictions_id_seq RESTART WITH 1;
ALTER SEQUENCE ai_models_id_seq RESTART WITH 1;
ALTER SEQUENCE communication_group_members_id_seq RESTART WITH 1;
ALTER SEQUENCE communication_groups_id_seq RESTART WITH 1;
ALTER SEQUENCE parent_communications_id_seq RESTART WITH 1;
ALTER SEQUENCE message_recipients_id_seq RESTART WITH 1;
ALTER SEQUENCE internal_messages_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE notification_templates_id_seq RESTART WITH 1;
ALTER SEQUENCE book_reservations_id_seq RESTART WITH 1;
ALTER SEQUENCE book_loans_id_seq RESTART WITH 1;
ALTER SEQUENCE books_id_seq RESTART WITH 1;
ALTER SEQUENCE book_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE asset_maintenances_id_seq RESTART WITH 1;
ALTER SEQUENCE asset_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE assets_id_seq RESTART WITH 1;
ALTER SEQUENCE asset_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE credit_notes_id_seq RESTART WITH 1;
ALTER SEQUENCE accounts_receivable_id_seq RESTART WITH 1;
ALTER SEQUENCE tuition_payments_id_seq RESTART WITH 1;
ALTER SEQUENCE student_tuitions_id_seq RESTART WITH 1;
ALTER SEQUENCE tuition_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE invoice_items_id_seq RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE cash_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE cash_registers_id_seq RESTART WITH 1;
ALTER SEQUENCE transport_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE transport_routes_id_seq RESTART WITH 1;
ALTER SEQUENCE club_memberships_id_seq RESTART WITH 1;
ALTER SEQUENCE clubs_id_seq RESTART WITH 1;
ALTER SEQUENCE scholarship_applications_id_seq RESTART WITH 1;
ALTER SEQUENCE scholarship_types_id_seq RESTART WITH 1;
ALTER SEQUENCE student_insurance_id_seq RESTART WITH 1;
ALTER SEQUENCE student_vaccinations_id_seq RESTART WITH 1;
ALTER SEQUENCE student_health_records_id_seq RESTART WITH 1;
ALTER SEQUENCE training_enrollments_id_seq RESTART WITH 1;
ALTER SEQUENCE training_courses_id_seq RESTART WITH 1;
ALTER SEQUENCE staff_permissions_id_seq RESTART WITH 1;
ALTER SEQUENCE vacation_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE vacation_periods_id_seq RESTART WITH 1;
ALTER SEQUENCE employment_contracts_id_seq RESTART WITH 1;
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE institution_settings_id_seq RESTART WITH 1;
ALTER SEQUENCE school_calendar_events_id_seq RESTART WITH 1;
ALTER SEQUENCE classrooms_id_seq RESTART WITH 1;
ALTER SEQUENCE shifts_id_seq RESTART WITH 1;
ALTER SEQUENCE campus_id_seq RESTART WITH 1;
ALTER SEQUENCE dece_follow_ups_id_seq RESTART WITH 1;
ALTER SEQUENCE dece_cases_id_seq RESTART WITH 1;
ALTER SEQUENCE curricular_adaptations_id_seq RESTART WITH 1;
ALTER SEQUENCE special_needs_id_seq RESTART WITH 1;
ALTER SEQUENCE enrollments_id_seq RESTART WITH 1;
ALTER SEQUENCE questions_id_seq RESTART WITH 1;
ALTER SEQUENCE question_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE tutoring_follow_ups_id_seq RESTART WITH 1;
ALTER SEQUENCE tutoring_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE student_merits_id_seq RESTART WITH 1;
ALTER SEQUENCE merit_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE certificate_details_id_seq RESTART WITH 1;
ALTER SEQUENCE certificates_id_seq RESTART WITH 1;
ALTER SEQUENCE report_card_details_id_seq RESTART WITH 1;
ALTER SEQUENCE report_cards_id_seq RESTART WITH 1;
ALTER SEQUENCE grade_history_id_seq RESTART WITH 1;
ALTER SEQUENCE period_grades_id_seq RESTART WITH 1;
ALTER SEQUENCE grades_id_seq RESTART WITH 1;
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

-- Limpiar feriados
DELETE FROM holidays;
ALTER SEQUENCE holidays_id_seq RESTART WITH 1;

-- Refrescar la vista materializada
REFRESH MATERIALIZED VIEW demerit_accumulated;
REFRESH MATERIALIZED VIEW v_dashboard_courses;
REFRESH MATERIALIZED VIEW v_dashboard_enrollments;
REFRESH MATERIALIZED VIEW v_dashboard_finance;
REFRESH MATERIALIZED VIEW v_dashboard_assets;
REFRESH MATERIALIZED VIEW v_dashboard_library;

-- Limpiar usuarios excepto admin
DELETE FROM user_roles WHERE user_id != 1;
DELETE FROM users WHERE id != 1;

SELECT 'Limpieza completada. Datos de referencia conservados.' AS resultado;
