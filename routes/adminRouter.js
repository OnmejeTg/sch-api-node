import express from "express";
import { createAdmin, getAllAdmins} from "../controllers/admin/adminController.js";
const adminRouter = express.Router();

adminRouter.post("/create-admin", createAdmin);
adminRouter.get("/all-admin", getAllAdmins);

export { adminRouter };
