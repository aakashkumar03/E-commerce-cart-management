export interface CartItem {
  productId: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  couponCodeUsed?: string;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  isUsed: boolean;
}

export interface AdminStats {
  totalItemsPurchased: number;
  totalRevenue: number;
  discountCodes: Coupon[];
  totalDiscountAmount: number;
  totalOrders: number;
}