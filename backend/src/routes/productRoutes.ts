import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getTrendingProducts,
} from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models';

const router = Router();

router.get('/trending', authenticate, getTrendingProducts);
router.get('/', authenticate, getProducts);
router.get('/:id', authenticate, getProduct);
router.post('/', authenticate, authorize(UserRole.FARMER), createProduct);
router.put('/:id', authenticate, authorize(UserRole.FARMER), updateProduct);
router.delete('/:id', authenticate, authorize(UserRole.FARMER), deleteProduct);

export default router;

