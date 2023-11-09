import { Range, OrderDir, Manipulator, Timestamp } from "./common";
import { RoleDetails } from "./roles";

export type UserTableData = {
  userId: number;
  roleId: number;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type UserShortDetails = {
  userId: number;
  roleId: number;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: boolean;
};

export type UserDetails = {
  role: RoleDetails | null;
} & UserShortDetails;

export type CreateUserApiPayload = {
  userId: number;
  roleId: number;
  salutation: string;
  firstName: string;
} & Partial<{
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}>;

export type CreateUserPayload = {
  userId: number;
  roleId: number;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: boolean;
};

type FilterUserPayload = {
  userId?: number | number[];
  roleId?: number | number[];
  search?: string;
};

export type ListUserPayload = Partial<{
  filter: FilterUserPayload;
  sort: Partial<{
    sortBy: "userId" | "roleId";
    orderDir: OrderDir;
  }>;
  range: Range;
}>;

export type UpdateUserApiPayload = {
  userId: number;
} & Partial<{
  roleId: number;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: boolean;
}>;

export type UpdateUserPayload = {
  userId: number;
} & Partial<{
  roleId: number;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  status: boolean;
}>;

export type DeleteUserPayload = {
  userId: number | number[];
};
