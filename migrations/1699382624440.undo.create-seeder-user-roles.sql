-- 1699382624440.undo.create-seeder-user-roles.sql

DELETE FROM "roles"
WHERE "deletedAt" IS NULL 
AND "name" = 'super-admin';

DELETE FROM "users"
WHERE "deletedAt" IS NULL 
AND "firstName" = 'Super-Admin';

DELETE FROM "notificationServices"
WHERE "deletedAt" IS NULL
AND "notificationServiceId" = 1;

DELETE FROM "authCredentials"
    WHERE "userName" = 'chat-user@mailinator.com';

DELETE FROM "userVerifications"
    WHERE "value" = 'chat-user@mailinator.com';