-- 1699382624340.do.create-seeder-user-roles.sql

INSERT INTO  roles ("name") VALUES ('super-admin');

INSERT INTO users ("roleId", "salutation", "firstName", "createdBy", "updatedBy") 
VALUES(1, 'Mr.', 'Super-Admin', 1, 1);