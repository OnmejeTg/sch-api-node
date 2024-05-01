import express from "express";
import {registerStudent, getStudents, login, logout} from "../controllers/students/studentController.js"


const studentRouter = express.Router();

studentRouter.get("/login", login);
studentRouter.get("/logout", logout);
studentRouter.post("/register", registerStudent);
studentRouter.get("/all-students", getStudents);


export default studentRouter;
