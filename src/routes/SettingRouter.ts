import express, { Router } from "express";

import SettingController from "../controllers/SettingController";

//routes
export class SettingRouter {
  public readonly router: Router;
  constructor() {
    this.router = express.Router();
    this.router
      .post("/create", SettingController.create)
      .post("/list", SettingController.list)
      .post("/update", SettingController.update)
      .post("/delete", SettingController.delete);
  }
}
