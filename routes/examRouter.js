import express from 'express';
import { createExam, deleteExam, getAllExams, getExam, updateExam } from '../controllers/teachers/examCtrl.js';
import { isTeacher, isTeacherOrAdmin } from '../middleware/auth.js';

const examRouter = express.Router();


examRouter.post('/create', isTeacherOrAdmin, createExam)
examRouter.get('/all-exams', isTeacherOrAdmin, getAllExams)
examRouter.get('/:id', isTeacherOrAdmin, getExam)
examRouter.put('/update/:id', isTeacherOrAdmin, updateExam)
examRouter.delete('/delete/:id', isTeacherOrAdmin, deleteExam)

export default examRouter