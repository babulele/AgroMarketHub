import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

router.post('/', authenticate, authorize(UserRole.BUYER), createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.put('/:id/status', authenticate, updateOrderStatus);
router.put('/:id/cancel', authenticate, cancelOrder);

export default router;

