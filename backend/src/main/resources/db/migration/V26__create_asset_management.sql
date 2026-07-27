-- V26: Inventario y Bienes
-- Depreciacion: items_bienes, asset_categories, asset_assignments, asset_maintenances

CREATE TABLE asset_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    depreciation_rate DECIMAL(5,2) DEFAULT 0,
    useful_life_years INT,
    active          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE assets (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    category_id     BIGINT NOT NULL REFERENCES asset_categories(id),
    code            VARCHAR(30) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    serial_number   VARCHAR(100),
    brand           VARCHAR(100),
    model           VARCHAR(100),
    purchase_date   DATE,
    purchase_cost   DECIMAL(12,2),
    current_value   DECIMAL(12,2),
    condition_status VARCHAR(20) NOT NULL DEFAULT 'BUENO'
                    CHECK (condition_status IN ('BUENO', 'REGULAR', 'MALO', 'BAJA')),
    status          VARCHAR(15) NOT NULL DEFAULT 'DISPONIBLE'
                    CHECK (status IN ('DISPONIBLE', 'ASIGNADO', 'MANTENIMIENTO', 'BAJA')),
    location        VARCHAR(200),
    classroom_id    BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_asset_code UNIQUE (institution_id, code)
);

CREATE TABLE asset_assignments (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT NOT NULL REFERENCES assets(id),
    assigned_to     VARCHAR(150),
    user_id         BIGINT,
    assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date     DATE,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVA'
                    CHECK (status IN ('ACTIVA', 'DEVUELTA', 'CANCELADA')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_maintenances (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT NOT NULL REFERENCES assets(id),
    maintenance_type VARCHAR(20) NOT NULL
                     CHECK (maintenance_type IN ('PREVENTIVO', 'CORRECTIVO', 'ESTADO')),
    description     TEXT NOT NULL,
    cost            DECIMAL(10,2) DEFAULT 0,
    scheduled_date  DATE,
    completed_date  DATE,
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO')),
    technician      VARCHAR(150),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_institution ON assets(institution_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_asset_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_asset_maintenances_asset ON asset_maintenances(asset_id);
CREATE INDEX idx_asset_maintenances_status ON asset_maintenances(status);
