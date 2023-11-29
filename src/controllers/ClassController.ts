import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers } from "../types/common";
import {
  ClassTableData,
  ClassDetails,
  CreateClassPayload,
  ListClassPayload,
  UpdateClassAPIPayload,
  DeleteClassPayload,
} from "../types/classes";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class ClassController {
  private classModel;
  private classIdColumn: string = "classId";

  constructor() {
    this.classModel = new CommonModel("classes", this.classIdColumn, ["name"]);

    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const inputData: CreateClassPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      //  Class creation
      const data: ClassDetails[] = await this.classModel.bulkCreate(
        inputData,
        userId,
      );
      if (!data?.length) {
        throw new BadRequestException("Unable to create role.");
      }
      return response.successResponse({
        message: `Class created successfully.`,
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

      const { filter, range, sort }: ListClassPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [ClassDetails[], [{ total: number }]] =
        await Promise.all([
          await this.classModel.list(filter, range, sort),

          // total
          await this.classModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.classIdColumn}")::integer AS total`],
            true,
          ),
        ]);

      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Class list`,
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

      const inputData: UpdateClassAPIPayload = req.body;

      // check if class exist
      const [classDetails]: ClassDetails[] = await this.classModel.list({
        classId: inputData.classId,
      });
      if (!classDetails) {
        throw new BadRequestException("Class not found", "not_found");
      }

      const data: ClassDetails[] = await this.classModel.update(
        inputData,
        inputData.classId,
        userId,
      );
      if (!data) {
      }
      return response.successResponse({
        message: `Class updated successfully`,
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

      const classIds: number[] = isArray(req.body.classId)
        ? uniq(req.body.classId)
        : [req.body.classId];

      // check if class exist
      const [classDetails]: ClassDetails[] = await this.classModel.list({
        classId: classIds,
      });
      if (!classDetails) {
        throw new BadRequestException("Invalid user", "not_found");
      }

      // delete
      await this.classModel.softDelete(classIds, userId);

      return response.successResponse({
        message: `Class deleted successfully`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new ClassController();
