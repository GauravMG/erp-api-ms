import express, { Router } from "express";

import ClassTeacherMappingController from "../controllers/ClassTeacherMappingController";

//routes
export class ClassTeacherMappingRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", ClassTeacherMappingController.create)
      .post("/list", ClassTeacherMappingController.list)
      .post("/update", ClassTeacherMappingController.update)
      .post("/delete", ClassTeacherMappingController.delete);
  }
}
