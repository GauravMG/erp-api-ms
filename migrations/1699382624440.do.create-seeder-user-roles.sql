-- 1699382624340.do.create-seeder-user-roles.sql

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
"email",
"mobile",
"password",
"createdBy",
"updatedBy"
)
VALUES (
1,
'test-user@mailinator.com',
'9999999999',
'$2b$10$PSUKtjK5oSBLskY.o5TwE.jm4U2NBIVblQRs0cTFN893npHx0KYYa',
1,
1
);

INSERT INTO "userVerifications"(
"userId",
"valueForEmail",
"isEmailVerified",
"createdBy"
)
VALUES (
1,
'test-user@mailinator.com',
TRUE,
1
);