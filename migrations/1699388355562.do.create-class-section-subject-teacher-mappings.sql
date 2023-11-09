-- 1699388355562.do.create-class-section-subject-teacher-mappings.sql

CREATE TABLE IF NOT EXISTS "classSectionSubjectTeacherMappings" (
"classSectionSubjectTeacherMappingId" SERIAL PRIMARY KEY, 
"classSectionSubjectMappingId" INT NOT NULL,
"userId" INT NOT NULL,
"status" BOOLEAN NOT NULL DEFAULT TRUE,
"createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
"deletedAt" TIMESTAMPTZ NULL,
"createdBy" INT NOT NULL,
"updatedBy" INT NOT NULL,
"deletedBy" INT NULL,
CONSTRAINT fk_class_section_subject_teacher_mappings_class_section_subject_mapping_id FOREIGN KEY ("classSectionSubjectMappingId")
REFERENCES "classSectionSubjectMappings" ("classSectionSubjectMappingId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_subject_teacher_mappings_user_id FOREIGN KEY ("userId")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_subject_teacher_mappings_created_by FOREIGN KEY ("createdBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_subject_teacher_mappings_updated_by FOREIGN KEY ("updatedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE,
CONSTRAINT fk_class_section_subject_teacher_mappings_deleted_by FOREIGN KEY ("deletedBy")
REFERENCES "users" ("userId")
ON DELETE CASCADE
);
