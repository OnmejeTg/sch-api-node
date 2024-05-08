import express from 'express';
import studentRouter from '../routes/studentRouter.js';
import authRouter from '../routes/authRouter.js';
import { adminRouter } from '../routes/adminRouter.js';

const app = express();
app.use(express.json());

app.use("/api/v2/student", studentRouter)
app.use("/api/v2/auth", authRouter)
app.use("/api/v2/admin", adminRouter)

export default app;