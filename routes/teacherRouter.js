import express from "express";
import {
  createTeacher,
  allTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  login,
} from "../controllers/teachers/teacherController.js";
import { isAdmin, isTeacher } from "../middleware/auth.js";

const teacherRouter = express.Router();

teacherRouter.post("/create", createTeacher);
teacherRouter.get("/all", isAdmin, allTeachers);
teacherRouter.get("/:id", getTeacher);
teacherRouter.put("/update", isTeacher, updateTeacher);
teacherRouter.delete("/delete/:id", isAdmin, deleteTeacher);
teacherRouter.post("/login", login);

export default teacherRouter;
