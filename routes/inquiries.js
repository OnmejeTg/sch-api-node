import express from "express";
import {
  createInquiry,
  deleteInquiry,
  getInquires,
  getSingleInquiry,
  updateInquiry,
} from "../controllers/inquires/inquiresCtrl.js";
import { isAdmin, isLoggedin, isStudent } from "../middleware/auth.js";

const inquiresRouter = express.Router();

inquiresRouter.post("/", isLoggedin, isStudent, createInquiry);
inquiresRouter.get("/", isLoggedin, isAdmin, getInquires);
inquiresRouter.get("/:id", isLoggedin, isAdmin, getSingleInquiry);
// inquiresRouter.put("/:id", isLoggedin, isAdmin, updateInquiry);
// inquiresRouter.delete("/:id",isLoggedin, isAdmin,  deleteInquiry);

export default inquiresRouter;
