-- 1699386398466.do.create-class-section-mappings.sql

CREATE TABLE IF NOT EXISTS "classSectionMappings" (
"classSectionMappingId" SERIAL PRIMARY KEY, 
"classId" INT NOT NULL,
"sectionId" INT NOT NULL,
"status" BOOLEAN NOT NULL DEFAULT TRUE,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"deletedAt" TIMESTAMPTZ NULL,
"createdBy" INT NOT NULL,
"updatedBy" INT NOT NULL,
"deletedBy" INT NULL,
CONSTRAINT fk_class_section_mappings_class_id FOREIGN KEY ("classId")
REFERENCES "classes" ("classId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_mappings_section_id FOREIGN KEY ("sectionId")
REFERENCES "sections" ("sectionId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_mappings_created_by FOREIGN KEY ("createdBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_mappings_updated_by FOREIGN KEY ("updatedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_mappings_deleted_by FOREIGN KEY ("deletedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE
);