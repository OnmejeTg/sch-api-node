import express from "express";
import {
  allResults,
  updateResult,
  uploadScores,
  deleteResult,
  deleteAllResult,
  getResultById,
  generateResultPDFCtrl,
  calResult,
  getResultByClassId
} from "../controllers/students/resultCtrl.js";
import { isTeacherOrAdmin, isAdmin } from "../middleware/auth.js";
import { memoryupload } from "../utils/multer.js";

import {updateResultValidationRules, deleteResultValidationRules} from "../validators/resultValidator.js"

const resultRouter = express.Router();

resultRouter.post(
  "/upload-scores",
  isTeacherOrAdmin,
  memoryupload.single("file"),
  uploadScores
);
resultRouter.get("/all-results", isTeacherOrAdmin, allResults);
resultRouter.put(
  "/update/:id",
  updateResultValidationRules,
  isTeacherOrAdmin,
  updateResult
);
resultRouter.delete(
  "/delete/:id",
  deleteResultValidationRules,
  isAdmin,
  deleteResult
);
resultRouter.delete(
  "/delete-all/",
  isAdmin,
  deleteAllResult
);

resultRouter.get(
  "/get-result/:studentId",
  isAdmin,
  getResultById
);
resultRouter.get(
  "/get-result-pdf/:studentId",
  // isAdmin,
  generateResultPDFCtrl
);

resultRouter.post("/cal-result", calResult)
resultRouter.get("/results/class/:classId", getResultByClassId)

export default resultRouter;
