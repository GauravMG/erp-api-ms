import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  RoleTableData,
  RoleDetails,
  CreateRolePayload,
  ListRolePayload,
  UpdateRoleAPIPayload,
  DeleteRolePayload,
  CreateRoleAPIPayload,
} from "../types/roles";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class RoleController {
  private roleModel;
  private roleIdColumn: string = "roleId";

  constructor() {
    this.roleModel = new CommonModel("roles", this.roleIdColumn, ["name"]);

    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const inputData: CreateRoleAPIPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      //  Role creation
      const data: RoleDetails[] = await this.roleModel.bulkCreate(inputData);
      if (!data?.length) {
        throw new BadRequestException("Unable to create role.");
      }
      return response.successResponse({
        message: `Role created successfully.`,
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

      const { filter, range, sort }: ListRolePayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [RoleDetails[], [{ total: number }]] =
        await Promise.all([
          await this.roleModel.list(filter, range, sort),

          // total
          await this.roleModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.roleIdColumn}")::integer AS total`],
            true,
          ),
        ]);

      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Roles list`,
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
      const { userId, roleId }: Headers = req.headers;

      const inputData: UpdateRoleAPIPayload = req.body;

      // check if role exist
      const [roleDetails]: RoleDetails[] = await this.roleModel.list({
        roleId: inputData.roleId,
      });
      if (!roleDetails) {
        throw new BadRequestException("Role not found", "not_found");
      }

      const data: RoleDetails[] = await this.roleModel.update(
        inputData,
        inputData.roleId,
        userId,
      );
      if (!data) {
      }
      return response.successResponse({
        message: `Role updated successfully`,
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

      const roleIds: number[] = isArray(req.body.roleId)
        ? uniq(req.body.roleId)
        : [req.body.roleId];

      // check if role exist
      const [roleDetails]: RoleDetails[] = await this.roleModel.list({
        roleId: roleIds,
      });
      if (!roleDetails) {
        throw new BadRequestException("Invalid user", "not_found");
      }

      // delete
      await this.roleModel.softDelete(roleIds, userId);

      return response.successResponse({
        message: `Role deleted successfully`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new RoleController();
