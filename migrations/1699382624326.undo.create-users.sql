-- 1699382624326.undo.create-users.sql

ALTER TABLE "users"
DROP CONSTRAINT fk_users_role_id,
DROP CONSTRAINT fk_users_created_by,
DROP CONSTRAINT fk_users_updated_by,
DROP CONSTRAINT fk_users_deleted_by;

DROP TABLE IF EXISTS "users";
