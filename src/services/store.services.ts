import { Cart, CartItem, Order, Coupon, AdminStats } from '../models/types';

const carts = new Map<string, Cart>();
const orders: Order[] = [];

const coupons = new Map<string, Coupon>();

const NTH_ORDER = 3; // Configured for every nth order
const DISCOUNT_PERCENTAGE = 10; // considering 10% discount

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

  // Validate the coupon code
  if (couponCode) {
    const coupon = coupons.get(couponCode);
    if (!coupon) {
      throw new Error('Invalid coupon code , either apply a valid one or remove it to proceed forward');
    }
    if (coupon.isUsed) {
      throw new Error('Coupon has already been consumed , kindly remove it to proceed forward');
    }

    discount = parseFloat(((subtotal * coupon.discountPercentage) / 100).toFixed(2));
    coupon.isUsed = true;
  }

  const finalAmount = subtotal - discount;

  const newOrder: Order = {
    id: `ord_${Math.random().toString(36).substring(2, 11)}`,
    items: [...cart.items],
    totalAmount: subtotal,
    discountApplied: discount,
    finalAmount,
    couponCodeUsed: couponCode
  };

  // Commit the current order to the history tracking array
  orders.push(newOrder);
  
  // Clear out the active user's cart state
  carts.set(userId, { items: [] }); 

  const nextOrderNumber = orders.length + 1;
  
  // If the upcoming order matchs to the nth order,then coupon code automatically generated
  if (nextOrderNumber % NTH_ORDER === 0) {
    const generatedCode = `BUMBER_OFFER${nextOrderNumber}_${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    // new coupon details
    const newCoupon: Coupon = {
      code: generatedCode,
      discountPercentage: DISCOUNT_PERCENTAGE,
      isUsed: false
    };
    
    // coupon added
    coupons.set(generatedCode, newCoupon);
    console.log(`Milestone approach detected! Created coupon: ${generatedCode}`);
  }


  return newOrder;
}

export function getAdminStats(): AdminStats {
  let totalItemsPurchased = 0;
  let totalRevenue = 0;
  let totalDiscountAmount = 0;

  orders.forEach(order => {
    totalRevenue += order.finalAmount;
    totalDiscountAmount += order.discountApplied;
    order.items.forEach((item: CartItem) => {
      totalItemsPurchased += item.quantity;
    });
  });

  return {
    totalItemsPurchased,
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    discountCodes: Array.from(coupons.values()),
    totalDiscountAmount: parseFloat(totalDiscountAmount.toFixed(2))
  };
}
