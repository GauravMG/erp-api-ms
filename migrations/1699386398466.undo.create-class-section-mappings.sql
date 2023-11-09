-- 1699386398466.do.create-class-section-mappings.sql

ALTER TABLE "classSectionMappings"
DROP CONSTRAINT fk_class_section_mappings_class_id,
DROP CONSTRAINT fk_class_section_mappings_section_id,
DROP CONSTRAINT fk_class_section_mappings_created_by,
DROP CONSTRAINT fk_class_section_mappings_updated_by,
DROP CONSTRAINT fk_class_section_mappings_deleted_by;

DROP TABLE IF EXISTS "classSectionMappings";