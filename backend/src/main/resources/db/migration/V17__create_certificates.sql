-- V17: Certificados academicos

-- 1. Plantillas de certificados configurables por institucion
CREATE TABLE certificate_templates (
    id                  BIGSERIAL PRIMARY KEY,
    institution_id      BIGINT NOT NULL REFERENCES institutions(id),
    name                VARCHAR(150) NOT NULL,
    template_type       VARCHAR(30) NOT NULL
                        CHECK (template_type IN ('ESTUDIOS', 'NOTAS', 'CONDUCTA', 'PROMOCION', 'OTRO')),
    description         VARCHAR(500),
    header_text         TEXT,
    footer_text         TEXT,
    requires_grades     BOOLEAN NOT NULL DEFAULT FALSE,
    requires_conduct    BOOLEAN NOT NULL DEFAULT FALSE,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cert_template_name_inst UNIQUE (institution_id, name)
);

-- 2. Certificados generados
CREATE TABLE certificates (
    id                      BIGSERIAL PRIMARY KEY,
    institution_id          BIGINT NOT NULL REFERENCES institutions(id),
    template_id             BIGINT NOT NULL REFERENCES certificate_templates(id),
    student_id              BIGINT NOT NULL REFERENCES students(id),
    course_id               BIGINT REFERENCES courses(id),
    academic_period_id      BIGINT REFERENCES academic_periods(id),
    certificate_number      VARCHAR(50) NOT NULL UNIQUE,
    status                  VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                            CHECK (status IN ('DRAFT', 'ISSUED', 'REVOKED')),
    issued_at               TIMESTAMPTZ,
    issued_by               VARCHAR(100),
    valid_until             DATE,
    observations            TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Detalle del certificado: datos academicos incluidos
CREATE TABLE certificate_details (
    id                  BIGSERIAL PRIMARY KEY,
    certificate_id      BIGINT NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    subject_name        VARCHAR(150),
    score               DECIMAL(5,2),
    status              VARCHAR(20),
    observation         VARCHAR(300),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices
CREATE INDEX idx_cert_templates_institution ON certificate_templates(institution_id);
CREATE INDEX idx_certificates_institution ON certificates(institution_id);
CREATE INDEX idx_certificates_student ON certificates(student_id);
CREATE INDEX idx_certificates_template ON certificates(template_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_cert_details_certificate ON certificate_details(certificate_id);

-- Plantillas por defecto para institucion existente
INSERT INTO certificate_templates (institution_id, name, template_type, description, header_text, footer_text, requires_grades, requires_conduct, active)
SELECT id, 'Constancia de Estudios', 'ESTUDIOS', 'Constancia que acredita matricula activa',
    'Se expide la presente constancia a solicitud del interesado para los fines que al mismo convengan.',
    'Documento valido por 90 dias desde su emision.',
    FALSE, FALSE, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE institution_id = institutions.id AND template_type = 'ESTUDIOS');

INSERT INTO certificate_templates (institution_id, name, template_type, description, header_text, footer_text, requires_grades, requires_conduct, active)
SELECT id, 'Certificado de Notas', 'NOTAS', 'Certificado con el historial de calificaciones del periodo',
    'El suscrito Director de la Institucion Educativa certifica que el/la estudiante ha cursado y aprobado las asignaturas del periodo academico con las siguientes calificaciones:',
    'Para constancia y fines legales correspondientes.',
    TRUE, FALSE, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE institution_id = institutions.id AND template_type = 'NOTAS');

INSERT INTO certificate_templates (institution_id, name, template_type, description, header_text, footer_text, requires_grades, requires_conduct, active)
SELECT id, 'Certificado de Conducta', 'CONDUCTA', 'Certificado de comportamiento y disciplina',
    'El suscrito Director certifica la conducta del/la estudiante durante el periodo academico:',
    'Documento que acredita el comportamiento del estudiante.',
    FALSE, TRUE, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE institution_id = institutions.id AND template_type = 'CONDUCTA');

INSERT INTO certificate_templates (institution_id, name, template_type, description, header_text, footer_text, requires_grades, requires_conduct, active)
SELECT id, 'Certificado de Promocion', 'PROMOCION', 'Certificado de promocion de nivel',
    'El suscrito Director certifica que el/la estudiante ha sido promovido(a) satisfactoriamente al siguiente nivel educativo:',
    'Felicitaciones por su logro academico.',
    TRUE, FALSE, TRUE
FROM institutions
WHERE NOT EXISTS (SELECT 1 FROM certificate_templates WHERE institution_id = institutions.id AND template_type = 'PROMOCION');
