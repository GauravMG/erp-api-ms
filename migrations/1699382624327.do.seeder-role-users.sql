-- 1699382624327.do.seeder-role-users.sql

INSERT INTO roles ("name") VALUES ('super-admin');

INSERT INTO users ("roleId", "salutation", "firstName", "createdBy", "updatedBy") 
VALUES(1, 'Mr.', 'Super-Admin', 1, 1);