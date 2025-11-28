import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadIdDocument,
  getPendingVerifications,
  verifyFarmer,
  getFarmerPublicProfile,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

router.get('/farmers/:farmerId/profile', getFarmerPublicProfile);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/upload-id', authenticate, authorize(UserRole.FARMER), uploadIdDocument);
router.get('/verifications/pending', authenticate, authorize(UserRole.ADMIN), getPendingVerifications);
router.put('/verifications/:farmerId', authenticate, authorize(UserRole.ADMIN), verifyFarmer);

export default router;

