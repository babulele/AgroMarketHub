import { Router } from 'express';
import {
  createAuction,
  getAuctions,
  getAuction,
  placeBid,
  getFarmerAuctions,
  closeAuction,
  getBuyerBids,
} from '../controllers/auctionController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

// Get all auctions (public, but requires auth)
router.get('/', authenticate, getAuctions);

// Get single auction
router.get('/:id', authenticate, getAuction);

// Create auction (farmers only)
router.post('/', authenticate, authorize(UserRole.FARMER), createAuction);

// Place bid (buyers only)
router.post('/:id/bid', authenticate, authorize(UserRole.BUYER), placeBid);

// Get farmer's auctions
router.get('/farmer/my-auctions', authenticate, authorize(UserRole.FARMER), getFarmerAuctions);

// Close auction (farmer only)
router.put('/:id/close', authenticate, authorize(UserRole.FARMER), closeAuction);

// Get buyer's bids
router.get('/buyer/my-bids', authenticate, authorize(UserRole.BUYER), getBuyerBids);

export default router;


