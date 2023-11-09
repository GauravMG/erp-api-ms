import { Range, OrderDir, Manipulator, Timestamp } from "./common";

export type AcademicSessionTableData = {
  academicSessionId: number;
  name: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type AcademicSessionDetails = {
  academicSessionId: number;
  name: string;
  status: boolean;
};

export type CreateAcademicSessionAPIPayload = {
  name: string;
};

export type CreateAcademicSessionPayload = {
  name: string;
  status: boolean;
};

type FilterAcademicSessionPayload = {
  academicSessionId?: number | number[];
  search?: string;
};

export type ListAcademicSessionPayload = {
  filter?: FilterAcademicSessionPayload;
  range?: Range;
  sort?: {
    orderBy?: "academicSessionId" | "name";
    orderDir?: OrderDir;
  };
};

export type UpdateAcademicSessionAPIPayload = {
  academicSessionId: number;
  name: string;
} & Partial<{
  status: boolean;
}>;

export type DeleteAcademicSessionPayload = {
  academicSessionId: number | number[];
};
