import { Cart, CartItem, Order, Coupon, AdminStats } from '../models/types';

const carts = new Map<string, Cart>();
const orders: Order[] = [];

export function addToCart(userId: string, item: CartItem): Cart {

  //valiadtion for quantity and price
  if (item.quantity <= 0 || item.price < 0) {
    throw new Error('Invalid quantity or price parameters');
  }

  // maintain all the items added to cart
  if (!carts.has(userId)) {
    carts.set(userId, { items: [] });
  }

  // if user's cart already exist update it orelse make an entry
  const cart = carts.get(userId)!;
  const existingItem = cart.items.find(i => i.productId === item.productId);

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.items.push({ ...item });
  }

  return cart;
}

export function checkout(userId: string, couponCode?: string): Order {
  const cart = carts.get(userId);
  if (!cart || cart.items.length === 0) {
    throw new Error('Cannot checkout an empty cart');
  }

  const subtotal = cart.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
  let discount = 0;


  const finalAmount = subtotal - discount;

  const newOrder: Order = {
    id: `ord_${Math.random().toString(36).substring(2, 11)}`,
    items: [...cart.items],
    totalAmount: subtotal,
    discountApplied: discount,
    finalAmount,
    couponCodeUsed: couponCode
  };

  //Commit the current order to the history tracking array
  orders.push(newOrder);
  
  //Clear out the active user's cart state
  carts.set(userId, { items: [] }); 

  return newOrder;
}