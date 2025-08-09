import express from 'express';
import { testUrlBuilder } from '../controllers/testController.js';

const router = express.Router();

// Test route for URL builder
router.get('/url-builder', testUrlBuilder);

export default router;
