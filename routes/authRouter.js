import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  refreshToken
} from "../controllers/auth/AuthControllers.js";
import { isAdmin } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/create", isAdmin, createUser);
authRouter.get("/user/:id", isAdmin,  getUser);
authRouter.put("/update/:id", isAdmin, updateUser);
authRouter.delete("/delete/:id", isAdmin, deleteUser);
authRouter.get("/all", isAdmin, getAllUsers);
authRouter.post("/refresh", refreshToken)

export default authRouter;
