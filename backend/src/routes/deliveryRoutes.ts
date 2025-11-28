import { Router } from 'express';
import {
  assignRider,
  updateDeliveryStatus,
  getDeliveries,
} from '../controllers/deliveryController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

router.post('/assign', authenticate, authorize(UserRole.ADMIN), assignRider);
router.get('/', authenticate, getDeliveries);
router.put('/:id/status', authenticate, updateDeliveryStatus);

export default router;

