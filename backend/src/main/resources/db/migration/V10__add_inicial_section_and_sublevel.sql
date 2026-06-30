-- Agregar INICIAL al CHECK constraint de section en courses
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_section_check;
ALTER TABLE courses ADD CONSTRAINT courses_section_check CHECK (section IN ('INICIAL', 'EGB', 'BACHILLERATO'));

-- Agregar INICIAL al CHECK constraint de sub_level en courses
ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_sub_level_check;
ALTER TABLE courses ADD CONSTRAINT courses_sub_level_check CHECK (sub_level IN ('INICIAL', 'PREPARATORIA', 'ELEMENTAL', 'MEDIA', 'SUPERIOR', 'BGU'));
