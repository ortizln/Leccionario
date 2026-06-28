-- =============================================
-- V9: Rediseño completo del módulo de deméritos
-- =============================================

-- 1. Categorías de demérito (grupos grandes)
CREATE TABLE IF NOT EXISTS demerit_categories (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     VARCHAR(500),
    display_order   SMALLINT NOT NULL DEFAULT 0,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Faltas (cada registro es una falta con código, descripción y ponderación)
CREATE TABLE IF NOT EXISTS demerit_faltas (
    id                          BIGSERIAL PRIMARY KEY,
    category_id                 BIGINT NOT NULL REFERENCES demerit_categories(id),
    code                        VARCHAR(20) NOT NULL,
    description                 VARCHAR(500) NOT NULL,
    score                       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 100),
    severity                    VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (severity IN ('LEVE','MEDIA','GRAVE','MUY_GRAVE')),
    requires_observation        BOOLEAN NOT NULL DEFAULT FALSE,
    requires_evidence           BOOLEAN NOT NULL DEFAULT FALSE,
    requires_representative     BOOLEAN NOT NULL DEFAULT FALSE,
    active                      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_falta_category_code UNIQUE (category_id, code)
);

-- 3. Registro principal de demérito estudiantil
CREATE TABLE IF NOT EXISTS student_demers (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL REFERENCES students(id),
    period_id       BIGINT NOT NULL REFERENCES academic_periods(id),
    course_id       BIGINT REFERENCES courses(id),
    teacher_id      BIGINT REFERENCES teachers(id),
    log_date        DATE NOT NULL,
    observation     VARCHAR(1000),
    total_score     SMALLINT NOT NULL DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'CREADO' CHECK (status IN ('CREADO','VALIDADO','APELADO','ANULADO','APROBADO')),
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Detalle: una incidencia puede incluir varias faltas
CREATE TABLE IF NOT EXISTS student_demer_details (
    id                      BIGSERIAL PRIMARY KEY,
    student_demer_id        BIGINT NOT NULL REFERENCES student_demers(id) ON DELETE CASCADE,
    falta_id                BIGINT NOT NULL REFERENCES demerit_faltas(id),
    quantity                SMALLINT NOT NULL DEFAULT 1,
    score                   SMALLINT NOT NULL,
    subtotal                SMALLINT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Evidencias (fotos, pdfs, documentos)
CREATE TABLE IF NOT EXISTS demerit_evidences (
    id              BIGSERIAL PRIMARY KEY,
    student_demer_id BIGINT NOT NULL REFERENCES student_demers(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    file_type       VARCHAR(50),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Historial de estados
CREATE TABLE IF NOT EXISTS demerit_status_history (
    id              BIGSERIAL PRIMARY KEY,
    student_demer_id BIGINT NOT NULL REFERENCES student_demers(id) ON DELETE CASCADE,
    changed_by      VARCHAR(100) NOT NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    previous_status VARCHAR(30),
    new_status      VARCHAR(30) NOT NULL,
    notes           VARCHAR(500)
);

-- 7. Acumulado por estudiante por periodo (materialized view)
CREATE MATERIALIZED VIEW IF NOT EXISTS demerit_accumulated AS
SELECT
    sd.student_id,
    sd.period_id,
    COUNT(*)                              AS total_incidents,
    COALESCE(SUM(sd.total_score), 0)      AS total_score,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'GRAVE'
    ))                                    AS grave_count,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'LEVE'
    ))                                    AS leve_count,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'MEDIA'
    ))                                    AS media_count,
    COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM student_demer_details ddd
        JOIN demerit_faltas df ON df.id = ddd.falta_id
        WHERE ddd.student_demer_id = sd.id AND df.severity = 'MUY_GRAVE'
    ))                                    AS muy_grave_count
FROM student_demers sd
WHERE sd.status != 'ANULADO'
GROUP BY sd.student_id, sd.period_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_demerit_accumulated_pk
    ON demerit_accumulated (student_id, period_id);
