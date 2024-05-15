import express from 'express';
import { createExam, deleteExam, getAllExams, getExam, updateExam } from '../controllers/teachers/examCtrl.js';
import { isTeacher } from '../middleware/auth.js';

const examRouter = express.Router();


examRouter.post('/create', isTeacher, createExam)
examRouter.get('/all-exams', isTeacher, getAllExams)
examRouter.get('/:id', isTeacher, getExam)
examRouter.put('/update/:id', isTeacher, updateExam)
examRouter.delete('/delete/:id', isTeacher, deleteExam)

export default examRouter