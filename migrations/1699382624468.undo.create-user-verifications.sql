-- 1699382624468.undo.create-user-verifications.sql

ALTER TABLE "userVerifications" 
DROP CONSTRAINT fk_verifications_user_id,
DROP CONSTRAINT fk_verifications_created_by,
DROP CONSTRAINT fk_verifications_updated_by,
DROP CONSTRAINT fk_verifications_deleted_by;

DROP TABLE "userVerifications";