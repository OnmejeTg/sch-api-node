import express from "express";
import {
  createAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  login,
} from "../controllers/admin/adminController.js";
const adminRouter = express.Router();

adminRouter.post("/create-admin", createAdmin);
adminRouter.get("/all-admin", getAllAdmins);
adminRouter.delete("/delete-admin/:adminId", deleteAdmin);
adminRouter.put("/update-admin/:adminId", updateAdmin);
adminRouter.get("/get-admin/:adminId", getAdmin);
adminRouter.post("/login", login);

export { adminRouter };
