-- V29: Comunicacion - Notificaciones, Mensajeria Interna, Comunicacion Padres

CREATE TABLE notification_templates (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    subject         VARCHAR(200) NOT NULL,
    body_template   TEXT NOT NULL,
    channel         VARCHAR(20) NOT NULL DEFAULT 'IN_APP'
                    CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH')),
    event_type      VARCHAR(50),
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    template_id       BIGINT REFERENCES notification_templates(id),
    user_id           BIGINT,
    student_id        BIGINT,
    title             VARCHAR(200) NOT NULL,
    message           TEXT NOT NULL,
    channel           VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    priority          VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                      CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA', 'URGENTE')),
    read_status       BOOLEAN DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE internal_messages (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    sender_id         BIGINT NOT NULL,
    subject           VARCHAR(200) NOT NULL,
    body              TEXT NOT NULL,
    priority          VARCHAR(10) NOT NULL DEFAULT 'NORMAL'
                      CHECK (priority IN ('BAJA', 'NORMAL', 'ALTA')),
    read_status       BOOLEAN DEFAULT FALSE,
    read_at           TIMESTAMPTZ,
    parent_message_id BIGINT REFERENCES internal_messages(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_recipients (
    id              BIGSERIAL PRIMARY KEY,
    message_id      BIGINT NOT NULL REFERENCES internal_messages(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL,
    read_status     BOOLEAN DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_message_recipient UNIQUE (message_id, user_id)
);

CREATE TABLE parent_communications (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    student_id        BIGINT NOT NULL,
    representative_id BIGINT,
    user_id           BIGINT,
    communication_type VARCHAR(30) NOT NULL
                       CHECK (communication_type IN ('ACADEMICO', 'CONDUCTA', 'SALUD', 'FINANCIERO', 'GENERAL')),
    subject           VARCHAR(200) NOT NULL,
    message           TEXT NOT NULL,
    channel           VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    status            VARCHAR(15) NOT NULL DEFAULT 'ENVIADO'
                      CHECK (status IN ('ENVIADO', 'LEIDO', 'RESPONDIDO')),
    response          TEXT,
    responded_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communication_groups (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    group_type      VARCHAR(20) NOT NULL DEFAULT 'PERSONALIZADO'
                    CHECK (group_type IN ('CURSO', 'PARALELO', 'DOCENTES', 'PADRES', 'PERSONALIZADO')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communication_group_members (
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT NOT NULL REFERENCES communication_groups(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_group_member UNIQUE (group_id, user_id)
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_institution ON notifications(institution_id);
CREATE INDEX idx_notifications_read ON notifications(read_status);
CREATE INDEX idx_internal_messages_sender ON internal_messages(sender_id);
CREATE INDEX idx_internal_messages_institution ON internal_messages(institution_id);
CREATE INDEX idx_message_recipients_user ON message_recipients(user_id);
CREATE INDEX idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX idx_parent_communications_student ON parent_communications(student_id);
CREATE INDEX idx_parent_communications_institution ON parent_communications(institution_id);
CREATE INDEX idx_communication_groups_institution ON communication_groups(institution_id);
