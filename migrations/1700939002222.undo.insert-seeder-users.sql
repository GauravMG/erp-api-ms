-- 1700939002222.undo.insert-seeder-users.sql

DELETE FROM "roles"
WHERE "deletedAt" IS NULL, 
"name" = 'super-admin';

DELETE FROM "users"
WHERE "deletedAt" IS NULL, 
"firstName" = 'Super-Admin';