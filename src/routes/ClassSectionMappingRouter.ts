import express, { Router } from "express";

import ClassSectionMappingController from "../controllers/ClassSectionMappingController";

//routes
export class ClassSectionMappingRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", ClassSectionMappingController.create)
      .post("/list", ClassSectionMappingController.list)
      .post("/update", ClassSectionMappingController.update)
      .post("/delete", ClassSectionMappingController.delete);
  }
}
