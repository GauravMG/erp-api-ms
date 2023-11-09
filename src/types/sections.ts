import { Range, OrderDir, Manipulator, Timestamp } from "./common";

export type SectionTableData = {
  sectionId: number;
  name: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type SectionDetails = {
  sectionId: number;
  name: string;
  status: boolean;
};

export type CreateSectionAPIPayload = {
  name: string;
};

export type CreateSectionPayload = {
  name: string;
  status: boolean;
};

type FilterSectionPayload = {
  sectionId?: number | number[];
  search?: string;
};

export type ListSectionPayload = {
  filter?: FilterSectionPayload;
  range?: Range;
  sort?: {
    orderBy?: "sectionId" | "name";
    orderDir?: OrderDir;
  };
};

export type UpdateSectionAPIPayload = {
  sectionId: number;
  name: string;
} & Partial<{
  status: boolean;
}>;

export type DeleteSectionPayload = {
  sectionId: number | number[];
};
