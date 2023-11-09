import express, { Router } from "express";

import ClassController from "../controllers/ClassController";

//routes
export class ClassRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", ClassController.create)
      .post("/list", ClassController.list)
      .post("/update", ClassController.update)
      .post("/delete", ClassController.delete);
  }
}
