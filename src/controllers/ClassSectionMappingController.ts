import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  ClassSectionMappingTableData,
  ClassSectionMappingDetails,
  CreateClassSectionMappingPayload,
  ListClassSectionMappingPayload,
  UpdateClassSectionMappingAPIPayload,
  ClassSectionMappingShortDetails,
  DeleteClassSectionMappingPayload,
} from "../types/class-section-mappings";

import { ClassDetails } from "../types/classes";
import { SectionDetails } from "../types/sections";

import CommonModel from "../models/CommonModel";
import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";

class ClassSectionMappingController {
  private classSectionMappingModel;
  private classModel;
  private sectionModel;
  private classSectionMappingIdColumn: string = "classSectionMappingId";
  private classIdColumn: string = "classId";
  private sectionModelIdColumn: string = "sectionId";

  constructor() {
    this.classSectionMappingModel = new CommonModel(
      "users",
      this.classSectionMappingIdColumn,
      [],
    );
    this.classModel = new CommonModel("classes", this.classIdColumn, []);
    this.sectionModel = new CommonModel(
      "sections",
      this.sectionModelIdColumn,
      [],
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
      const [inputData]: CreateClassSectionMappingPayload[] = isArray(req.body)
        ? req.body
        : [req.body];

      const [classSectionMappingExists]: ClassSectionMappingShortDetails[] =
        await this.classModel.list({
          classSectionMappingId: inputData.classSectionMappingId,
        });
      if (!classSectionMappingExists) {
        throw new BadRequestException(
          "Invalid class section mappings.",
          "not_found",
        );
      }

      // create action
      const [data]: ClassSectionMappingDetails[] =
        await this.classSectionMappingModel.bulkCreate(inputData, userId);

      if (!data) {
        throw new BadRequestException("Failed to create user.", "not_found");
      }

      return response.successResponse({
        message: `Class section mapping created successfully.`,
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
      const classIds: number[] = [];
      const sectionIds: number[] = [];
      const { filter, range, sort }: ListClassSectionMappingPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [
        ClassSectionMappingDetails[],
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
        classIds.push(el.classId);
        sectionIds.push(el.sectionId);
      });

      const [classes, sections]: [ClassDetails[], SectionDetails[]] =
        await Promise.all([
          this.classModel.list({ classId: classIds }),
          this.sectionModel.list({ sectionId: sectionIds }),
        ]);

      let mappedData: ClassSectionMappingDetails[] = [];

      for (let i = 0; i < data.length; i++) {
        const klass: ClassDetails | null =
          classes.find((el) => el.classId === data[i].classId) ?? null;

        const section: SectionDetails | null =
          sections.find((el) => el.sectionId === data[i].sectionId) ?? null;
        mappedData.push({
          ...data[i],
          class: klass,
          section,
        });
      }
      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Class section mapping list`,
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

      const inputData: UpdateClassSectionMappingAPIPayload = req.body;

      // check if role exist
      const [classSectionMappingDetails]: ClassSectionMappingDetails[] =
        await this.classSectionMappingModel.list({
          classSectionMappingId: inputData.classSectionMappingId,
        });
      if (!classSectionMappingDetails) {
        throw new BadRequestException(
          "Invalid class section mapping.",
          "not_found",
        );
      }

      const [data]: ClassSectionMappingDetails[] =
        await this.classSectionMappingModel.update(
          inputData,
          inputData.classSectionMappingId,
          userId,
        );
      if (!data) {
        throw new BadRequestException(
          "Failed to update class section mappings.",
          "not_found",
        );
      }

      return response.successResponse({
        message: `Class section mapping updated successfully.`,
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

      const classSectionMappingIds: number[] = isArray(req.body.userId)
        ? uniq(req.body.userId)
        : [req.body.userId];

      // check if user exist
      const [classSectionMappingDetails]: ClassSectionMappingDetails[] =
        await this.classSectionMappingModel.list({
          classSectionMappingId: classSectionMappingIds,
        });
      if (!classSectionMappingDetails) {
        throw new BadRequestException(
          "Invalid class section mapping.",
          "not_found",
        );
      }

      // delete
      await this.classSectionMappingModel.softDelete(
        classSectionMappingIds,
        userId,
      );

      return response.successResponse({
        message: `Class section mapping deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new ClassSectionMappingController();
