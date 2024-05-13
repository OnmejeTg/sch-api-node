import express from "express";
import {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  getSubjectById,
} from "../controllers/admin/subjectCtrl.js";
import { isAdmin } from "../middleware/auth.js";

const subjectRouter = express.Router();

// subjectRouter.post("/", isAdmin, createClassLevel);
// subjectRouter.post("/", isAdmin, getClassLevels);
// subjectRouter.get("/:id", isAdmin, getClassLevelById);
// subjectRouter.update("/:id", isAdmin, updateClassLevel);
// subjectRouter.delete("/:id", isAdmin, deleteClassLevel);

subjectRouter.route("/").post(isAdmin, createSubject).get(isAdmin, getSubjects);
subjectRouter
  .route("/:id")
  .get(isAdmin, getSubjectById)
  .put(isAdmin, updateSubject)
  .delete(isAdmin, deleteSubject);

export default subjectRouter;
