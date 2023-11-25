import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  SettingTableData,
  SettingDetails,
  CreateSettingPayload,
  ListSettingPayload,
  UpdateSettingAPIPayload,
  DeleteSettingPayload,
} from "../types/settings";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class SettingController {
  private settingModel;
  private settingIdColumn: string = "settingId";

  constructor() {
    this.settingModel = new CommonModel("settings", this.settingIdColumn, [
      "name",
    ]);

    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const [inputData]: CreateSettingPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      //  Setting creation
      const data: SettingDetails[] = await this.settingModel.bulkCreate(
        inputData,
        userId,
      );
      if (!data?.length) {
        throw new BadRequestException("Unable to create setting.");
      }
      return response.successResponse({
        message: `Setting created successfully.`,
        data,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const { filter, range, sort }: ListSettingPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [SettingDetails[], [{ total: number }]] =
        await Promise.all([
          await this.settingModel.list(filter, range, sort),

          // total
          await this.settingModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.settingIdColumn}")::integer AS total`],
            true,
          ),
        ]);

      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Setting list`,
        total,
        meta: {
          page: range?.page ?? 1,
          pageSize,
          pageCount,
        },
        data,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const inputData: UpdateSettingAPIPayload = req.body;

      // check if role exist
      const [settingDetails]: SettingDetails[] = await this.settingModel.list({
        settingId: inputData.settingId,
      });
      if (!settingDetails) {
        throw new BadRequestException("Setting not found", "not_found");
      }

      const [data]: SettingDetails[] = await this.settingModel.update(
        inputData,
        inputData.settingId,
        userId,
      );
      if (!data) {
        throw new BadRequestException("Failed to update setting.", "not_found");
      }
      return response.successResponse({
        message: `Setting updated successfully`,
        data,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const settingIds: number[] = isArray(req.body.settingId)
        ? uniq(req.body.settingId)
        : [req.body.settingId];

      // check if setting exist
      const [settingDetails]: SettingDetails[] = await this.settingModel.list({
        settingId: settingIds,
      });
      if (!settingDetails) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      // delete
      await this.settingModel.softDelete(settingIds, userId);

      return response.successResponse({
        message: `Setting deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new SettingController();
