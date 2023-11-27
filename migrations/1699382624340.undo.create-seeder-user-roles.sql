-- 1699382624340.undo.create-seeder-user-roles.sql

DELETE FROM "roles"
WHERE "deletedAt" IS NULL, 
"name" = 'super-admin';

DELETE FROM "users"
WHERE "deletedAt" IS NULL, 
"firstName" = 'Super-Admin';