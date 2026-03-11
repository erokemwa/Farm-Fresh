# Farm Fresh - Quick Reference Guide

## Key Files & Line Numbers

### Main Checkout Flow (script.js)
- **Line 23-30**: localStorage helpers (getStore, setStore)
- **Line 33-122**: Seed data function (default products, farmers, orders)
- **Line 128-175**: renderProducts() - renders product cards
- **Line 178-195**: renderFarmers() - renders farmer cards
- **Line 216-281**: Cart state & updateCartDisplay()
- **Line 284-307**: attachAddToCartListeners() - "Add to Cart" handler
- **Line 309-329**: attachQtySteppers() - +/- quantity buttons
- **Line 332-358**: Checkout button click - shows form & summary
- **Line 360-376**: Field validation helpers
- **Line 378-403**: validateCheckoutField() - validates 3 checkout fields
- **Line 413-554**: Checkout form submit handler - order creation, receipt
- **Line 557-650**: Review form handler

### Admin Dashboard (admin.js)
- **Line 28-116**: seedData() function
- **Line 119-126**: Auth (isLoggedIn, handleLogout)
- **Line 129-148**: switchTab() - tab navigation
- **Line 150-210**: Overview & Orders rendering
- **Line 247-283**: renderProducts() - admin product table
- **Line 287-371**: Product CRUD (openProductModal, saveProduct, deleteProduct)
- **Line 374-481**: renderFarmers() & Farmer CRUD
- **Line 484-650+**: Orders, Reviews, Shipping tabs

### Farmer Dashboard (farmer-dashboard.js)
- **Line 56-60**: getFarmerSession() - get farmer ID from localStorage
- **Line 59-67**: getFarmer() - get farmer object
- **Line 66-80**: getMyProducts(farmerId) - filter products by farmer
- **Line 161-227**: renderMyProducts() - farmer's products table
- **Line 189-233**: Edit product inline form
- **Line 236-244**: toggleMyProduct() - toggle availability
- **Line 417-475**: Add product form handler
- **Line 251-414**: Orders, Shipping, Earnings tabs

---

## localStorage Keys & Array Sizes

| Key | Type | Default Size | Purpose |
|-----|------|--------------|---------|
| `ff_products` | Array | 3 items (p1, p2, p3) | All products with pricing |
| `ff_farmers` | Array | 2 items (f1, f2) | Farmer profiles |
| `ff_orders` | Array | 5 items (ord-001 to ord-005) | Order history |
| `ff_users` | Array | 5 items (cust-001 to cust-005) | Customer profiles |
| `ff_reviews` | Array | 2 items (rev-001, rev-002) | Product reviews |
| `adminLoggedIn` | String | undefined or 'true' | Auth flag |
| `ff_farmer_session` | String | undefined or farmer_id | Farmer session |

---

## Default Products (Seed Data)

```javascript
[
  {
    id: 'p1', name: 'Tomatoes', farmerId: 'f1', farmer: "John's Farm",
    price: 100, originalPrice: 120, category: 'vegetables', 
    unit: 'per kg', available: true
  },
  {
    id: 'p2', name: 'Spinach', farmerId: 'f2', farmer: "Amina's Farm",
    price: 30, originalPrice: null, category: 'greens',
    unit: 'per bunch', available: true
  },
  {
    id: 'p3', name: 'Zucchini', farmerId: 'f2', farmer: "Amina's Farm",
    price: 110, originalPrice: 140, category: 'vegetables',
    unit: 'per kg', available: true
  }
]
```

---

## Default Farmers (Seed Data)

```javascript
[
  {
    id: 'f1', name: 'John Kamau', location: 'Nakuru, Kenya',
    bio: 'John has been farming organically for over 15 years...',
    phone: '0711111111', email: 'john@farmfresh.co.ke'
  },
  {
    id: 'f2', name: 'Amina Wanjiru', location: 'Kiambu, Kenya',
    bio: 'Amina runs a family farm famous for its award-winning...',
    phone: '0722222222', email: 'amina@farmfresh.co.ke'
  }
]
```

---

## Authentication

### Admin Login (admin-login.html)
- **Credentials**: 
  - Username: `admin`
  - Password: `farmfresh2026`
- **On success**: Sets `localStorage.adminLoggedIn = 'true'` → redirects to admin.html
- **On fail**: Shows error message "Incorrect username or password."

### Farmer Login (farmer-dashboard.html)
- **Method**: Dropdown select from ff_farmers list
- **On selection**: Sets `localStorage.ff_farmer_session = farmer_id` → shows dashboard
- **On logout**: Removes session key → shows login overlay again

---

## Validation Rules

### Checkout Form (script.js lines 378-403)
```javascript
// Full Name
- Required: yes
- Pattern: any non-empty string
- Error: "Please enter your full name"

// Phone Number
- Required: yes
- Pattern: /^0[17]\d{8}$/ (Kenyan format)
  * Examples: 0712345678, 0701234567
- Error: "Please enter a valid Kenyan phone number (e.g. 0712 345 678)"

// Address
- Required: yes
- Pattern: any non-empty string
- Error: "Please enter your delivery address"
```

### Review Form (script.js lines 557-650)
```javascript
// Reviewer Name
- Required: yes
- Error: "Please enter your name"

// Product (optional)
- Not required, can be empty

// Rating
- Required: yes, one of 1-5
- Error: "Please select a star rating"

// Comment
- Required: yes
- Error: "Please enter a comment"
```

---

## Order Status Values

```
CUSTOMER SIDE:
Pending → Confirmed → Dispatched → Delivered

ITEM LEVEL (in cart):
- itemStatus can be different from order.status
- e.g., Order.status = 'Dispatched' but some items still 'Pending'

TRACKING:
- Customers can track by Order ID
- Displays current status badge + delivery info
```

---

## Cart Behavior

**In-Memory State:**
- cartItems = [] (JavaScript array in memory)
- NOT persisted to localStorage
- Cleared on page reload
- Cleared after successful order (after 3 second timeout)

**Cart Display Updates:**
- Updates in real-time when items added/removed
- Badge shows total quantity
- Total shows sum of (price × quantity)
- Checkout button hidden if cart empty

---

## Receipt Details

**When**: After successful order submission (lines 479-543 in script.js)

**What's shown**:
1. Order ID & Date
2. Customer Name
3. Items table grouped by farmer
4. Delivery address & phone
5. Shipping status badge
6. Print button

**Grouping**: Items are grouped under farmer headers (e.g., "👨‍🌾 John's Farm")

**Print Button**: Enabled after receipt is generated (hidden by default)

---

## Product Card Attributes

```html
<li class="product-card"
    data-name="{product.name}"
    data-farmer="{product.farmer}"
    data-category="{product.category}"
    data-availability="{product.available ? 'available' : 'out-of-stock'}">
```

**Used for:**
- Category filtering (All, Vegetables, Greens, Fruits)
- Search functionality
- Styling (available vs out-of-stock)
- Data attributes for "Add to Cart" button

---

## Farmer Card Display

**Location**: `index.html` line 218 in `#farmers .farmers-grid`

**Fields shown**:
- Farmer name (h3)
- Location (📍 emoji + text)
- Bio (paragraph text)
- "View Products" link (scrolls to products section)

**Future enhancement**: Could display farmer rating/stats here

---

## Important Implementation Details

1. **Phone is Customer Key**: Customer lookup is by phone number, not ID
2. **Timestamp-Based IDs**: Orders & customers use `Date.now()` for ID generation
3. **Multi-Farmer Orders**: Single order can have items from different farmers
4. **No Backend**: All data stored in browser's localStorage
5. **Image Mapping**: Only 3 images (product-1/2/3.png) mapped to first 3 products
6. **Responsive**: Mobile-first design with breakpoints at 768px, 1024px
7. **Accessibility**: ARIA labels, role attributes, semantic HTML
8. **No Persisted Cart**: User loses cart on refresh (intentional for guest checkout)

---

## Testing Data

### Existing Orders (in seed data)
```
ord-001: Grace Njeri - Tomatoes ×2 - KES 200 - Delivered
ord-002: Brian Omondi - Spinach ×3 - KES 90 - Confirmed
ord-003: Faith Wambua - Zucchini ×1 - KES 110 - Pending
ord-004: Mary Akinyi - Tomatoes ×3 - KES 300 - Dispatched
ord-005: Peter Mwangi - Tomatoes ×2 + Spinach ×3 - KES 290 - Pending
```

### Test Phone Numbers (existing customers)
- 0712345678 (Grace Njeri)
- 0723456789 (Brian Omondi)
- 0756789012 (Peter Mwangi)
- 0734567890 (Faith Wambua)
- 0745678901 (Mary Akinyi)

### New Customer Test
- Phone: 0700000000 (will create new customer)
- Creates ID: cust-{timestamp}

---

## CSS Variables (Theming)

```css
--green: #198C19              /* Primary brand color */
--green-dark: #146b14         /* Darker green for headers */
--green-light: #f0faf0        /* Light green background */
--orange: #f5a623             /* Accent color (badges) */
--text: #222                  /* Primary text color */
--muted: #777                 /* Muted text color */
--border: #e0e0e0             /* Border color */
--radius: 10px                /* Border radius */
--shadow: 0 2px 10px...       /* Default shadow */
```

