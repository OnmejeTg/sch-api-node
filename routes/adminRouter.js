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
  adminAssignTeacherRole,
  suspendWithdrawTeacher,
  generalLogin,
  getLoggdInUser,
  uploadStudent,
  uploadQuestion,
  portalAnalytics,
} from "../controllers/admin/adminController.js";
import { isAdmin, isLoggedin } from "../middleware/auth.js";
import { memoryupload } from "../utils/multer.js";

const adminRouter = express.Router();

adminRouter.post("/create", isAdmin, createAdmin);
adminRouter.get("/all", isAdmin, getAllAdmins);
adminRouter.delete("/delete/:adminId", isAdmin, deleteAdmin);
adminRouter.put("/update/:adminId", isAdmin, updateAdmin);
adminRouter.get("/get/:adminId", isAdmin, getAdmin);
adminRouter.put("/update-student/:id", memoryupload.single("file"), isLoggedin, isAdmin, adminUpdateStudent);
adminRouter.put("/update-teacher/:id", isAdmin, adminUpdateTeacher);
adminRouter.put("/assign-teacher-roles/:id", isAdmin, adminAssignTeacherRole);
adminRouter.put(
  "/suspend-withdraw-teacher/:id",
  isAdmin,
  suspendWithdrawTeacher
);
adminRouter.post("/general-login", generalLogin);
adminRouter.get("/me", isLoggedin, getLoggdInUser);
adminRouter.post("/login", login);
adminRouter.post(
  "/upload-students",
  isAdmin,
  memoryupload.single("file"),
  uploadStudent
);
adminRouter.post(
  "/upload-questions",
  isAdmin,
  memoryupload.single("file"),
  uploadQuestion
);
adminRouter.get("/analytics", isAdmin, portalAnalytics);

export default adminRouter;
