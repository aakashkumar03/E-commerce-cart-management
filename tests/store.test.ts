import { 
  addToCart, 
  checkout, 
  generateDiscountCode, 
  getAdminStats, 
  resetSystemState 
} from '../src/services/store.services';

describe('Manual Coupon Generation & Checkout Feature', () => {
  
  beforeEach(() => {
    // Completely reset
    resetSystemState(); 
  });

  test('Should block coupon generation unless the next order number matches the Nth criteria', () => {
    // 1. Initially, orders array is empty (length 0). The next order is #1.
    // 1 % 3 !== 0, so it should throw an error.
    expect(() => {
      generateDiscountCode();
    }).toThrow('Better luck next time');

    expect(getAdminStats().totalOrders).toBe(0);

    // 2. Process Order #1
    addToCart('user_1', { productId: 'item_A', price: 100, quantity: 1 });
    checkout('user_1');

    // 3. Next order is #2. 2 % 3 !== 0, so it should still throw an error.
    expect(() => {
      generateDiscountCode();
    }).toThrow('Better luck next time');

    expect(getAdminStats().totalOrders).toBe(1);
  });

  test('Should successfully generate a coupon code when the next order is exactly the 3rd order', () => {
    // 1. Complete Order #1
    addToCart('user_1', { productId: 'item_A', price: 50, quantity: 1 });
    checkout('user_1');

    // 2. Complete Order #2
    addToCart('user_2', { productId: 'item_B', price: 80, quantity: 1 });
    checkout('user_2');

    // 3. Total completed orders = 2. Next order index is #3.
    // 3 % 3 === 0, so manual generation is now unlocked!
    const coupon = generateDiscountCode();
    
    expect(coupon.code).toContain('BUMPER_OFFER3_');
    expect(coupon.discountPercentage).toBe(10);
    expect(coupon.isUsed).toBe(false);

    // Verify it is now registered in our admin tracking panel
    const stats = getAdminStats();
    expect(stats.totalOrders).toBe(2);
    expect(stats.discountCodes.length).toBe(1);
    expect(stats.discountCodes[0].code).toBe(coupon.code);
  });

  test('Should apply a 10% discount on the 3rd checkout when utilizing a valid generated coupon code', () => {
    // 1. Run 2 checkouts to open up the generation window
    addToCart('user_1', { productId: 'item_A', price: 100, quantity: 1 });
    checkout('user_1');
    addToCart('user_2', { productId: 'item_B', price: 100, quantity: 1 });
    checkout('user_2');

    // 2. Explicitly generate our 3rd order promo code
    const token = generateDiscountCode();

    // 3. Place Order #3 using the newly minted token payload
    addToCart('user_3', { productId: 'item_C', price: 500, quantity: 1 }); // Subtotal = 500
    const order3 = checkout('user_3', token.code);

    // 4. Assertions on financial calculations (10% of 500 is 50)
    expect(order3.totalAmount).toBe(500);
    expect(order3.discountApplied).toBe(50);
    expect(order3.finalAmount).toBe(450);
    expect(order3.couponCodeUsed).toBe(token.code);

    // 5. Total running revenue assessment (100 + 100 + 450 = 650)
    const activeStats = getAdminStats();
    expect(activeStats.totalOrders).toBe(3);
    expect(activeStats.totalRevenue).toBe(650);
    expect(activeStats.totalDiscountAmount).toBe(50);
    expect(activeStats.discountCodes[0].isUsed).toBe(true);
  });

  test('Should fail checkout if attempting to pass a coupon code that has already been consumed', () => {
    // Generate code by making 2 checkouts and to the service action
    addToCart('user_1', { productId: 'item_A', price: 100, quantity: 1 });
    checkout('user_1');
    addToCart('user_2', { productId: 'item_B', price: 100, quantity: 1 });
    checkout('user_2');
    const token = generateDiscountCode();

    // first use on Order #3
    addToCart('user_3', { productId: 'item_C', price: 100, quantity: 1 });
    checkout('user_3', token.code);

    // second use attempt on Order #4
    addToCart('user_4', { productId: 'item_D', price: 100, quantity: 1 });
    
    expect(() => {
      checkout('user_4', token.code);
    }).toThrow('Coupon has already been consumed , kindly remove it to proceed forward');

    expect(getAdminStats().totalOrders).toBe(3);
  });

  test('Should fail checkout if an invalid or completely arbitrary coupon code string is supplied', () => {
    addToCart('user_1', { productId: 'item_A', price: 200, quantity: 1 });
    
    expect(() => {
      checkout('user_1', 'MALICIOUS_OR_FAKE_CODE');
    }).toThrow('Invalid coupon code , either apply a valid one or remove it to proceed forward');
  });
});