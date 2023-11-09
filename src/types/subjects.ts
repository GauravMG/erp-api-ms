import { Range, OrderDir, Manipulator, Timestamp } from "./common";

export type SubjectTableData = {
  subjectId: number;
  name: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type SubjectDetails = {
  subjectId: number;
  name: string;
  status: boolean;
};

export type CreateSubjectAPIPayload = {
  name: string;
};

export type CreateSubjectPayload = {
  name: string;
  status: boolean;
};

type FilterSubjectPayload = {
  subjectId?: number | number[];
  search?: string;
};

export type ListSubjectPayload = {
  filter?: FilterSubjectPayload;
  range?: Range;
  sort?: {
    orderBy?: "subjectId" | "name";
    orderDir?: OrderDir;
  };
};

export type UpdateSubjectAPIPayload = {
  subjectId: number;
  name: string;
} & Partial<{
  status: boolean;
}>;

export type DeleteSubjectPayload = {
  subjectId: number | number[];
};
