import express from "express";
import {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear,
  deleteAcademicYear,
  getAcademicYearById,
  getCurrentYear
} from "../controllers/admin/academicYearCtrl.js";
import { isAdmin, isTeacherOrAdmin } from "../middleware/auth.js";
import { updateAcademicYearValidationRules } from "../validators/academicYearValidators.js";


const academicYearRouter = express.Router();

academicYearRouter.post("/create", isAdmin, createAcademicYear);
academicYearRouter.get("/", isTeacherOrAdmin, getAcademicYears);
academicYearRouter.get("/current-year", isTeacherOrAdmin, getCurrentYear);
academicYearRouter.get("/:id", isTeacherOrAdmin, getAcademicYearById);
academicYearRouter.put("/update/:id", updateAcademicYearValidationRules, isAdmin, updateAcademicYear);
academicYearRouter.delete("/delete/:id", isAdmin, deleteAcademicYear);


export default academicYearRouter;
