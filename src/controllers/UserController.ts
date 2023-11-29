import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  UserTableData,
  UserDetails,
  CreateUserPayload,
  ListUserPayload,
  UpdateUserPayload,
  DeleteUserPayload,
  UpdateUserApiPayload,
} from "../types/users";
import { RoleDetails } from "../types/roles";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class UserController {
  private userModel;
  private roleModel;
  private userIdColumn: string = "userId";
  private roleIdColumn: string = "roleId";

  constructor() {
    this.userModel = new CommonModel("users", this.userIdColumn, []);
    this.roleModel = new CommonModel("roles", this.roleIdColumn, []);
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;
      const [inputData]: CreateUserPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      const [roleExists]: RoleDetails[] = await this.roleModel.list({
        roleId: inputData.roleId,
      });
      console.log(`inputData ----->>`, inputData);
      if (!roleExists) {
        throw new BadRequestException("Invalid role", "not_found");
      }
      console.log(`test --------1`, userId);
      // create action
      const [data]: UserDetails[] = await this.userModel.bulkCreate(
        inputData,
        1,
      );
      console.log(`test --------2`, data);

      if (!data) {
        throw new BadRequestException("Failed to create user.", "not_found");
      }

      return response.successResponse({
        message: `User created successfully.`,
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
      const roleIds: number[] = [];
      const { filter, range, sort }: ListUserPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [UserDetails[], [{ total: number }]] =
        await Promise.all([
          await this.userModel.list(filter, range, sort),

          // total
          await this.userModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.userIdColumn}")::integer AS total`],
            true,
          ),
        ]);

      data.forEach((el) => {
        roleIds.push(el.roleId);
      });

      const roles: RoleDetails[] = await this.roleModel.list({
        roleId: roleIds,
      });

      let mappedData: UserDetails[] = [];

      for (let i = 0; i < data.length; i++) {
        const role: RoleDetails | null =
          roles.find((el) => el.roleId === data[i].roleId) ?? null;

        mappedData.push({
          ...data[i],
          role,
        });
      }
      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Users list`,
        total,
        meta: {
          page: range?.page ?? 1,
          pageSize,
          pageCount,
        },
        data: mappedData,
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

      const inputData: UpdateUserPayload = req.body;

      // check if role exist
      const [userDetails]: UserDetails[] = await this.userModel.list({
        userId: inputData.userId,
      });
      console.log(`userDetails ----->`, userDetails);
      if (!userDetails) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      const [data]: UpdateUserApiPayload[] = await this.userModel.update(
        inputData,
        inputData.userId,
        userId,
      );
      console.log(`data ---->`, data);
      if (!data) {
        throw new BadRequestException("Failed to update user.", "not_found");
      }

      return response.successResponse({
        message: `User updated successfully.`,
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

      const userIds: number[] = isArray(req.body.userId)
        ? uniq(req.body.userId)
        : [req.body.userId];

      // check if user exist
      const [userDetails]: UserDetails[] = await this.userModel.list({
        userId: userIds,
      });
      if (!userDetails) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      // delete
      await this.userModel.softDelete(userIds, userId);

      return response.successResponse({
        message: `User deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new UserController();
