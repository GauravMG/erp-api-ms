-- 1699382411060.do.create-roles.sql

CREATE TABLE IF NOT EXISTS "roles"(
"roleId" SERIAL PRIMARY KEY,
"name" VARCHAR(50) NOT NULL,
"status" BOOLEAN NOT NULL DEFAULT TRUE,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"deletedAt" TIMESTAMPTZ NULL
);
