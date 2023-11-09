import { Range, OrderDir, Manipulator, Timestamp } from "./common";

export type RoleTableData = {
  roleId: number;
  name: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type RoleDetails = {
  roleId: number;
  name: string;
  status: boolean;
};

export type CreateRoleAPIPayload = {
  name: string;
};

export type CreateRolePayload = {
  name: string;
  status: boolean;
};

type FilterRolePayload = {
  roleId?: number[];
  search?: string;
};

export type ListRolePayload = {
  filter?: FilterRolePayload;
  range?: Range;
  sort?: {
    orderBy?: "roleId" | "name";
    orderDir?: OrderDir;
  };
};

export type UpdateRoleAPIPayload = {
  roleId: number;
} & Partial<{
  name: string;
  status: boolean;
}>;

export type DeleteRolePayload = {
  roleId: number;
};
