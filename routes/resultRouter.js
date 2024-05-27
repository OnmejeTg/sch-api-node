import express from "express";
import { uploadScores } from "../controllers/students/resultCtrl.js";
import { isAdmin } from "../middleware/auth.js";
import { memoryupload } from "../utils/multer.js";

const resultRouter = express.Router();

resultRouter.post(
  "/upload-scores",
  isAdmin,
  memoryupload.single("file"),
  uploadScores
);

export default resultRouter;
