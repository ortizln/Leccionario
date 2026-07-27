-- V30: Inteligencia Artificial - Predicciones, Recomendaciones, Anomalias

CREATE TABLE ai_models (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    model_type      VARCHAR(30) NOT NULL
                    CHECK (model_type IN ('PREDICCION', 'RECOMENDACION', 'ANOMALIA', 'CLASIFICACION')),
    description     TEXT,
    version         VARCHAR(20) NOT NULL DEFAULT '1.0',
    config          JSONB,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                    CHECK (status IN ('ACTIVO', 'INACTIVO', 'ENTRENANDO')),
    last_trained_at TIMESTAMPTZ,
    accuracy        DECIMAL(5,4),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_predictions (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT NOT NULL REFERENCES ai_models(id),
    student_id      BIGINT NOT NULL,
    period_id       BIGINT,
    prediction_type VARCHAR(30) NOT NULL,
    predicted_value VARCHAR(100) NOT NULL,
    confidence      DECIMAL(5,4) NOT NULL,
    input_data      JSONB,
    explanation     TEXT,
    status          VARCHAR(15) NOT NULL DEFAULT 'VIGENTE'
                    CHECK (status IN ('VIGENTE', 'CONFIRMADA', 'RECHAZADA', 'VENCIDA')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT REFERENCES ai_models(id),
    institution_id  BIGINT NOT NULL,
    target_type     VARCHAR(20) NOT NULL CHECK (target_type IN ('ESTUDIANTE', 'DOCENTE', 'CURSO', 'INSTITUCION')),
    target_id       BIGINT,
    category        VARCHAR(30) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    priority        VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                    CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (status IN ('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'APLICADA')),
    applied_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_anomalies (
    id              BIGSERIAL PRIMARY KEY,
    model_id        BIGINT REFERENCES ai_models(id),
    institution_id  BIGINT NOT NULL,
    anomaly_type    VARCHAR(30) NOT NULL,
    entity_type     VARCHAR(20) NOT NULL,
    entity_id       BIGINT NOT NULL,
    description     TEXT NOT NULL,
    severity        VARCHAR(10) NOT NULL DEFAULT 'MEDIA'
                    CHECK (severity IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
    detected_value  VARCHAR(200),
    expected_range  VARCHAR(200),
    status          VARCHAR(15) NOT NULL DEFAULT 'DETECTADA'
                    CHECK (status IN ('DETECTADA', 'INVESTIGANDO', 'RESUELTA', 'FALSO_POSITIVO')),
    resolved_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_student_profiles (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    institution_id  BIGINT NOT NULL,
    academic_risk   DECIMAL(5,4) DEFAULT 0,
    attendance_risk DECIMAL(5,4) DEFAULT 0,
    behavior_score  DECIMAL(5,4) DEFAULT 0,
    engagement_score DECIMAL(5,4) DEFAULT 0,
    learning_style  VARCHAR(30),
    strengths       TEXT,
    weaknesses      TEXT,
    recommendations TEXT,
    last_analyzed   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_profile UNIQUE (student_id, institution_id)
);

CREATE INDEX idx_ai_predictions_model ON ai_predictions(model_id);
CREATE INDEX idx_ai_predictions_student ON ai_predictions(student_id);
CREATE INDEX idx_ai_predictions_status ON ai_predictions(status);
CREATE INDEX idx_ai_recommendations_institution ON ai_recommendations(institution_id);
CREATE INDEX idx_ai_recommendations_target ON ai_recommendations(target_type, target_id);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status);
CREATE INDEX idx_ai_anomalies_institution ON ai_anomalies(institution_id);
CREATE INDEX idx_ai_anomalies_entity ON ai_anomalies(entity_type, entity_id);
CREATE INDEX idx_ai_anomalies_status ON ai_anomalies(status);
CREATE INDEX idx_ai_anomalies_severity ON ai_anomalies(severity);
CREATE INDEX idx_ai_student_profiles_student ON ai_student_profiles(student_id);
