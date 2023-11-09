import express, { Router } from "express";

import ClassSectionSubjectTeacherMappingController from "../controllers/ClassSectionSubjectTeacherMappingController";

//routes
export class ClassSectionSubjectTeacherMappingRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", ClassSectionSubjectTeacherMappingController.create)
      .post("/list", ClassSectionSubjectTeacherMappingController.list)
      .post("/update", ClassSectionSubjectTeacherMappingController.update)
      .post("/delete", ClassSectionSubjectTeacherMappingController.delete);
  }
}
