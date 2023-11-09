import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  ClassSectionSubjectTeacherMappingTableData,
  ClassSectionSubjectTeacherMappingDetails,
  CreateClassSectionSubjectTeacherMappingPayload,
  ListClassSectionSubjectTeacherMappingPayload,
  UpdateClassSectionSubjectTeacherMappingAPIPayload,
  ClassSectionSubjectTeacherMappingShortDetails,
  DeleteClassSectionSubjectTeacherMappingPayload,
} from "../types/class-section-subject-teacher-mappings";

import CommonModel from "../models/CommonModel";
import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";
import { UserDetails } from "../types/users";
import { ClassSectionSubjectMappingDetails } from "../types/class-section-subject-mappings";

class ClassSectionSubjectTeacherMappingController {
  private classSectionSubjectTeacherMappingModel;
  private classSectionSubjectMappingModel;
  private userModel;
  private classSectionSubjectTeacherMappingIdColumn: string =
    "classSectionSubjectTeacherMappingId";
  private classSectionSubjectMappingIdColumn: string =
    "classSectionSubjectMappingId";
  private userIdColumn: string = "userId";

  constructor() {
    this.classSectionSubjectTeacherMappingModel = new CommonModel(
      "classSectionSubjectTeacherMappings",
      this.classSectionSubjectTeacherMappingIdColumn,
      [],
    );
    this.classSectionSubjectMappingModel = new CommonModel(
      "classSectionSubjectMappings",
      this.classSectionSubjectMappingIdColumn,
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
      const [inputData]: CreateClassSectionSubjectTeacherMappingPayload[] =
        isArray(req.body) ? req.body : [req.body];

      const [userExists, classSectionSubjectMappingExists]: [
        UserDetails[],
        ClassSectionSubjectMappingDetails[],
      ] = await Promise.all([
        this.userModel.list({
          userId: inputData.userId,
        }),
        this.classSectionSubjectMappingModel.list({
          classSectionSubjectMappingId: inputData.classSectionSubjectMappingId,
        }),
      ]);

      if (!userExists) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      if (!classSectionSubjectMappingExists) {
        throw new BadRequestException(
          "Invalid class section subject mapping.",
          "not_found",
        );
      }

      // create action
      const [data]: ClassSectionSubjectTeacherMappingDetails[] =
        await this.classSectionSubjectTeacherMappingModel.bulkCreate(
          inputData,
          userId,
        );

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
      const classSectionSubjectMappingIds: number[] = [];
      const userIds: number[] = [];
      const {
        filter,
        range,
        sort,
      }: ListClassSectionSubjectTeacherMappingPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [
        ClassSectionSubjectTeacherMappingDetails[],
        [{ total: number }],
      ] = await Promise.all([
        await this.classSectionSubjectMappingModel.list(filter, range, sort),

        // total
        await this.classSectionSubjectMappingModel.list(
          filter,
          undefined,
          undefined,
          [
            `COUNT("${this.classSectionSubjectMappingIdColumn}")::integer AS total`,
          ],
          true,
        ),
      ]);

      data.forEach((el) => {
        classSectionSubjectMappingIds.push(el.classSectionSubjectMappingId);
        userIds.push(el.userId);
      });

      const [classSectionSubjectMappings, users]: [
        ClassSectionSubjectMappingDetails[],
        UserDetails[],
      ] = await Promise.all([
        this.classSectionSubjectMappingModel.list({
          classSectionSubjectMappingId: classSectionSubjectMappingIds,
        }),
        this.userModel.list({ userId: userIds }),
      ]);

      let mappedData: ClassSectionSubjectTeacherMappingDetails[] = [];

      for (let i = 0; i < data.length; i++) {
        const classSectionSubjectMapping: ClassSectionSubjectMappingDetails | null =
          classSectionSubjectMappings.find(
            (el) =>
              el.classSectionMappingId === data[i].classSectionSubjectMappingId,
          ) ?? null;

        const user: UserDetails | null =
          users.find((el) => el.userId === data[i].userId) ?? null;
        mappedData.push({
          ...data[i],
          user,
          classSectionSubjectMapping,
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

      const inputData: UpdateClassSectionSubjectTeacherMappingAPIPayload =
        req.body;

      // check if exist
      const [
        classSectionSubjectTeacherMappingDetails,
      ]: ClassSectionSubjectTeacherMappingDetails[] =
        await this.classSectionSubjectTeacherMappingModel.list({
          classSectionSubjectTeacherMappingId:
            inputData.classSectionSubjectTeacherMappingId,
        });
      if (!classSectionSubjectTeacherMappingDetails) {
        throw new BadRequestException(
          "Invalid class teacher mapping.",
          "not_found",
        );
      }

      const [data]: ClassSectionSubjectTeacherMappingDetails[] =
        await this.classSectionSubjectMappingModel.update(
          inputData,
          inputData.classSectionSubjectTeacherMappingId,
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

      const classSectionSubjectTeacherMappingIds: number[] = isArray(
        req.body.classSectionSubjectTeacherMappingId,
      )
        ? uniq(req.body.classSectionSubjectTeacherMappingId)
        : [req.body.classSectionSubjectTeacherMappingId];

      // check if user exist
      const [
        classSectionSubjectTeacherMappingDetails,
      ]: ClassSectionSubjectTeacherMappingDetails[] =
        await this.classSectionSubjectTeacherMappingModel.list({
          classSectionSubjectTeacherMappingId:
            classSectionSubjectTeacherMappingIds,
        });
      if (!classSectionSubjectTeacherMappingDetails) {
        throw new BadRequestException(
          "Invalid class teacher mapping.",
          "not_found",
        );
      }

      // delete
      await this.classSectionSubjectTeacherMappingModel.softDelete(
        classSectionSubjectTeacherMappingIds,
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

export default new ClassSectionSubjectTeacherMappingController();
