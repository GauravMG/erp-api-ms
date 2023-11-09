-- 1699385124416.do.create-academic-sessions.sql

CREATE TABLE IF NOT EXISTS "academicSessions"(
"academicSessionId" SERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"status" BOOLEAN NOT NULL DEFAULT TRUE,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"deletedAt" TIMESTAMPTZ NULL,
"createdBy" INT NOT NULL,
"updatedBy" INT NOT NULL,
"deletedBy" INT NULL,
CONSTRAINT fk_academic_sessions_created_by FOREIGN KEY ("createdBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_academic_sessions_updated_by FOREIGN KEY ("updatedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_academic_sessions_deleted_by FOREIGN KEY ("deletedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE
);
