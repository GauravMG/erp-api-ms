import {
  Range,
  OrderDir,
  Manipulator,
  Timestamp,
  VerificationFor,
  LogInWith,
} from "./common";
import { RoleDetails } from "./roles";

export type VerificationTableData = {
  verificationId: number;
  userId: number;
  verificationType: string;
  valueForEmail: string;
  otpForEmail: string;
  valueForMobile: string;
  otpForMobile: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  verificationFor: VerificationFor;
  status: boolean;
} & Manipulator &
  Timestamp;

export type VerificationDetails = {
  verificationId: number;
  userId: number;
  verificationType: string;
  valueForEmail: string;
  otpForEmail: string;
  valueForMobile: string;
  otpForMobile: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  verificationFor: VerificationFor;
  status: boolean;
};

export type CreateVerificationPayload = {
  userId: number;
} & Partial<{
  valueForEmail: string;
  otpForEmail: string;
  valueForMobile: string;
  otpForMobile: string;
  verificationType: LogInWith;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  verificationFor: VerificationFor;
}>;

type FilterVerificationPayload = Partial<{
  verificationId?: number | number[];
  verificationType?: string | string[];
  verificationFor?: string | string[];
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  createdAt?: string;
  search?: string;
}>;

export type ListVerificationPayload = {
  filter?: FilterVerificationPayload;
  range?: Range;
  sort?: {
    orderBy?: keyof VerificationDetails;
    orderDir?: OrderDir;
  };
};

export type UpdateVerificationPayload = {
  verificationId: number;
} & Partial<{
  verificationId: number;
  userId: number;
  verificationType: string;
  valueForEmail: string;
  otpForEmail: string;
  valueForMobile: string;
  otpForMobile: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  verificationFor: VerificationFor;
}>;

export type DeleteVerificationPayload = {
  verificationId: number[] | number;
};
