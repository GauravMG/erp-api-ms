import { ClassSectionMappingDetails } from "./class-section-mappings";
import { ClassDetails } from "./classes";
import { Range, OrderDir, Manipulator, Timestamp } from "./common";
import { SectionDetails } from "./sections";
import { SubjectDetails } from "./subjects";

export type ClassSectionSubjectMappingTableData = {
  classSectionMappingId: number;
  classSectionSubjectMappingId: number;
  sectionId: number;
  status: boolean;
} & Manipulator &
  Timestamp;

export type ClassSectionSubjectMappingShortDetails = {
  classSectionSubjectMappingId: number;
  classSectionMappingId: number;
  subjectId: number;
  status: boolean;
};

export type ClassSectionSubjectMappingDetails = {
  classSectionMapping: ClassSectionMappingDetails | null;
  subject: SubjectDetails | null;
} & ClassSectionSubjectMappingShortDetails;

export type CreateClassSectionSubjectMappingAPIPayload = {
  classSectionSubjectMappingId: number;
  sectionId: number;
};

export type CreateClassSectionSubjectMappingPayload = {
  classSectionMappingId: number;
  classSectionSubjectMappingId: number;
  sectionId: number;
  status: boolean;
};

type FilterClassSectionSubjectMappingPayload = {
  classSectionMappingId?: number | number[];
  classSectionSubjectMappingId: number | number[];
  sectionId: number | number[];
  search?: string;
};

export type ListClassSectionSubjectMappingPayload = {
  filter?: FilterClassSectionSubjectMappingPayload;
  range?: Range;
  sort?: {
    orderBy?:
      | "classSectionMappingId"
      | "classSectionSubjectMappingId"
      | "sectionId";
    orderDir?: OrderDir;
  };
};

export type UpdateClassSectionSubjectMappingAPIPayload = {
  classSectionMappingId: number;
  classSectionSubjectMappingId: number;
  sectionId: number;
} & Partial<{
  status: boolean;
}>;

export type DeleteClassSectionSubjectMappingPayload = {
  classSectionMappingId: number | number[];
};
