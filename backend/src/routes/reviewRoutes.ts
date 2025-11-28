import { Router } from 'express';
import {
  createReview,
  getProductReviews,
  getFarmerReviews,
  markHelpful,
} from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

// Create a review (buyers only)
router.post('/', authenticate, authorize(UserRole.BUYER), createReview);

// Get reviews for a product (public)
router.get('/product/:productId', authenticate, getProductReviews);

// Get reviews for a farmer (public)
router.get('/farmer/:farmerId', authenticate, getFarmerReviews);

// Mark review as helpful
router.post('/:reviewId/helpful', authenticate, markHelpful);

export default router;

