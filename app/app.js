import express from "express";
import cors from "cors";
import studentRouter from "../routes/studentRouter.js";
import authRouter from "../routes/authRouter.js";
import adminRouter from "../routes/adminRouter.js";
import teacherRouter from "../routes/teacherRouter.js";
import acadmicTermRouter from "../routes/academicTerm.js";
import {
  notFoundHandler,
  globalErrorHandler,
} from "../middleware/errorHandler.js";
import academicYearRouter from "../routes/academicYear.js";
import claasLevelRouter from "../routes/classLevel.js";
import subjectRouter from "../routes/subjectRouter.js";
import examRouter from "../routes/examRouter.js";
import questionRouter from "../routes/questionRouter.js";
import schoolFeeRouter from "../routes/schoolFee.js";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());

const corsOptions = {
  origin: ['http://new-project-35520.web.app', 'http://localhost:5173'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use CORS middleware
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Mount your routers
app.use("/api/v2/student", studentRouter);
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/admin", adminRouter);
app.use("/api/v2/teacher", teacherRouter);
app.use("/api/v2/acadmic-term", acadmicTermRouter);
app.use("/api/v2/acadmic-year", academicYearRouter);
app.use("/api/v2/class-level", claasLevelRouter);
app.use("/api/v2/subject", subjectRouter);
app.use("/api/v2/exam", examRouter);
app.use("/api/v2/question", questionRouter);
app.use("/api/v2/payment", schoolFeeRouter);

// Use error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
