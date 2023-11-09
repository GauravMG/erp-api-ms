-- 1699384673672.undo.create-settings.sql

ALTER TABLE "settings"
DROP CONSTRAINT fk_settings_created_by,
DROP CONSTRAINT fk_settings_updated_by,
DROP CONSTRAINT fk_settings_deleted_by;

DROP TABLE "settings";
