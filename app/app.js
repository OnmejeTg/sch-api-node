import express from "express";
import studentRouter from "../routes/studentRouter.js";
import authRouter from "../routes/authRouter.js";
import adminRouter from "../routes/adminRouter.js";
import teacherRouter from "../routes/teacherRouter.js";
import acadmicTermRouter from "../routes/academicTerm.js";
import { notFoundHandler, globalErrorHandler } from "../middleware/errorHandler.js";
import academicYearRouter from "../routes/academicYear.js";

const app = express();
app.use(express.json());

// Mount your routers
app.use("/api/v2/student", studentRouter);
app.use("/api/v2/auth", authRouter);
app.use("/api/v2/admin", adminRouter);
app.use("/api/v2/teacher", teacherRouter);
app.use("/api/v2/acadmic-term", acadmicTermRouter);
app.use("/api/v2/acadmic-year", academicYearRouter);


// Use error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
