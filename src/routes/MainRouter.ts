import express from "express";

import {
  RoleRouter,
  UserRouter,
  // AuthRouter,
  SettingRouter,
  AcademicSessionRouter,
  ClassRouter,
  SectionRouter,
  ClassSectionMappingRouter,
  SubjectRouter,
  ClassSectionSubjectMappingRouter,
  ClassTeacherMappingRouter,
  ClassSectionSubjectTeacherMappingRouter,
} from ".";

const router = express.Router();

// auth routes
// router.use("/v1/auths", new AuthRouter().router)

// master data routes
router.use("/v1/roles", new RoleRouter().router);
router.use("/v1/users", new UserRouter().router);
router.use("/v1/settings", new SettingRouter().router);
router.use("/v1/academic-sessions", new AcademicSessionRouter().router);
router.use("/v1/classes", new ClassRouter().router);
router.use("/v1/sections", new SectionRouter().router);
router.use("/v1/class-section-mapping", new ClassSectionMappingRouter().router);
router.use("/v1/subjects", new SubjectRouter().router);
router.use(
  "/v1/class-section-subject-mappings",
  new ClassSectionSubjectMappingRouter().router,
);
router.use(
  "/v1/class-teacher-mappings",
  new ClassTeacherMappingRouter().router,
);
router.use(
  "/v1/class-section-subject-teacher-mappings",
  new ClassSectionSubjectTeacherMappingRouter().router,
);

export default router;
