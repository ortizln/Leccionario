-- V35: New modules tables
-- M6: Asset Custodians
CREATE TABLE IF NOT EXISTS asset_custodians (
    id BIGSERIAL PRIMARY KEY,
    asset_id BIGINT NOT NULL REFERENCES assets(id),
    employee_id BIGINT NOT NULL,
    assigned_date DATE NOT NULL,
    returned_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ASIGNADO',
    observations VARCHAR(300),
    institution_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_custodian_asset ON asset_custodians(asset_id);
CREATE INDEX IF NOT EXISTS idx_custodian_inst ON asset_custodians(institution_id);

-- M6: Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(30) NOT NULL,
    supplier_id BIGINT REFERENCES suppliers(id),
    order_date DATE NOT NULL,
    expected_date DATE,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    description VARCHAR(300),
    institution_id BIGINT NOT NULL,
    requested_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_purchase_order_inst ON purchase_orders(institution_id);

-- M8: Circulares
CREATE TABLE IF NOT EXISTS circulars (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content VARCHAR(2000) NOT NULL,
    category VARCHAR(50),
    publish_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLICADA',
    institution_id BIGINT NOT NULL,
    author_user_id BIGINT NOT NULL,
    requires_acknowledge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_circular_inst ON circulars(institution_id);

-- M8: School Events
CREATE TABLE IF NOT EXISTS school_events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(100),
    event_type VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADO',
    institution_id BIGINT NOT NULL,
    organizer_user_id BIGINT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_inst ON school_events(institution_id);
