import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  refreshToken
} from "../controllers/auth/AuthControllers.js";

const authRouter = express.Router();

authRouter.post("/create", createUser);
authRouter.get("/user/:id", getUser);
authRouter.put("/update/:id", updateUser);
authRouter.delete("/delete/:id", deleteUser);
authRouter.get("/all-users", getAllUsers);
authRouter.post("/refresh", refreshToken)

export default authRouter;
