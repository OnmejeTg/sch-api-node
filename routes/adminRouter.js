import express from "express";
import {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  login,
  adminUpdateStudent,
  adminUpdateTeacher,
  adminAssignTeacherRole
} from "../controllers/admin/adminController.js";
import { isAdmin } from "../middleware/auth.js";

const adminRouter = express.Router();

adminRouter.post("/create", isAdmin, createAdmin);
adminRouter.get("/all", isAdmin, getAllAdmins);
adminRouter.delete("/delete/:adminId", isAdmin, deleteAdmin);
adminRouter.put("/update/:adminId", isAdmin, updateAdmin);
adminRouter.get("/get/:adminId", isAdmin, getAdmin);
adminRouter.put("/update-student/:id", isAdmin, adminUpdateStudent);
adminRouter.put("/update-teacher/:id", isAdmin, adminUpdateTeacher);
adminRouter.put("/assign-teacher-roles/:id", isAdmin, adminAssignTeacherRole);
adminRouter.post("/login", login);

export default adminRouter;
