import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  SubjectTableData,
  SubjectDetails,
  CreateSubjectPayload,
  ListSubjectPayload,
  UpdateSubjectAPIPayload,
  DeleteSubjectPayload,
} from "../types/subjects";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class SubjectController {
  private subjectModel;
  private subjectIdColumn: string = "subjectId";

  constructor() {
    this.subjectModel = new CommonModel("subjects", this.subjectIdColumn, [
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

      const [inputData]: CreateSubjectPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      //  Subject creation
      const data: SubjectDetails[] = await this.subjectModel.bulkCreate(
        inputData,
        userId,
      );
      if (!data?.length) {
        throw new BadRequestException("Unable to create subject.");
      }
      return response.successResponse({
        message: `Subject created successfully.`,
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

      const { filter, range, sort }: ListSubjectPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [SubjectDetails[], [{ total: number }]] =
        await Promise.all([
          await this.subjectModel.list(filter, range, sort),

          // total
          await this.subjectModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.subjectIdColumn}")::integer AS total`],
            true,
          ),
        ]);

      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Subject list`,
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

      const inputData: UpdateSubjectAPIPayload = req.body;

      // check if role exist
      const [subjectDetails]: SubjectDetails[] = await this.subjectModel.list({
        subjectId: inputData.subjectId,
      });
      if (!subjectDetails) {
        throw new BadRequestException("Subject not found", "not_found");
      }

      const [data]: SubjectDetails[] = await this.subjectModel.update(
        inputData,
        inputData.subjectId,
        userId,
      );

      if (!data) {
        throw new BadRequestException("Failed to update subject.", "not_found");
      }

      return response.successResponse({
        message: `Subject updated successfully`,
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

      const subjectIds: number[] = isArray(req.body.subjectId)
        ? uniq(req.body.subjectId)
        : [req.body.subjectId];

      // check if subject exist
      const subjectDetails: SubjectDetails[] = await this.subjectModel.list({
        subjectId: subjectIds,
      });
      if (!subjectDetails?.length) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      // delete
      await this.subjectModel.softDelete(subjectIds, userId);

      return response.successResponse({
        message: `Subject deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new SubjectController();
