import { ClassDetails } from "./classes";
import { Range, OrderDir, Manipulator, Timestamp } from "./common";
import { SectionDetails } from "./sections";

export type ClassSectionMappingTableData = {
  classSectionMappingId: number;
  classId: number;
  sectionId: number;
  status: boolean;
} & Manipulator &
  Timestamp;

export type ClassSectionMappingShortDetails = {
  classSectionMappingId: number;
  classId: number;
  sectionId: number;
  status: boolean;
};

export type ClassSectionMappingDetails = {
  class: ClassDetails | null;
  section: SectionDetails | null;
} & ClassSectionMappingShortDetails;

export type CreateClassSectionMappingAPIPayload = {
  classId: number;
  sectionId: number;
};

export type CreateClassSectionMappingPayload = {
  classSectionMappingId: number;
  classId: number;
  sectionId: number;
  status: boolean;
};

type FilterClassSectionMappingPayload = {
  classSectionMappingId?: number | number[];
  classId: number | number[];
  sectionId: number | number[];
  search?: string;
};

export type ListClassSectionMappingPayload = {
  filter?: FilterClassSectionMappingPayload;
  range?: Range;
  sort?: {
    orderBy?: "classSectionMappingId" | "classId" | "sectionId";
    orderDir?: OrderDir;
  };
};

export type UpdateClassSectionMappingAPIPayload = {
  classSectionMappingId: number;
  classId: number;
  sectionId: number;
} & Partial<{
  status: boolean;
}>;

export type DeleteClassSectionMappingPayload = {
  classSectionMappingId: number | number[];
};
