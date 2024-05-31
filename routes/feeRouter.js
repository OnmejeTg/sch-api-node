import express from 'express';
import { createFee, getFee, getFees, updateFee, deleteFee } from '../controllers/payment/invoiceCtrl.js';

const feeRouter = express.Router();

feeRouter.get('/all-fees', getFees);
feeRouter.get('/single-fee/:id', getFee)
feeRouter.post('/create', createFee)
feeRouter.put('/update/:id', updateFee)
feeRouter.delete('/delete/:id', deleteFee)

export default feeRouter