-- V18: Meritos (comportamiento positivo) + Vista de conducta

-- 1. Categorias de merito
CREATE TABLE merit_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL REFERENCES institutions(id),
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(300),
    merit_points    INTEGER NOT NULL DEFAULT 1,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_merit_category_name_inst UNIQUE (institution_id, name)
);

-- 2. Meritos registrados
CREATE TABLE student_merits (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    student_id          BIGINT NOT NULL REFERENCES students(id),
    course_id           BIGINT NOT NULL REFERENCES courses(id),
    academic_period_id  BIGINT NOT NULL REFERENCES academic_periods(id),
    category_id         BIGINT NOT NULL REFERENCES merit_categories(id),
    merit_date          DATE NOT NULL,
    points              INTEGER NOT NULL DEFAULT 1,
    description         VARCHAR(500),
    registered_by       VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Vista consolidada de conducta (meritos + demeritos)
CREATE OR REPLACE VIEW v_student_conduct AS
SELECT
    s.id AS student_id,
    u.first_name || ' ' || u.last_name AS student_name,
    s.enrollment_number,
    c.id AS course_id,
    c.name AS course_name,
    ap.id AS period_id,
    ap.name AS period_name,
    COALESCE(merit.total_points, 0) AS merit_points,
    COALESCE(demerit.total_points, 0) AS demerit_points,
    COALESCE(merit.total_points, 0) - COALESCE(demerit.total_points, 0) AS conduct_balance,
    COALESCE(merit.merit_count, 0) AS merit_count,
    COALESCE(demerit.demerit_count, 0) AS demerit_count
FROM students s
JOIN users u ON u.id = s.user_id
JOIN courses c ON c.id = s.course_id
JOIN academic_periods ap ON ap.active = TRUE
LEFT JOIN (
    SELECT sm.student_id, sm.course_id, sm.academic_period_id,
           SUM(sm.points) AS total_points, COUNT(*) AS merit_count
    FROM student_merits sm
    GROUP BY sm.student_id, sm.course_id, sm.academic_period_id
) merit ON merit.student_id = s.id AND merit.course_id = c.id AND merit.academic_period_id = ap.id
LEFT JOIN (
    SELECT sd.student_id, sd.course_id, sd.academic_period_id,
           SUM(df.demerit_points) AS total_points, COUNT(*) AS demerit_count
    FROM student_demers sd
    JOIN student_demer_details sdd ON sdd.student_demer_id = sd.id
    JOIN demerit_faltas df ON df.id = sdd.falta_id
    WHERE sd.status = 'ACTIVE'
    GROUP BY sd.student_id, sd.course_id, sd.academic_period_id
) demerit ON demerit.student_id = s.id AND demerit.course_id = c.id AND demerit.academic_period_id = ap.id;

-- Indices
CREATE INDEX idx_merit_categories_institution ON merit_categories(institution_id);
CREATE INDEX idx_student_merits_student ON student_merits(student_id);
CREATE INDEX idx_student_merits_course ON student_merits(course_id);
CREATE INDEX idx_student_merits_period ON student_merits(academic_period_id);
CREATE INDEX idx_student_merits_date ON student_merits(merit_date);
CREATE INDEX idx_student_merits_category ON student_merits(category_id);

-- Categorias de merito por defecto
INSERT INTO merit_categories (institution_id, name, description, merit_points, active)
SELECT id, 'Excelencia Academica', 'Logros destacados en el area academica', 3, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM merit_categories WHERE institution_id = institutions.id AND name = 'Excelencia Academica');

INSERT INTO merit_categories (institution_id, name, description, merit_points, active)
SELECT id, 'Participacion', 'Participacion activa en actividades escolares', 1, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM merit_categories WHERE institution_id = institutions.id AND name = 'Participacion');

INSERT INTO merit_categories (institution_id, name, description, merit_points, active)
SELECT id, 'Liderazgo', 'Demonstracion de cualidades de liderazgo', 2, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM merit_categories WHERE institution_id = institutions.id AND name = 'Liderazgo');

INSERT INTO merit_categories (institution_id, name, description, merit_points, active)
SELECT id, 'Conducta Ejemplar', 'Comportamiento exemplar en el instituto', 2, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM merit_categories WHERE institution_id = institutions.id AND name = 'Conducta Ejemplar');

INSERT INTO merit_categories (institution_id, name, description, merit_points, active)
SELECT id, 'Deportes', 'Logros destacados en actividades deportivas', 2, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM merit_categories WHERE institution_id = institutions.id AND name = 'Deportes');

INSERT INTO merit_categories (institution_id, name, description, merit_points, active)
SELECT id, 'Arte y Cultura', 'Participacion en actividades artisticas y culturales', 2, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM merit_categories WHERE institution_id = institutions.id AND name = 'Arte y Cultura');
