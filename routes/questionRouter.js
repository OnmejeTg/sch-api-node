import express from 'express';
import { createQuestion } from "../controllers/teachers/questionCtrl.js";
import { isTeacher } from '../middleware/auth.js';

const questionRouter = express.Router();

questionRouter.post('/create', isTeacher, createQuestion)

export default questionRouter;