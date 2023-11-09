import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  AcademicSessionTableData,
  AcademicSessionDetails,
  CreateAcademicSessionPayload,
  ListAcademicSessionPayload,
  UpdateAcademicSessionAPIPayload,
  DeleteAcademicSessionPayload,
} from "../types/academic-sessions";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class AcademicSessionController {
  private academicSessionModel;
  private academicSessionIdColumn: string = "academicSessionId";

  constructor() {
    this.academicSessionModel = new CommonModel(
      "academicSessions",
      this.academicSessionIdColumn,
      ["name"],
    );

    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;

      const [inputData]: CreateAcademicSessionPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      //  AcademicSession creation
      const data: AcademicSessionDetails[] =
        await this.academicSessionModel.bulkCreate(inputData, userId);
      if (!data?.length) {
        throw new BadRequestException("Unable to create role.");
      }
      return response.successResponse({
        message: `Academic session created successfully.`,
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
      const { roleId }: Headers = req.headers;

      const { filter, range, sort }: ListAcademicSessionPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [
        AcademicSessionDetails[],
        [{ total: number }],
      ] = await Promise.all([
        await this.academicSessionModel.list(filter, range, sort),

        // total
        await this.academicSessionModel.list(
          filter,
          undefined,
          undefined,
          [`COUNT("${this.academicSessionIdColumn}")::integer AS total`],
          true,
        ),
      ]);

      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Academic session list`,
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

      const inputData: UpdateAcademicSessionAPIPayload = req.body;

      // check if academicSession exist
      const [academicSessionDetails]: AcademicSessionDetails[] =
        await this.academicSessionModel.list({
          academicSessionId: inputData.academicSessionId,
        });
      if (!academicSessionDetails) {
        throw new BadRequestException(
          "Academic session not found",
          "not_found",
        );
      }

      const data: AcademicSessionDetails[] =
        await this.academicSessionModel.update(
          inputData,
          inputData.academicSessionId,
          userId,
        );
      if (!data) {
        throw new BadRequestException("Unable to update Academic Session.");
      }
      return response.successResponse({
        message: `Academic session updated successfully.`,
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

      const academicSessionIds: number[] = isArray(req.body.academicSessionId)
        ? uniq(req.body.academicSessionId)
        : [req.body.academicSessionId];

      // check if academicSession exist
      const [academicSessionDetails]: AcademicSessionDetails[] =
        await this.academicSessionModel.list({
          academicSessionId: academicSessionIds,
        });
      if (!academicSessionDetails) {
        throw new BadRequestException("Invalid user", "not_found");
      }

      // delete
      await this.academicSessionModel.softDelete(academicSessionIds, userId);

      return response.successResponse({
        message: `Academic session deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new AcademicSessionController();
