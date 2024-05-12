import express from "express";
import {
  createAcademicYear,
  getAcademicYears,
  updateAcademicYear,
  deleteAcademicYear,
  getAcademicYearById
} from "../controllers/admin/academicYearCtrl.js";
import { isAdmin } from "../middleware/auth.js";

const academicYearRouter = express.Router();

academicYearRouter.post("/create", isAdmin, createAcademicYear);
academicYearRouter.get("/", isAdmin, getAcademicYears);
academicYearRouter.get("/:id", isAdmin, getAcademicYearById);
academicYearRouter.put("update/:id", isAdmin, updateAcademicYear);
academicYearRouter.delete("delete/:id", isAdmin, deleteAcademicYear);

export default academicYearRouter;
