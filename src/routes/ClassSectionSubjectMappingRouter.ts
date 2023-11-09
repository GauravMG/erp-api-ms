import express, { Router } from "express";

import ClassSectionSubjectMappingController from "../controllers/ClassSectionSubjectMappingController";

//routes
export class ClassSectionSubjectMappingRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", ClassSectionSubjectMappingController.create)
      .post("/list", ClassSectionSubjectMappingController.list)
      .post("/update", ClassSectionSubjectMappingController.update)
      .post("/delete", ClassSectionSubjectMappingController.delete);
  }
}
