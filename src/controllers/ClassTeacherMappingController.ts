import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  ClassTeacherMappingTableData,
  ClassTeacherMappingDetails,
  CreateClassTeacherMappingPayload,
  ListClassTeacherMappingPayload,
  UpdateClassTeacherMappingAPIPayload,
  ClassTeacherMappingShortDetails,
  DeleteClassTeacherMappingPayload,
} from "../types/class-teacher-mappings";

import CommonModel from "../models/CommonModel";
import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";
import { UserDetails } from "../types/users";
import { ClassSectionMappingDetails } from "../types/class-section-mappings";

class ClassTeacherMappingController {
  private classTeacherMappingModel;
  private classSectionMappingModel;
  private userModel;
  private classTeacherMappingIdColumn: string = "classTeacherMappingId";
  private classSectionMappingIdColumn: string = "classSectionMappingId";
  private userIdColumn: string = "userId";

  constructor() {
    this.classTeacherMappingModel = new CommonModel(
      "classTeacherMappings",
      this.classTeacherMappingIdColumn,
      [],
    );
    this.classSectionMappingModel = new CommonModel(
      "classSectionMappings",
      this.classSectionMappingIdColumn,
      [],
    );
    this.userModel = new CommonModel("users", this.userIdColumn, []);
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;
      const [inputData]: CreateClassTeacherMappingPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      const [userExists, classSectionMappingExists]: [
        UserDetails[],
        ClassTeacherMappingShortDetails[],
      ] = await Promise.all([
        this.userModel.list({
          userId: inputData.userId,
        }),
        this.classSectionMappingModel.list({
          classSectionMappingId: inputData.classSectionMappingId,
        }),
      ]);

      if (!userExists) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      if (!classSectionMappingExists) {
        throw new BadRequestException(
          "Invalid class section mapping.",
          "not_found",
        );
      }

      // create action
      const [data]: ClassTeacherMappingDetails[] =
        await this.classTeacherMappingModel.bulkCreate(inputData, userId);

      if (!data) {
        throw new BadRequestException(
          "Failed to create class teacher mapping.",
          "not_found",
        );
      }

      return response.successResponse({
        message: `Class teacher mapping created successfully.`,
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
      const classSectionMappingIds: number[] = [];
      const userIds: number[] = [];
      const { filter, range, sort }: ListClassTeacherMappingPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [
        ClassTeacherMappingDetails[],
        [{ total: number }],
      ] = await Promise.all([
        await this.classSectionMappingModel.list(filter, range, sort),

        // total
        await this.classSectionMappingModel.list(
          filter,
          undefined,
          undefined,
          [`COUNT("${this.classSectionMappingIdColumn}")::integer AS total`],
          true,
        ),
      ]);

      data.forEach((el) => {
        classSectionMappingIds.push(el.classSectionMappingId);
        userIds.push(el.userId);
      });

      const [classSectionMappings, users]: [
        ClassSectionMappingDetails[],
        UserDetails[],
      ] = await Promise.all([
        this.classSectionMappingModel.list({
          classSectionMappingId: classSectionMappingIds,
        }),
        this.userModel.list({ userId: userIds }),
      ]);

      let mappedData: ClassTeacherMappingDetails[] = [];

      for (let i = 0; i < data.length; i++) {
        const classSectionMapping: ClassSectionMappingDetails | null =
          classSectionMappings.find(
            (el) => el.classSectionMappingId === data[i].classSectionMappingId,
          ) ?? null;

        const user: UserDetails | null =
          users.find((el) => el.userId === data[i].userId) ?? null;
        mappedData.push({
          ...data[i],
          classSectionMapping,
          user,
        });
      }
      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Class teacher mapping list`,
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
      const { userId, roleId }: Headers = req.headers;

      const inputData: UpdateClassTeacherMappingAPIPayload = req.body;

      // check if exist
      const [classTeacherMappingDetails]: ClassTeacherMappingDetails[] =
        await this.classTeacherMappingModel.list({
          classTeacherMappingId: inputData.classTeacherMappingId,
        });
      if (!classTeacherMappingDetails) {
        throw new BadRequestException(
          "Invalid class teacher mapping.",
          "not_found",
        );
      }

      const [data]: ClassTeacherMappingDetails[] =
        await this.classSectionMappingModel.update(
          inputData,
          inputData.classSectionMappingId,
          userId,
        );
      if (!data) {
        throw new BadRequestException(
          "Failed to update class teacher mappings.",
          "not_found",
        );
      }

      return response.successResponse({
        message: `Class teacher mapping updated successfully.`,
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
      const { userId, roleId }: Headers = req.headers;

      const classTeacherMappingIds: number[] = isArray(req.body.userId)
        ? uniq(req.body.userId)
        : [req.body.userId];

      // check if user exist
      const [classTeacherMappingDetails]: ClassTeacherMappingDetails[] =
        await this.classTeacherMappingModel.list({
          classTeacherMappingId: classTeacherMappingIds,
        });
      if (!classTeacherMappingDetails) {
        throw new BadRequestException(
          "Invalid class teacher mapping.",
          "not_found",
        );
      }

      // delete
      await this.classTeacherMappingModel.softDelete(
        classTeacherMappingIds,
        userId,
      );

      return response.successResponse({
        message: `Class Teacher mapping deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new ClassTeacherMappingController();
