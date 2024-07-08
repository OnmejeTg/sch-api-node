import express from "express";
import {
  createAcademicTerm,
  getCurrentTerm,
  getAllTerms,
  updateTerm,
  deleteTerm,
  getTerm,
} from "../controllers/admin/academicTermController.js";
import { isAdmin, isTeacherOrAdmin } from "../middleware/auth.js";
const acadmicTermRouter = express.Router();


acadmicTermRouter.post("/create", isAdmin, createAcademicTerm);
acadmicTermRouter.get("/all", isTeacherOrAdmin, getAllTerms);
acadmicTermRouter.get("/current-term", isTeacherOrAdmin, getCurrentTerm);
acadmicTermRouter.get("/:id", isTeacherOrAdmin, getTerm);
acadmicTermRouter.put("/update/:id", isAdmin, updateTerm);
acadmicTermRouter.delete("/delete/:id", isAdmin, deleteTerm);

export default acadmicTermRouter;
