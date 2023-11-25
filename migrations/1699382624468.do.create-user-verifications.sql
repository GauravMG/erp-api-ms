-- 1699382624468.undo.create-user-verifications.sql

CREATE TYPE verification_for_enum AS ENUM ('authentication', 'update-details');

CREATE TABLE "userVerifications" (
    "verificationId" SERIAL PRIMARY KEY,
    "userId" INT NOT NULL,
    "valueForEmail" VARCHAR(100) NULL,
	"otpForEmail" TEXT NULL,
    "valueForMobile" VARCHAR(100) NULL,
	"otpForMobile" TEXT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "isMobileVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "verificationFor" verification_for_enum NOT NULL DEFAULT 'authentication',
    "status" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NULL,
    "deletedAt" TIMESTAMPTZ NULL,
    "createdBy" INT NOT NULL,
    "updatedBy" INT NULL,
    "deletedBy" INT NULL,
    CONSTRAINT fk_verifications_user_id FOREIGN KEY("userId")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_verifications_created_by FOREIGN KEY("createdBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_verifications_updated_by FOREIGN KEY("updatedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE,
    CONSTRAINT fk_verifications_deleted_by FOREIGN KEY("deletedBy")
    REFERENCES "users" ("userId")
    ON DELETE CASCADE
);