import {
  Range,
  OrderDir,
  Manipulator,
  Timestamp,
  AccountApprovalStatus,
  LogInWith,
} from "./common";
import { RoleDetails } from "./roles";

export type AuthTableData = {
  credentialId: number;
  userId: number;
  email: string;
  mobile: string;
  password: string;
  status: boolean;
} & Manipulator &
  Timestamp;

export type AuthShortDetails = {
  credentialId: number;
  userId: number;
  email: string;
  mobile: string;
  password: string;
  status: boolean;
};

export type RegisterAPIPayload = {
  roleId: number;
  salutation: string;
  firstName: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  email: string;
  mobile: string;
  password: string;
  specialization?: string;
  mrnNo?: string;
  hospitalRegnNo?: string;
  companyName?: string;
  companyType?: string;
};

export type CreateProfilePayload = {
  userId: number;
  specialization?: string;
  mrnNo?: string;
  hospitalRegnNo?: string;
  companyName?: string;
  companyType?: string;
};

export type AuthDetails = {
  role: RoleDetails | null;
} & AuthShortDetails;

export type CreateAuthPayload = {
  credentialId: number;
  userId: number;
  email?: string;
  mobile?: string;
  password: string;
};

type FilterAuthPayload = Partial<{
  userId: number | number[];
  email: string;
  mobile: string;
  createdAt: string;
  search: string;
}>;

export type ListAuthPayload = {
  filter?: FilterAuthPayload;
  range?: Range;
  sort?: {
    orderBy?: keyof AuthShortDetails;
    orderDir?: OrderDir;
  };
};

export type UpdateAuthPayload = {
  credentialId: number;
} & Partial<{
  userId: number;
  email: string;
  mobile: string;
  password: string;
}>;

export type DeleteAuthPayload = {
  credentialId: number[] | number;
};

export type SignInPayload = {
  email?: string;
  mobile?: string;
  password: string;
};

export type VerifyOtpPayload = {
  userName?: string;
  hash?: string;
  otp: number;
};

export type ResetPasswordPayload = {
  hash: string;
  otp: number;
  password: string;
};

export type ChangePasswordPayload = {
  email: string;
  previousPassword: string;
  newPassword: string;
};

export type SendOtpPayload = {
  email: string;
};

export type ForgetPassword = {
  email?: string;
  mobile?: string;
};

export type DecryptData = {
  userId: number;
  email: string;
};

export type SendOtpByHashPayload = {
  hash: string;
};

export type VerifyOtpByHash = {
  hash: string;
  otp: number;
};
