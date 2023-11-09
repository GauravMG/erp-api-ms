-- 1699386983980.do.create-subjects.sql

ALTER TABLE "subjects"
DROP CONSTRAINT fk_subjects_created_by,
DROP CONSTRAINT fk_subjects_updated_by,
DROP CONSTRAINT fk_subjects_deleted_by;

DROP TABLE "subjects";
