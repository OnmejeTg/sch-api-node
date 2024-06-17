import express from 'express';
import { createAudit, getAudit, getSingleAudit, deleteAudit } from "../controllers/admin/auditCtrl.js";

const auditRouter = express.Router();

auditRouter.post('/create', createAudit);
auditRouter.get('/all-audits', getAudit)
auditRouter.get('/:id', getSingleAudit)
auditRouter.delete('/:id', deleteAudit)



export default auditRouter
