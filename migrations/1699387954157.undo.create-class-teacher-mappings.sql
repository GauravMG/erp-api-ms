-- 1699387954157.undo.create-class-teacher-mappings.sql

ALTER TABLE "classTeacherMappings"
DROP CONSTRAINT fk_class_teacher_mappings_class_section_mapping_id,
DROP CONSTRAINT fk_class_teacher_mappings_user_id,
DROP CONSTRAINT fk_class_teacher_mappings_created_by,
DROP CONSTRAINT fk_class_teacher_mappings_updated_by,
DROP CONSTRAINT fk_class_teacher_mappings_deleted_by;

DROP TABLE IF EXISTS "classTeacherMappings";
