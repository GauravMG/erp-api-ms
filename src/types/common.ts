export type OrderDir = "asc" | "desc" | "ASC" | "DESC";

export type Range = Partial<{
  page: number;
  pageSize: number;
}>;

export type Sort = Partial<{
  orderBy: string;
  orderDir: OrderDir;
}>;

export type Timestamp = {
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

export type Manipulator = {
  createdBy: string;
  updatedBy: string;
  deletedBy: string;
};

export type Error = {
  message: string;
  status?: number;
  code?: string;
  stack?: string;
};

export type Headers = any & {
  roleId: number;
  userId: number;
};

// enums
export enum Roles {
  SuperAdmin = 1,
  Admin = 2,
  Staff = 3,
  User = 4,
}

export type UrlSchema =
  | {
      apiPath: string;
      method: string;
    }
  | undefined;

export enum VerificationFor {
  Auth = "authentication",
  Update = "update-details",
}

export enum LogInWith {
  Google = "google",
  Facebook = "facebook",
  Twitter = "twitter",
  Linkedin = "linkedin",
  Email = "email",
  Mobile = "mobile",
}

export enum AccountApprovalStatus {
  Pending = "pending",
  Completed = "completed",
  Rejected = "rejected",
}

export enum NotificationServices {
  Mailjet = "mailjet",
  Google = "google",
}
