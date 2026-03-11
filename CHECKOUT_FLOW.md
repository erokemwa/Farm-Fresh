# Checkout Flow Detailed Breakdown

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ CUSTOMER ADDS PRODUCTS TO CART                             │
│ - Selects quantity via +/- buttons                         │
│ - Clicks "Add to Cart" button                              │
│ - Toast notification: "✅ Product added to cart"           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CART UPDATES IN REAL-TIME                                  │
│ - updateCartDisplay() renders all items                    │
│ - Calculates total (cartItems.reduce)                      │
│ - Updates badges: header, FAB, cart count                  │
│ - Shows "Checkout" button if items exist                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS "CHECKOUT" BUTTON                              │
│ - Reveals checkout-form-wrapper (hidden → visible)         │
│ - Shows 3-step progress indicator                          │
│ - Focuses on first form field                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ CHECKOUT FORM DISPLAYED (3 fields)                         │
│ 1. Full Name (required, any text)                          │
│ 2. Phone Number (required, Kenyan format: 0[17]XXXXXXXX)   │
│ 3. Delivery Address (required, any text)                   │
│                                                             │
│ Order Summary Table shows:                                 │
│ - Item | Qty | Unit Price | Subtotal                       │
│ - Grand Total (KES)                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ USER FILLS IN FIELDS & BLURS                               │
│ - Real-time validation on blur                             │
│ - Error messages appear inline                             │
│ - Field gets aria-invalid="true"                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS "CONFIRM ORDER" BUTTON                         │
│ - Form submit event fired                                  │
│ - Validates all 3 fields (validateCheckoutField)           │
│ - If validation fails: show errors & return               │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌─────────────────┴─────────────────┐
        │                                   │
    ✗ VALIDATION                        ✓ VALIDATION
     FAILS                                PASSES
        │                                   │
   Return                                  ↓
        │          ┌─────────────────────────────────────────┐
        │          │ CUSTOMER LOOKUP / CREATION             │
        │          │ - Look up in ff_users by phone         │
        │          │ - If found: increment ordersCount      │
        │          │ - If not: create new user              │
        │          │   customerId = 'cust-{timestamp}'      │
        └──────────┤ Add to ff_users array                   │
                   └─────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │ ORDER OBJECT CREATION                               │
        │ - id: 'ord-{timestamp}'                             │
        │ - customerId: (from above)                          │
        │ - customer: name                                    │
        │ - phone: phone (normalized)                         │
        │ - address: address                                  │
        │ - items: [                                          │
        │    { productId, farmerId, farmerName,               │
        │      name, quantity, price, subtotal,               │
        │      itemStatus: 'Pending' }                        │
        │    ... (one per cart item)                          │
        │  ]                                                  │
        │ - total: sum of all subtotals                       │
        │ - status: 'Pending'                                 │
        │ - date: '2026-03-15' (YYYY-MM-DD)                   │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │ PERSIST TO localStorage                             │
        │ - Append order to ff_orders array                   │
        │ - setStore('ff_orders', orders)                     │
        │ - Update ff_users with any new customer            │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │ SHOW ORDER CONFIRMATION                             │
        │ - Hide checkout form                                │
        │ - Hide cart items list                              │
        │ - Hide cart total                                   │
        │ - Show order-confirmation div (3000ms timeout)      │
        │ - "✅ Order placed! Thank you for..."              │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │ GENERATE & DISPLAY RECEIPT                          │
        │ - Receipt block becomes visible                     │
        │ - Populate receipt-meta: Order ID + Date            │
        │ - Populate receipt-customer: Customer name          │
        │ - Build receipt-table grouped by farmer:            │
        │   👨‍🌾 Farmer Group Header                            │
        │   └─ Item 1 | Qty | Unit Price | Subtotal          │
        │   └─ Item 2 | Qty | Unit Price | Subtotal          │
        │   👨‍🌾 Farmer Group Header 2                          │
        │   └─ Item 3 | Qty | Unit Price | Subtotal          │
        │   -------------------------------------------         │
        │   Grand Total | KES                                 │
        │ - Show delivery address                             │
        │ - Show phone number                                 │
        │ - Show shipping status badge (Pending)              │
        │ - Show print button (enabled)                       │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │ WAIT 3 SECONDS (setTimeout)                         │
        │ - Allow user to read confirmation                   │
        │ - Allow user to print receipt                       │
        └──────────────────────────────────────────────────────┘
                                  ↓
        ┌──────────────────────────────────────────────────────┐
        │ RESET UI                                            │
        │ - Hide order-confirmation div                       │
        │ - Show cart items list (empty)                      │
        │ - Show cart total (0.00)                            │
        │ - Reset checkout form fields to blank               │
        │ - cartItems = [] (clear array)                      │
        │ - updateCartDisplay() (shows empty cart msg)        │
        │ - Receipt block stays visible (user can print)      │
        └──────────────────────────────────────────────────────┘
```

---

## Code Locations

**Checkout Button Click Handler:** script.js lines 332-358
```javascript
checkoutButton.addEventListener('click', function () {
  if (cartItems.length === 0) return;
  if (checkoutFormWrapper) {
    checkoutFormWrapper.hidden = false;
  }
  // ... populate order summary table
});
```

**Form Validation:** script.js lines 378-403
```javascript
function validateCheckoutField(input) {
  var id = input.id;
  if (id === 'checkout-name') {
    // Check non-empty
  } else if (id === 'checkout-phone') {
    // Check pattern: /^0[17]\d{8}$/
  } else if (id === 'checkout-address') {
    // Check non-empty
  }
  // Show/clear error messages
}
```

**Form Submit Handler:** script.js lines 413-554
```javascript
checkoutForm.addEventListener('submit', function (event) {
  event.preventDefault();
  
  // 1. Validate all fields
  // 2. Look up/create customer in ff_users
  // 3. Create order object
  // 4. Persist to ff_orders
  // 5. Show confirmation & receipt
  // 6. Reset UI after 3 seconds
});
```

---

## State Management

### In-Memory (cartItems Array)
```javascript
var cartItems = [
  {
    productId: 'p1',
    farmerId: 'f1',
    farmerName: "John's Farm",
    name: 'Tomatoes',
    price: 100,
    quantity: 2
  },
  {
    productId: 'p2',
    farmerId: 'f2',
    farmerName: "Amina's Farm",
    name: 'Spinach',
    price: 30,
    quantity: 3
  }
];
```

**Note:** cartItems is NOT persisted to localStorage. Cart is cleared on page reload.

### Persisted (ff_orders in localStorage)
```javascript
{
  id: 'ord-1712345678000',
  customerId: 'cust-001',
  customer: 'Grace Njeri',
  phone: '0712345678',
  address: '14 Moi Avenue, Nairobi',
  items: [
    {
      productId: 'p1',
      farmerId: 'f1',
      name: 'Tomatoes',
      farmerName: "John's Farm",
      quantity: 2,
      price: 100,
      subtotal: 200,
      itemStatus: 'Pending'
    }
  ],
  total: 200,
  status: 'Pending',
  date: '2026-03-15'
}
```

---

## Validation Rules

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| **Full Name** | text | Required, non-empty | "Please enter your full name" |
| **Phone** | tel | Required, format `0[17]XXXXXXXX` | "Please enter a valid Kenyan phone number (e.g. 0712 345 678)" |
| **Address** | text | Required, non-empty | "Please enter your delivery address" |

**Phone Validation Regex:**
```javascript
/^0[17]\d{8}$/
```
- Must start with `0`
- Second digit must be `1` or `7`
- Followed by exactly 8 more digits
- Examples: `0712345678`, `0701234567`

---

## Receipt Generation Details

**Receipt Table Structure:**
```
Order ID: ord-1712345678000  |  Date: March 15, 2026
Customer: Grace Njeri

┌────────────┬─────┬──────────────┬──────────┐
│ Item       │ Qty │ Unit Price   │ Subtotal │
├────────────┼─────┼──────────────┼──────────┤
│ 👨‍🌾 John's Farm                          │
├────────────┼─────┼──────────────┼──────────┤
│ Tomatoes   │ 2   │ KES 100.00   │ KES 200  │
├────────────┼─────┼──────────────┼──────────┤
│ 👨‍🌾 Amina's Farm                        │
├────────────┼─────┼──────────────┼──────────┤
│ Spinach    │ 3   │ KES 30.00    │ KES 90   │
├────────────┼─────┼──────────────┼──────────┤
│ Grand Total                  │ KES 290  │
└────────────┴─────┴──────────────┴──────────┘

📍 Delivery Address: 14 Moi Avenue, Nairobi
📞 Phone: 0712345678
Shipping Status: [Pending]

Thank you for shopping with Farm Fresh! 🌿
Expected delivery: within 24 hours.
```

**Items are grouped by farmerName** to organize multi-farmer orders.

---

## Admin Order Status Updates

Admins can update order status in admin.html → Shipping tab:

Status Flow: `Pending → Confirmed → Dispatched → Delivered`

- **Pending**: Order received, waiting for processing
- **Confirmed**: Order confirmed and being prepared
- **Dispatched**: Order on its way to customer
- **Delivered**: Order received by customer

Items within an order can have individual `itemStatus` values (useful if shipped separately).

