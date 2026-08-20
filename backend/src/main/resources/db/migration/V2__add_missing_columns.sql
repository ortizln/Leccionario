-- V2: Agregar columna institution_id a book_categories
-- La entidad JPA la requiere pero el V1__baseline.sql no la incluia

ALTER TABLE book_categories ADD COLUMN IF NOT EXISTS institution_id BIGINT;

-- Para tablas vacias, asociar con la primera institucion
UPDATE book_categories SET institution_id = (SELECT id FROM institutions LIMIT 1) WHERE institution_id IS NULL;

-- Ahora hacer NOT NULL
ALTER TABLE book_categories ALTER COLUMN institution_id SET NOT NULL;

ALTER TABLE book_categories ADD CONSTRAINT fk_book_categories_institution
    FOREIGN KEY (institution_id) REFERENCES institutions(id);

-- Agregar parent_id si no existe (el实体 lo requiere)
ALTER TABLE book_categories ADD COLUMN IF NOT EXISTS parent_id BIGINT;
