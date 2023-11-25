-- 1699382624328.undo.create-notification-services.sql

ALTER TABLE "notificationServices" 
DROP CONSTRAINT fk_notification_services_created_by,
DROP CONSTRAINT fk_notification_services_updated_by,
DROP CONSTRAINT fk_notification_services_deleted_by;

DROP TABLE "notificationServices";