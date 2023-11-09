-- 1699385987982.do.create-sections.sql

CREATE TABLE IF NOT EXISTS "sections" (
"sectionId" SERIAL PRIMARY KEY, 
"name" VARCHAR(100) NOT NULL,
"status" BOOLEAN NOT NULL DEFAULT TRUE,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"deletedAt" TIMESTAMPTZ NULL,
"createdBy" INT NOT NULL,
"updatedBy" INT NOT NULL,
"deletedBy" INT NULL,
CONSTRAINT fk_sections_created_by FOREIGN KEY ("createdBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_sections_updated_by FOREIGN KEY ("updatedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_sections_deleted_by FOREIGN KEY ("deletedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE
);
