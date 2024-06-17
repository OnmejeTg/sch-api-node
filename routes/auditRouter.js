import express from 'express';
import { createAudit, getAudit } from "../controllers/admin/auditCtrl.js";

const auditRouter = express.Router();

auditRouter.post('/create', createAudit);
auditRouter.get('/audits', getAudit)



export default auditRouter
