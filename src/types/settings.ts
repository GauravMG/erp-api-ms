import { Range, OrderDir, Manipulator, Timestamp } from "./common";

export type SettingTableData = {
  settingId: number;
  dataJson: any;
  status: boolean;
} & Manipulator &
  Timestamp;

export type SettingDetails = {
  settingId: number;
  dataJson: any;
  status: boolean;
};

export type CreateSettingAPIPayload = {
  dataJson: string;
};

export type CreateSettingPayload = {
  dataJson: string;
  status: boolean;
};

type FilterSettingPayload = {
  settingId?: number[];
  search?: string;
};

export type ListSettingPayload = {
  filter?: FilterSettingPayload;
  range?: Range;
  sort?: {
    orderBy?: "settingId";
    orderDir?: OrderDir;
  };
};

export type UpdateSettingAPIPayload = {
  settingId: number;
  dataJson: string;
} & Partial<{
  status: boolean;
}>;

export type DeleteSettingPayload = {
  settingId: number;
};
