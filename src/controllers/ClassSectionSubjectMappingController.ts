import { Request, Response, NextFunction } from "express";
import { isArray, uniq } from "lodash";

import { Headers, Roles } from "../types/common";
import {
  ClassSectionSubjectMappingTableData,
  ClassSectionSubjectMappingDetails,
  CreateClassSectionSubjectMappingPayload,
  ListClassSectionSubjectMappingPayload,
  UpdateClassSectionSubjectMappingAPIPayload,
  ClassSectionSubjectMappingShortDetails,
  DeleteClassSectionSubjectMappingPayload,
} from "../types/class-section-subject-mappings";

import { ClassDetails } from "../types/classes";
import { SectionDetails } from "../types/sections";

import CommonModel from "../models/CommonModel";
import { BadRequestException, ForbiddenException } from "../libs/exceptions";
import eventEmitter from "../libs/logging";
import { ApiResponse } from "../libs/ApiResponse";
import helper from "../helpers/helper";
import { ClassSectionMappingDetails } from "../types/class-section-mappings";
import { SubjectDetails } from "../types/subjects";

class ClassSectionSubjectMappingController {
  private classSectionSubjectMappingModel;
  private classSectionMappingModel;
  private subjectModel;
  private classSectionSubjectMappingIdColumn: string =
    "classSectionSubjectMappingId";
  private classSectionMappingIdColumn: string = "classSectionMappingId";
  private subjectIdColumn: string = "subjectId";

  constructor() {
    this.classSectionSubjectMappingModel = new CommonModel(
      "classSectionSubjectMappings",
      this.classSectionSubjectMappingIdColumn,
      [],
    );
    this.classSectionMappingModel = new CommonModel(
      "classSectionMappings",
      this.classSectionMappingIdColumn,
      [],
    );
    this.subjectModel = new CommonModel("subjects", this.subjectIdColumn, []);
    this.create = this.create.bind(this);
    this.list = this.list.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const response = new ApiResponse(res);
      const { userId }: Headers = req.headers;
      const [inputData]: CreateClassSectionSubjectMappingPayload[] = isArray(
        req.body,
      )
        ? req.body
        : [req.body];

      const [
        classSectionSubjectMappingExists,
      ]: ClassSectionSubjectMappingShortDetails[] =
        await this.classSectionSubjectMappingModel.list({
          classSectionSubjectMappingId: inputData.classSectionSubjectMappingId,
        });
      if (!classSectionSubjectMappingExists) {
        throw new BadRequestException(
          "Invalid class subject mappings.",
          "not_found",
        );
      }

      // create action
      const [data]: ClassSectionSubjectMappingDetails[] =
        await this.classSectionSubjectMappingModel.bulkCreate(
          inputData,
          userId,
        );

      if (!data) {
        throw new BadRequestException(
          "Failed to create class section subject mapping.",
          "not_found",
        );
      }

      return response.successResponse({
        message: `Class section subject mapping created successfully.`,
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
      const subjectIds: number[] = [];
      const { filter, range, sort }: ListClassSectionSubjectMappingPayload =
        await helper.listFunction(req.body);

      const [data, [{ total }]]: [
        ClassSectionSubjectMappingDetails[],
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
        classSectionMappingIds.push(el.classSectionMappingId);
        subjectIds.push(el.subjectId);
      });

      const [classSectionMappings, subjects]: [
        ClassSectionMappingDetails[],
        SubjectDetails[],
      ] = await Promise.all([
        this.classSectionMappingModel.list({
          classSectionMappingId: classSectionMappingIds,
        }),
        this.subjectModel.list({ subjectId: subjectIds }),
      ]);

      let mappedData: ClassSectionSubjectMappingDetails[] = [];

      for (let i = 0; i < data.length; i++) {
        const classSectionMapping: ClassSectionMappingDetails | null =
          classSectionMappings.find(
            (el) => el.classSectionMappingId === data[i].classSectionMappingId,
          ) ?? null;

        const subject: SubjectDetails | null =
          subjects.find((el) => el.subjectId === data[i].subjectId) ?? null;
        mappedData.push({
          ...data[i],
          classSectionMapping,
          subject,
        });
      }
      // total pages
      let pageSize: number = range?.pageSize ?? 100;
      pageSize = pageSize === 0 ? 100 : pageSize;
      const pageCount: number = Math.ceil(total / pageSize);

      // result return
      return response.successResponse({
        message: `Class section subject mapping list`,
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

      const inputData: UpdateClassSectionSubjectMappingAPIPayload = req.body;

      // check if role exist
      const [
        classSectionSubjectMappingDetails,
      ]: ClassSectionSubjectMappingDetails[] =
        await this.classSectionSubjectMappingModel.list({
          classSectionSubjectMappingId: inputData.classSectionSubjectMappingId,
        });
      if (!classSectionSubjectMappingDetails) {
        throw new BadRequestException(
          "Invalid class section subject mapping.",
          "not_found",
        );
      }

      const [data]: ClassSectionSubjectMappingDetails[] =
        await this.classSectionSubjectMappingModel.update(
          inputData,
          inputData.classSectionSubjectMappingId,
          userId,
        );
      if (!data) {
        throw new BadRequestException(
          "Failed to update class section mappings.",
          "not_found",
        );
      }

      return response.successResponse({
        message: `Class section subject mapping updated successfully.`,
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

      const classSectionSubjectMappingIds: number[] = isArray(req.body.userId)
        ? uniq(req.body.classSectionSubjectMappingId)
        : [req.body.classSectionSubjectMappingId];

      // check if user exist
      const [
        classSectionSubjectMappingDetails,
      ]: ClassSectionSubjectMappingDetails[] =
        await this.classSectionSubjectMappingModel.list({
          classSectionSubjectMappingId: classSectionSubjectMappingIds,
        });
      if (!classSectionSubjectMappingDetails) {
        throw new BadRequestException(
          "Invalid class section subject mapping.",
          "not_found",
        );
      }

      // delete
      await this.classSectionSubjectMappingModel.softDelete(
        classSectionSubjectMappingIds,
        userId,
      );

      return response.successResponse({
        message: `Class section subject mapping deleted successfully.`,
      });
    } catch (error) {
      eventEmitter.emit("logging", error?.toString());
      next(error);
    }
  }
}

export default new ClassSectionSubjectMappingController();
