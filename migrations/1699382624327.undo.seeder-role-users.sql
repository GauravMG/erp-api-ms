-- 1699382624327.undo.seeder-role-users.sql

DELETE FROM "roles"
WHERE "deletedAt" IS NULL 
AND "name" = 'super-admin';

DELETE FROM "users"
WHERE "deletedAt" IS NULL 
AND "firstName" = 'Super-Admin'
AND "roleId" = 1;