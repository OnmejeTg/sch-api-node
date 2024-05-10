import express from 'express';
import { createAcademicTerm, getAllTerms, updateTerm, deleteTerm , getTerm} from '../controllers/admin/academicTermController.js';
import { isAdmin } from '../middleware/auth.js';
const acadmicTermRouter  = express.Router();

acadmicTermRouter.post('/create-term', isAdmin, createAcademicTerm)
acadmicTermRouter.get('/all-terms', isAdmin, getAllTerms)
acadmicTermRouter.get('/get-term/:id', isAdmin, getTerm)
acadmicTermRouter.put('/update-term/:id', isAdmin, updateTerm)
acadmicTermRouter.delete('/delete-term/:id', isAdmin, deleteTerm)

export default acadmicTermRouter;