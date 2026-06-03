# Business Logic & Architectural Decisions (ADR)

## 1. Domain Isolation using Modular Functional State
- **Status:** Approved
- **Business Requirement:** Keep customer carts, order receipts, and admin parameters segregated and safe in an asynchronous environment without database locking overhead.
- **Decision:** Encapsulated local business states utilizing scoped maps and arrays (`carts = new Map()`, `orders = []`, `coupons = new Map()`).
- **Business Logic Impact:** - Individual users cannot view or corrupt another shopper's cart context.
  - Cart item additions automatically run a deduplication merge rule: if a product already exists in a user's cart, the engine mutates the state by adding to the quantity rather than generating a duplicated line item entry.

---

## 2. Separation of Purchase Operations from Promotion Controls
- **Status:** Approved
- **Business Requirement:** Ensure the checkout transaction path remains fast and unaffected by marketing campaigns or admin coupon availability.
- **Decision:** Isolated the purchase execution cycle (`checkout`) completely from the marketing generation cycles (`generateDiscountCode`).
- **Business Logic Impact:** - Customers can buy their items at any moment without the checkout logic checking background promotional limits.
  - The `checkout` logic acts as a strict financial clearinghouse: it calculates the order subtotal using a functional array reduction , computes a exact 2-decimal financial reduction if a coupon is provided, invalidates that coupon immediately to prevent double-spending fraud, and flushes the customer's cart atomically.

---

## 3. Strict 3rd-Order Promotional Cadence Rules
- **Status:** Approved
- **Business Requirement:** Offer a 10% discount coupon exactly on every 3rd order placed in the system, while preventing managers from creating unauthorized or premature discounts.
- **Decision:** Configured hardcoded constraints `NTH_ORDER = 3` and `DISCOUNT_PERCENTAGE = 10` inside the business engine layer.
- **Business Logic Impact:** - The coupon generator strictly evaluates the upcoming pipeline index: `const nextOrderNumber = orders.length + 1;`.
  - If the store has 0 or 1 completed orders, the next order target is #1 or #2. Because these indices do not satisfy the 3rd-order milestone, the engine enforces an immediate business denial state, throwing a literal error message `"Better luck next time"`.
  - Only when exactly 2 completed transactions exist in the store logs does the system unlock the generation gate to register a `BUMPER_OFFER3_` coupon.

---

## 4. Input Parameters & Defensive Guardrails
- **Status:** Approved
- **Business Requirement:** Prevent financial data corruption, negative pricing exploits, or ghost orders.
- **Decision:** Built strict parameter validation gates directly at the input boundaries of the business service methods.
- **Business Logic Impact:** - Cart addition requests are stopped instantly if an item's quantity is less than or equal to 0, or if its price is a negative number.
  - The checkout process explicitly halts with descriptive messages if an invalid coupon string is passed, or if a user attempts to reuse a code that has already been marked `isUsed: true`.

---

## 5. Clean Slate Accounting for Financial Testing
- **Status:** Approved
- **Business Requirement:** Ensure that internal metrics, revenue tracking summaries, and unit tests calculate financial balances accurately without stale carry-over numbers.
- **Decision:** Exposed a controlled `resetSystemState()` macro utility specifically for test environments.
- **Business Logic Impact:** Wipes out all active customer data structures and sets the completed `orders` array back to zero. This allows accounting logic and test routines to verify profit totals and promotional structures starting from a clear balance sheet every single time.