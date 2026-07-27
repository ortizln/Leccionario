-- V38: Create asset warranties table

CREATE TABLE asset_warranties (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    provider VARCHAR(200) NOT NULL,
    start_date DATE,
    end_date DATE,
    warranty_type VARCHAR(50) DEFAULT 'ESTANDAR',
    terms TEXT,
    status VARCHAR(20) DEFAULT 'VIGENTE',
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_warranties_asset ON asset_warranties(asset_id);
CREATE INDEX idx_asset_warranties_institution ON asset_warranties(institution_id);
CREATE INDEX idx_asset_warranties_end ON asset_warranties(end_date);
