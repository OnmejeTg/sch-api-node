import express from "express";
import {registerStudent, getStudent} from "../controllers/students/studentController.js"

const studentRouter = express.Router();

studentRouter.post("/register", registerStudent);
studentRouter.get("", getStudent);

export default studentRouter;
