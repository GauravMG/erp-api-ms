-- 1699382624326.do.create-users.sql

CREATE TYPE salutation_enum AS ENUM ('Dr.', 'Mr.', 'Mrs.', 'Miss', 'Master');

CREATE TABLE IF NOT EXISTS "users" (
"userId" SERIAL PRIMARY KEY,
"roleId" INT NOT NULL,
"salutation" salutation_enum NOT NULL,
"firstName" VARCHAR(50) NOT NULL,
"middleName" VARCHAR(50) NULL,
"lastName" VARCHAR(50) NULL,
"address" TEXT NULL,
"city" VARCHAR(255) NULL,
"state" VARCHAR(255) NULL,
"country" VARCHAR(255) NULL,
"postalCode" VARCHAR(255) NULL,
"secretHash" VARCHAR(255) NULL, 
"status" BOOLEAN NOT NULL DEFAULT TRUE,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"deletedAt" TIMESTAMPTZ NULL,
"createdBy" INT NOT NULL,
"updatedBy" INT NOT NULL,
"deletedBy" INT NULL,
CONSTRAINT fk_users_role_id FOREIGN KEY ("roleId")
REFERENCES "roles" ("roleId")
ON DELETE CASCADE
);
