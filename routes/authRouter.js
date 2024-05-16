import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  refreshToken,
  changePassword,
  adminChangePassword,
} from "../controllers/auth/AuthControllers.js";
import { isAdmin, isLoggedin } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/create", isAdmin, createUser);
authRouter.get("/user/:id", isAdmin,  getUser);
authRouter.put("/update/:id", isAdmin, updateUser);
authRouter.delete("/delete/:userId", isAdmin, deleteUser);
authRouter.get("/all", isAdmin, getAllUsers);
authRouter.post("/refresh", refreshToken)
authRouter.post("/reset-password", isLoggedin, changePassword)
authRouter.post("/admin-reset-password/:id", isAdmin, adminChangePassword)

export default authRouter;
