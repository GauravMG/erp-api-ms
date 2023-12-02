-- 1699382624440.undo.create-seeder-user-roles.sql

DELETE FROM "notificationServices"
    WHERE "deletedAt" IS NULL
    AND "notificationServiceId" = 1;

DELETE FROM "authCredentials"
    WHERE "email" = 'test-user@mailinator.com';

DELETE FROM "userVerifications"
    WHERE "valueForEmail" = 'test-user@mailinator.com';