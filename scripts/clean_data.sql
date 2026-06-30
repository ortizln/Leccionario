-- ============================================================
-- Script: Limpiar datos transaccionales
-- Mantiene: academic_years, subjects, schedule_blocks, roles,
--           institutions, school_days, school_modalities,
--           demerit_categories, demerit_faltas, branding
-- ============================================================

-- TIER 1: Hojas (nada mas depende de estas)
DELETE FROM evaluations;
DELETE FROM week_student_assignments;
DELETE FROM course_schedules;
DELETE FROM student_demer_details;
DELETE FROM demerit_evidences;
DELETE FROM demerit_status_history;
DELETE FROM student_demers;
DELETE FROM student_demerits;

-- TIER 2: Hijos de daily_logs (CASCADE borra entries/signatures/absences/incidents)
DELETE FROM daily_logs;

-- TIER 3: Lesson plans
DELETE FROM lesson_plans;

-- TIER 4: Representantes (student_id es Long plano, sin FK formal)
DELETE FROM representatives;

-- TIER 5: Break cyclo courses <-> students
UPDATE courses SET week_student_id = NULL;

-- TIER 6: Core entities
DELETE FROM students;
DELETE FROM teachers;
DELETE FROM user_roles;
DELETE FROM users;
DELETE FROM courses;

-- Reset secuencias
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS students_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS teachers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS courses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS representatives_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS course_schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS week_student_assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS daily_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS lesson_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS student_demers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS student_demerits_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS evaluations_id_seq RESTART WITH 1;
