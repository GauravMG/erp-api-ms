-- 1699385987982.undo.create-sections.sql

ALTER TABLE "sections"
DROP CONSTRAINT fk_sections_created_by,
DROP CONSTRAINT fk_sections_updated_by,
DROP CONSTRAINT fk_sections_deleted_by;

DROP TABLE IF EXISTS "classes";