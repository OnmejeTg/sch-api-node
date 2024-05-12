import express from "express";
import {
  createClassLevel,
  deleteClassLevel,
  getClassLevelById,
  getClassLevels,
  updateClassLevel,
} from "../controllers/admin/classLevelCtrl.js";
import { isAdmin } from "../middleware/auth.js";

const claasLevelRouter = express.Router();

// claasLevelRouter.post("/", isAdmin, createClassLevel);
// claasLevelRouter.post("/", isAdmin, getClassLevels);
// claasLevelRouter.get("/:id", isAdmin, getClassLevelById);
// claasLevelRouter.update("/:id", isAdmin, updateClassLevel);
// claasLevelRouter.delete("/:id", isAdmin, deleteClassLevel);

claasLevelRouter
  .route("/")
  .post(isAdmin, createClassLevel)
  .get(isAdmin, getClassLevels);
claasLevelRouter
  .route("/:id")
  .get(isAdmin, getClassLevelById)
  .put(isAdmin, updateClassLevel)
  .delete(isAdmin, deleteClassLevel);

export default claasLevelRouter;
