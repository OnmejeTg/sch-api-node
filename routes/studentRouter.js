import express from "express";
import {registerStudent, getStudents, login, logout} from "../controllers/students/studentController.js"
import { isAdmin } from "../middleware/auth.js";


const studentRouter = express.Router();

studentRouter.post("/login", login);
studentRouter.post("/logout", logout);
studentRouter.post("/register", registerStudent);
studentRouter.get("/all-students", isAdmin, getStudents);


export default studentRouter;
