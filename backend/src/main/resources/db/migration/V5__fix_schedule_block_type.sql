-- V5: Corrige block_type legacy 'REGULAR' en schedule_blocks.
-- La base de producción se importó desde init_full.sql que sembraba
-- schedule_blocks.block_type = 'REGULAR', pero el enum actual
-- ScheduleBlockType solo define CLASS y RECESS. Al leer dichas filas con
-- @Enumerated(EnumType.STRING), Hibernate lanzaba:
--   No enum constant com.leccionario.backend.schedule.domain.ScheduleBlockType.REGULAR
-- (GET /api/schedules/overview -> 400). Semánticamente 'REGULAR' == bloque de clase.

-- 1) Normalizar a mayúsculas / limpiar espacios de cualquier valor legacy.
UPDATE schedule_blocks
SET block_type = UPPER(TRIM(block_type));

-- 2) Mapear valores antiguos desconocidos al enum actual.
UPDATE schedule_blocks
SET block_type = 'CLASS'
WHERE block_type IN ('REGULAR', 'NORMAL', 'LESSON');

-- 3) Garantizar que ningún valor quede fuera del enum actual (CLASS, RECESS).
--    Cualquier otro valor se trata como CLASS para evitar fallos en runtime.
UPDATE schedule_blocks
SET block_type = 'CLASS'
WHERE block_type NOT IN ('CLASS', 'RECESS');
