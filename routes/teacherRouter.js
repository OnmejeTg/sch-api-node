import express from "express";
import {
  createTeacher,
  allTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  login,
} from "../controllers/teachers/teacherController.js";
import { isAdmin, isLoggedin, isTeacher } from "../middleware/auth.js";
import { memoryupload } from "../utils/multer.js";

const teacherRouter = express.Router();

teacherRouter.post("/create", createTeacher);
teacherRouter.get("/all", isAdmin, allTeachers);
teacherRouter.get("/:id", getTeacher);
teacherRouter.put("/update",  memoryupload.single("file"),  isLoggedin, isTeacher, updateTeacher);
teacherRouter.delete("/delete/:id", isAdmin, deleteTeacher);
teacherRouter.post("/login", login);

export default teacherRouter;
