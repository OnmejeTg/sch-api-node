import express from "express";
import {
  createAcademicTerm,
  getCurrentTerm,
  getAllTerms,
  updateTerm,
  deleteTerm,
  getTerm,
} from "../controllers/admin/academicTermController.js";
import { isAdmin } from "../middleware/auth.js";
const acadmicTermRouter = express.Router();


acadmicTermRouter.post("/create", isAdmin, createAcademicTerm);
acadmicTermRouter.get("/all", isAdmin, getAllTerms);
acadmicTermRouter.get("/current-term", isAdmin, getCurrentTerm);
acadmicTermRouter.get("/:id", isAdmin, getTerm);
acadmicTermRouter.put("/update/:id", isAdmin, updateTerm);
acadmicTermRouter.delete("/delete/:id", isAdmin, deleteTerm);

export default acadmicTermRouter;
