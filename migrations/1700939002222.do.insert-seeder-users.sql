-- 1700939002222.do.insert-seeder-users.sql

INSERT INTO  roles ("name") VALUES ('super-admin');

INSERT INTO users ("roleId", "salutation", "firstName", "createdBy", "updatedBy") 
VALUES(1, 'Mr.', 'Super-Admin', 1, 1);