import express from 'express';
import { createQuestion, deleteQuestion, getAllQuestions, getQuestion, updateQuestion } from "../controllers/teachers/questionCtrl.js";
import { isTeacher } from '../middleware/auth.js';

const questionRouter = express.Router();

questionRouter.post('/create', isTeacher, createQuestion)
questionRouter.get('/', isTeacher, getQuestion)
questionRouter.get('/all', isTeacher, getAllQuestions)
questionRouter.put('/update', isTeacher, updateQuestion)
questionRouter.delete('/delete', isTeacher, deleteQuestion)

export default questionRouter;