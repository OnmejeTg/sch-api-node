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
  uploadStudent
} from "../controllers/admin/adminController.js";
import { isAdmin, isLoggedin } from "../middleware/auth.js";
import multer from 'multer';



const adminRouter = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



adminRouter.post("/create", isAdmin, createAdmin);
adminRouter.get("/all", isAdmin, getAllAdmins);
adminRouter.delete("/delete/:adminId", isAdmin, deleteAdmin);
adminRouter.put("/update/:adminId", isAdmin, updateAdmin);
adminRouter.get("/get/:adminId", isAdmin, getAdmin);
adminRouter.put("/update-student/:id", isAdmin, adminUpdateStudent);
adminRouter.put("/update-teacher/:id", isAdmin, adminUpdateTeacher);
adminRouter.put("/assign-teacher-roles/:id", isAdmin, adminAssignTeacherRole);
adminRouter.put("/suspend-withdraw-teacher/:id", isAdmin, suspendWithdrawTeacher);
adminRouter.post("/general-login", generalLogin);
adminRouter.get("/me", isLoggedin, getLoggdInUser);
adminRouter.post("/login", login);
adminRouter.post("/upload-student", upload.single('file'), uploadStudent);

export default adminRouter;
