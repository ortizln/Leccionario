-- V3: Update institution code to match frontend expectation
-- The seed data in V1 uses INST001, but the frontend hardcodes 1799999999001 (RUC)
UPDATE institutions SET code = '1799999999001' WHERE code = 'INST001';

-- Also ensure the branding table has the institution_id column (safety net)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'book_categories' AND column_name = 'institution_id'
    ) THEN
        ALTER TABLE book_categories ADD COLUMN institution_id BIGINT;
        ALTER TABLE book_categories ADD CONSTRAINT fk_book_category_institution
            FOREIGN KEY (institution_id) REFERENCES institutions(id);
    END IF;
END $$;
