import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
} from "../controllers/auth/AuthControllers.js";

const authRouter = express.Router();

authRouter.post("/create", createUser);
authRouter.get("/user/:id", getUser);
authRouter.put("/update/:id", updateUser);
authRouter.delete("/delete/:id", deleteUser);
authRouter.get("/all-users", getAllUsers);

export default authRouter;
