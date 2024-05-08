import express from "express";
import {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  login,
} from "../controllers/admin/adminController.js";
import { isAdmin } from "../middleware/auth.js";

const adminRouter = express.Router();

adminRouter.post("/create-admin", isAdmin, createAdmin);
adminRouter.get("/all-admin", isAdmin, getAllAdmins);
adminRouter.delete("/delete-admin/:adminId", isAdmin, deleteAdmin);
adminRouter.put("/update-admin/:adminId", isAdmin, updateAdmin);
adminRouter.get("/get-admin/:adminId", isAdmin, getAdmin);
adminRouter.post("/login", login);

export { adminRouter };
