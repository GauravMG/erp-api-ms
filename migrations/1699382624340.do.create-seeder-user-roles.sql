-- 1699382624340.do.create-seeder-user-roles.sql

INSERT INTO  roles ("name") VALUES ('super-admin');

INSERT INTO users ("roleId", "salutation", "firstName", "createdBy", "updatedBy") 
VALUES(1, 'Mr.', 'Super-Admin', 1, 1);

-- INSERT INTO "notificationServices" (
--     "service",
--     "serviceType",
--     "host",
--     "port",
--     "encryption",
--     "configuration",
--     "isActive", 
--     "createdBy", 
--     "updatedBy"
--     ) VALUES (
--         'google',
--         'email',
--         'smtp.gmail.com',
--         '587',
--         'tls',
--         '{}',
--         'true',
--         1,
--         1
--         );