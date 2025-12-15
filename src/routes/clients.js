import express from 'express';
import { getAllClients } from '../controllers/clientController.js';

const router = express.Router();

router.get('/', getAllClients);

export default router;
