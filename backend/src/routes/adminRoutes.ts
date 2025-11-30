import { Router } from 'express';
import {
  getDisputes,
  resolveDispute,
  getMarketplaceStats,
  getRegionalData,
  getMarketPrices,
  getFoodScarcityTrends,
  getBuyerActivity,
  getSupplyDemandAnalysis,
  createUser,
  getUsers,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

router.get('/disputes', authenticate, authorize(UserRole.ADMIN), getDisputes);
router.put('/disputes/:id/resolve', authenticate, authorize(UserRole.ADMIN), resolveDispute);
router.get('/stats', authenticate, authorize(UserRole.ADMIN), getMarketplaceStats);
router.get('/regional-data', authenticate, authorize(UserRole.ADMIN), getRegionalData);
router.get('/market-prices', authenticate, authorize(UserRole.ADMIN), getMarketPrices);
router.get('/food-scarcity', authenticate, authorize(UserRole.ADMIN), getFoodScarcityTrends);
router.get('/buyer-activity', authenticate, authorize(UserRole.ADMIN), getBuyerActivity);
router.get('/supply-demand', authenticate, authorize(UserRole.ADMIN), getSupplyDemandAnalysis);
router.post('/users', authenticate, authorize(UserRole.ADMIN), createUser);
router.get('/users', authenticate, authorize(UserRole.ADMIN), getUsers);

export default router;

