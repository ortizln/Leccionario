-- Reemplazar constraint de unicidad: ahora incluye sub_level
ALTER TABLE courses DROP CONSTRAINT IF EXISTS uk_course_grade_parallel_year;
ALTER TABLE courses ADD CONSTRAINT uk_course_sublevel_grade_parallel_year
    UNIQUE (sub_level, grade, parallel, academic_year_id);
