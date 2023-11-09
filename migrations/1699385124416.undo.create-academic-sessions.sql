-- 1699385124416.undo.create-academic-sessions.sql

ALTER TABLE "academicSessions"
DROP CONSTRAINT fk_academic_sessions_created_by,
DROP CONSTRAINT fk_academic_sessions_updated_by,
DROP CONSTRAINT fk_academic_sessions_deleted_by;

DROP TABLE IF EXISTS "academicSessions";