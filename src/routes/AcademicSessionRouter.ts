import express, { Router } from "express";

import AcademicSessionController from "../controllers/AcademicSessionController";

//routes
export class AcademicSessionRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", AcademicSessionController.create)
      .post("/list", AcademicSessionController.list)
      .post("/update", AcademicSessionController.update)
      .post("/delete", AcademicSessionController.delete);
  }
}
