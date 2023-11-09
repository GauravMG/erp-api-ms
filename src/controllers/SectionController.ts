import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  SectionTableData,
  SectionDetails,
  CreateSectionPayload,
  ListSectionPayload,
  UpdateSectionAPIPayload,
  DeleteSectionPayload,
} from "../types/sections";

import CommonModel from "../models/CommonModel";

import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class SectionController {
  private sectionModel;
  private sectionIdColumn: string = "sectionId";

  constructor() {
    this.sectionModel = new CommonModel("sections", this.sectionIdColumn, [
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

      const [inputData]: CreateSectionPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      //  Section creation
      const data: SectionDetails[] = await this.sectionModel.bulkCreate(
        inputData,
        userId,
      );
      if (!data?.length) {
        throw new BadRequestException("Unable to create section.");
      }
      return response.successResponse({
        message: `Section created successfully.`,
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

      const { filter, range, sort }: ListSectionPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [SectionDetails[], [{ total: number }]] =
        await Promise.all([
          await this.sectionModel.list(filter, range, sort),

          // total
          await this.sectionModel.list(
            filter,
            undefined,
            undefined,
            [`COUNT("${this.sectionIdColumn}")::integer AS total`],
            true,
          ),
        ]);

      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Section list`,
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

      const inputData: UpdateSectionAPIPayload = req.body;

      // check if sections exist
      const [sectionDetails]: SectionDetails[] = await this.sectionModel.list({
        sectionId: inputData.sectionId,
      });

      if (!sectionDetails) {
        throw new BadRequestException("Section not found", "not_found");
      }

      const [data]: SectionDetails[] = await this.sectionModel.update(
        inputData,
        inputData.sectionId,
        userId,
      );

      if (!data) {
        throw new BadRequestException("Failed to update section.", "not_found");
      }

      return response.successResponse({
        message: `Section updated successfully`,
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

      const sectionIds: number[] = isArray(req.body.sectionId)
        ? uniq(req.body.sectionId)
        : [req.body.sectionId];

      // check if section exist
      const sectionDetails: SectionDetails[] = await this.sectionModel.list({
        sectionId: sectionIds,
      });
      if (!sectionDetails?.length) {
        throw new BadRequestException("Invalid user.", "not_found");
      }

      // delete
      await this.sectionModel.softDelete(sectionIds, userId);

      return response.successResponse({
        message: `Section deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new SectionController();
