import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import userRoutes from './userRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import deliveryRoutes from './deliveryRoutes';
import mpesaRoutes from './mpesaRoutes';
import adminRoutes from './adminRoutes';
import uploadRoutes from './uploadRoutes';
import reviewRoutes from './reviewRoutes';
import auctionRoutes from './auctionRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/reviews', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/mpesa', mpesaRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/auctions', auctionRoutes);

export default router;

