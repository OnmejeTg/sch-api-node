import express from "express";
import {
  registerStudent,
  getStudents,
  login,
  logout,
  getStudent,
  updateStudent,
  deleteStudent
} from "../controllers/students/studentController.js";
import { isAdmin, isLoggedin } from "../middleware/auth.js";

const studentRouter = express.Router();

studentRouter.post("/login", login);
studentRouter.post("/logout", logout);
studentRouter.post("/register", registerStudent);
studentRouter.get("/all", isAdmin, getStudents);
studentRouter.get("/get/:id", isAdmin, getStudent);
studentRouter.put("/update/:id", isLoggedin, updateStudent);
studentRouter.delete("/delete/:id", isAdmin, deleteStudent);

export default studentRouter;
