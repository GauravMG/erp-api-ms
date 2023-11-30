-- 1699382624340.do.create-seeder-user-roles.sql

INSERT INTO  roles ("name") VALUES ('super-admin');

INSERT INTO users ("roleId", "salutation", "firstName", "createdBy", "updatedBy") 
VALUES(1, 'Mr.', 'Super-Admin', 1, 1);

INSERT INTO "notificationServices" (
    "service",
    "serviceType",
    "host",
    "port",
    "encryption",
    "configuration",
    "isActive", 
    "createdBy", 
    "updatedBy"
    ) VALUES (
        'google', 'email', 'smtp.gmail.com', '587', 'tls',
        '{"to":[],"subject":"Mailing services check","body":"hello! this is a test template message for smtp check","from":"ainvox001@gmail.com","publicKey":"ainvox001@gmail.com","privateKey":"mnov ksiq guil dtoa"}', 
        TRUE, 1, 1
        );

INSERT INTO "authCredentials"(
"userId",
"userName",
"password",
"logInWith",
"createdBy"
)
VALUES (
1,
'chat-user@mailinator.com',
'$2b$10$PSUKtjK5oSBLskY.o5TwE.jm4U2NBIVblQRs0cTFN893npHx0KYYa',
'email',
1
);

INSERT INTO "userVerifications"(
"verificationType",
"value",
"isVerified",
"verificationFor",
"createdBy"
)
VALUES (
'email',
'chat-user@mailinator.com',
TRUE,
'authentication',
1
);