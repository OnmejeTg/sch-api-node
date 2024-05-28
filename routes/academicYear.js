import express from "express";
import {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear,
  deleteAcademicYear,
  getAcademicYearById,
  getCurrentYear
} from "../controllers/admin/academicYearCtrl.js";
import { isAdmin } from "../middleware/auth.js";
import { updateAcademicYearValidationRules } from "../validators/academicYearValidators.js";


const academicYearRouter = express.Router();

academicYearRouter.post("/create", isAdmin, createAcademicYear);
academicYearRouter.get("/", isAdmin, getAcademicYears);
academicYearRouter.get("/current-year", isAdmin, getCurrentYear);
academicYearRouter.get("/:id", isAdmin, getAcademicYearById);
academicYearRouter.put("/update/:id", updateAcademicYearValidationRules, isAdmin, updateAcademicYear);
academicYearRouter.delete("/delete/:id", isAdmin, deleteAcademicYear);


export default academicYearRouter;
