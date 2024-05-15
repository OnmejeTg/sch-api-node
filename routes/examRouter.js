import express from 'express';
import { createExam } from '../controllers/teachers/examCtrl.js';
import { isTeacher } from '../middleware/auth.js';

const examRouter = express.Router();


examRouter.post('/create', isTeacher, createExam)

export default examRouter