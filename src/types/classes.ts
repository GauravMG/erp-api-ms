import { Range, OrderDir, Manipulator, Timestamp } from "./common";

export type ClassTableData = {
  classId: number;
  name: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type ClassDetails = {
  classId: number;
  name: string;
  status: boolean;
};

export type CreateClassAPIPayload = {
  name: string;
};

export type CreateClassPayload = {
  name: string;
  status: boolean;
};

type FilterClassPayload = {
  classId?: number | number[];
  search?: string;
};

export type ListClassPayload = {
  filter?: FilterClassPayload;
  range?: Range;
  sort?: {
    orderBy?: "classId" | "name";
    orderDir?: OrderDir;
  };
};

export type UpdateClassAPIPayload = {
  classId: number;
  name: string;
} & Partial<{
  status: boolean;
}>;

export type DeleteClassPayload = {
  classId: number | number[];
};
