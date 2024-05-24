import express from 'express';
import { createAnnouncement, deleteAnnouncement, getAnnouncements, getSingleAnnouncement, updateAnnouncement } from '../controllers/admin/announcementCtrl.js';


const announcementRouter = express.Router();


announcementRouter.post('/',  createAnnouncement);
announcementRouter.get('/',  getAnnouncements);
announcementRouter.get('/:id',  getSingleAnnouncement);
announcementRouter.put('/:id',  updateAnnouncement);
announcementRouter.delete('/:id',  deleteAnnouncement);


export default announcementRouter