import express from 'express';
import { upload } from '../middlewares/upload.js';
import * as videoController from '../controllers/videoController.js';

const router = express.Router();

router.post('/upload', upload.single('video'), videoController.uploadVideo);

router.get('/:clientPublicKey/:orientation', videoController.listVideos);

export default router;
