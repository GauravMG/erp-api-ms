import express, { Router } from "express";

import SectionController from "../controllers/SectionController";

//routes
export class SectionRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", SectionController.create)
      .post("/list", SectionController.list)
      .post("/update", SectionController.update)
      .post("/delete", SectionController.delete);
  }
}
