import { Range, OrderDir, Manipulator, Timestamp } from "./common";
import { ClassSectionMappingDetails } from "./class-section-mappings";
import { UserDetails } from "./users";

export type ClassTeacherMappingTableData = {
  classTeacherMappingId: number;
  classSectionMapping: number;
  userId: number;
  status: boolean;
} & Manipulator &
  Timestamp;

export type ClassTeacherMappingShortDetails = {
  classTeacherMappingId: number;
  classSectionMappingId: number;
  userId: number;
  status: boolean;
};

export type ClassTeacherMappingDetails = {
  classSectionMapping: ClassSectionMappingDetails | null;
  user: UserDetails | null;
} & ClassTeacherMappingShortDetails;

export type CreateClassTeacherMappingAPIPayload = {
  classSectionMappingId: number;
  userId: number;
};

export type CreateClassTeacherMappingPayload = {
  classTeacherMappingId: number;
  classSectionMappingId: number;
  userId: number;
  status: boolean;
};

type FilterClassTeacherMappingPayload = {
  classTeacherMappingId?: number | number[];
  classSectionMappingId: number | number[];
  userId: number | number[];
  search?: string;
};

export type ListClassTeacherMappingPayload = {
  filter?: FilterClassTeacherMappingPayload;
  range?: Range;
  sort?: {
    orderBy?: "classTeacherMappingId" | "classSectionMappingId" | "userId";
    orderDir?: OrderDir;
  };
};

export type UpdateClassTeacherMappingAPIPayload = {
  classTeacherMappingId: number;
  classSectionMappingId: number;
  userId: number;
} & Partial<{
  status: boolean;
}>;

export type DeleteClassTeacherMappingPayload = {
  classTeacherMappingId: number | number[];
};
