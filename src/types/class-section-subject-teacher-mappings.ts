import { Range, OrderDir, Manipulator, Timestamp } from "./common";
import { ClassSectionMappingDetails } from "./class-section-mappings";
import { UserDetails } from "./users";
import { ClassSectionSubjectMappingDetails } from "./class-section-subject-mappings";

export type ClassSectionSubjectTeacherMappingTableData = {
  classSectionSubjectTeacherMappingId: number;
  classSectionSubjectMappingId: number;
  userId: number;
  status: boolean;
} & Manipulator &
  Timestamp;

export type ClassSectionSubjectTeacherMappingShortDetails = {
  classSectionSubjectTeacherMappingId: number;
  classSectionSubjectMappingId: number;
  userId: number;
  status: boolean;
};

export type ClassSectionSubjectTeacherMappingDetails = {
  classSectionSubjectMapping: ClassSectionSubjectMappingDetails | null;
  user: UserDetails | null;
} & ClassSectionSubjectTeacherMappingShortDetails;

export type CreateClassSectionSubjectTeacherMappingAPIPayload = {
  classSectionSubjectMappingId: number;
  userId: number;
};

export type CreateClassSectionSubjectTeacherMappingPayload = {
  classSectionSubjectTeacherMappingId: number;
  classSectionSubjectMappingId: number;
  userId: number;
  status: boolean;
};

type FilterClassSectionSubjectTeacherMappingPayload = {
  classSectionSubjectTeacherMappingId?: number | number[];
  classSectionSubjectMappingId?: number | number[];
  userId?: number | number[];
  search?: string;
};

export type ListClassSectionSubjectTeacherMappingPayload = {
  filter?: FilterClassSectionSubjectTeacherMappingPayload;
  range?: Range;
  sort?: {
    orderBy?:
      | "classSectionSubjectTeacherMappingId"
      | "classSectionSubjectMappingId"
      | "userId";
    orderDir?: OrderDir;
  };
};

export type UpdateClassSectionSubjectTeacherMappingAPIPayload = {
  classSectionSubjectTeacherMappingId: number;
  classSectionSubjectMappingId: number;
  userId: number;
} & Partial<{
  status: boolean;
}>;

export type DeleteClassSectionSubjectTeacherMappingPayload = {
  classSectionSubjectTeacherMappingId: number | number[];
};
