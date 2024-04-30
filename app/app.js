import express from 'express';
import studentRouter from '../routes/studentRouter.js';
import authRouter from '../routes/authRouter.js';

const app = express();
app.use(express.json());

app.use("/api/v2/students", studentRouter)
app.use("/api/v2/auth", authRouter)

export default app;