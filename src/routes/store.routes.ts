import { Router } from 'express';
import { 
  handleAddToCart,
  handleCheckout,
  handleGetStats,
  handleGenerateDiscount
} from '../controllers/store.controller';

const router = Router();

router.post('/cart/add', handleAddToCart);
router.post('/cart/checkout', handleCheckout);
router.get('/admin/stats', handleGetStats);
router.post('/admin/generate-discount', handleGenerateDiscount);

export default router;