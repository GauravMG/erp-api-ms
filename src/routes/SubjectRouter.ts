import express, { Router } from "express";

import SubjectController from "../controllers/SubjectController";

//routes
export class SubjectRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", SubjectController.create)
      .post("/list", SubjectController.list)
      .post("/update", SubjectController.update)
      .post("/delete", SubjectController.delete);
  }
}
