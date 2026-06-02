import { Request, Response } from 'express';
import { addToCart ,checkout ,getAdminStats} from '../services/store.services';

export const handleAddToCart = (req: Request, res: Response): void => {
  try {
    const { userId, productId, price, quantity } = req.body;

    // Validation for I/p from UI
    if (!userId || !productId || typeof price !== 'number' || typeof quantity !== 'number') {
       res.status(400).json({ error: 'Missing or malformed payload fields' });
       return;
    }

    // keeps items on cart
    const updatedCart = addToCart(userId, { productId, price, quantity });

    res.status(200).json({ message: 'Item added to cart', cart: updatedCart });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const handleCheckout = (req: Request, res: Response): void => {
  try {
    const { userId, couponCode } = req.body;

    // validation check for userId
    if (!userId) {
       res.status(400).json({ error: 'UserId required for checkout transaction' });
       return;
    }

    // checkout all the product in cart , if providing a valid coupon gets applied 
    const order = checkout(userId, couponCode);
    res.status(201).json({ message: 'Order completed successfully', order });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const handleGetStats = (_req: Request, res: Response): void => {
  //collecting all the details
  const stats = getAdminStats();
  res.status(200).json(stats);
};