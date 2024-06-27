import express from "express";
import {
  registerStudent,
  getStudents,
  login,
  logout,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadPicture,
} from "../controllers/students/studentController.js";
import { isAdmin, isLoggedin, isStudent } from "../middleware/auth.js";
import { memoryupload, upload } from "../utils/multer.js";
import { validateStudentRegistration } from "../validators/studentValidator.js";


const studentRouter = express.Router();

studentRouter.post("/login", login);
studentRouter.post("/logout", logout);
studentRouter.post("/create",validateStudentRegistration, registerStudent);
studentRouter.get("/all", isAdmin, getStudents);
studentRouter.get("/get/:id", isAdmin, getStudent);
studentRouter.put("/update", memoryupload.single("file"), isLoggedin, isStudent, updateStudent);
studentRouter.delete("/delete/:id", isAdmin, deleteStudent);
studentRouter.post("/upload-pics/", uploadPicture);

export default studentRouter;
