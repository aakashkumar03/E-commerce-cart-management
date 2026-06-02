import { Router } from 'express';
import { 
  handleAddToCart,
  handleCheckout
} from '../controllers/store.controller';

const router = Router();

router.post('/cart/add', handleAddToCart);
router.post('/cart/checkout', handleCheckout);

export default router;