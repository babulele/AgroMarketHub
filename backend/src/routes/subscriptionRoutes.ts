import { Router } from 'express';
import {
  createSubscription,
  getSubscription,
  cancelSubscription,
} from '../controllers/subscriptionController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

router.get('/', authenticate, authorize(UserRole.FARMER), getSubscription);
router.post('/', authenticate, authorize(UserRole.FARMER), createSubscription);
router.put('/cancel', authenticate, authorize(UserRole.FARMER), cancelSubscription);

export default router;

