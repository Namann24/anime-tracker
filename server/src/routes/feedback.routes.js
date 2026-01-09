import express from 'express';
import { createFeedback, getAllFeedback, updateFeedbackStatus, deleteFeedback } from '../controllers/feedback.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js';

const router = express.Router();

// Public route to submit
router.post('/', createFeedback);

// Admin only routes
router.get('/all', protect, admin, getAllFeedback);
router.put('/:id/status', protect, admin, updateFeedbackStatus);
router.delete('/:id', protect, admin, deleteFeedback);

export default router;
