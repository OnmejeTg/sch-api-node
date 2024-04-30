import express from "express";
import { login, logout } from "../controllers/auth/AuthControllers.js";

const authRouter = express.Router();

authRouter.get("/login", login);
authRouter.get("/logout", logout);


export default authRouter;
