import express from "express";
import {
  createClassLevel,
  deleteClassLevel,
  getClassLevelById,
  getClassLevels,
  updateClassLevel,
  getStudentsByClassLevel,
  addStudentToClass
} from "../controllers/admin/classLevelCtrl.js";
import { isAdmin, isLoggedin, isTeacherOrAdmin } from "../middleware/auth.js";

const classLevelRouter = express.Router();

// classLevelRouter.post("/", isAdmin, createClassLevel);
// classLevelRouter.post("/", isAdmin, getClassLevels);
// classLevelRouter.get("/:id", isAdmin, getClassLevelById);
// classLevelRouter.update("/:id", isAdmin, updateClassLevel);
// classLevelRouter.delete("/:id", isAdmin, deleteClassLevel);

classLevelRouter
  .route("/")
  .post(isAdmin, createClassLevel)
  .get(isTeacherOrAdmin, getClassLevels);
classLevelRouter
  .route("/:id")
  .get(isLoggedin, getClassLevelById)
  .put(isAdmin, updateClassLevel)
  .delete(isAdmin, deleteClassLevel);

classLevelRouter.route("/get-students/:id").get(isTeacherOrAdmin, getStudentsByClassLevel)
classLevelRouter.route("/add-students-to-class/:id").post(isAdmin, addStudentToClass)

export default classLevelRouter;
