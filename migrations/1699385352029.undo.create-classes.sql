-- 1699385352029.undo.create-classes.sql

ALTER TABLE "classes"
DROP CONSTRAINT fk_classes_created_by,
DROP CONSTRAINT fk_classes_updated_by,
DROP CONSTRAINT fk_classes_deleted_by;

DROP TABLE IF EXISTS "classes";