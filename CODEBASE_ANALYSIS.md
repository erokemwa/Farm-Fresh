# Farm Fresh Repository Analysis

## 1. FULL DIRECTORY STRUCTURE

```
/home/runner/work/Farm-Fresh/Farm-Fresh/
├── .git/                          (Git repository)
├── README.md
├── index.html                     (Main customer page)
├── script.js                      (811 lines - main checkout & product logic)
├── styles.css                     (1612 lines - main styles)
├── admin.html                     (Admin dashboard)
├── admin.js                       (765 lines - admin dashboard logic)
├── admin.css                      (820 lines - admin styles)
├── admin-login.html               (Admin login page)
├── admin-login.css                (128 lines - login styles)
├── farmer-dashboard.html          (Farmer dashboard)
├── farmer-dashboard.js            (553 lines - farmer logic)
├── farmer-dashboard.css           (170 lines - farmer styles)
├── product-1.png                  (Tomatoes image)
├── product-2.png                  (Spinach image)
├── product-3.png                  (Zucchini image)
└── admin/
    └── admin.css                  (Additional admin styles)
```

## 2. DATA MODEL (localStorage Keys & Shapes)

### Key: `ff_products`
**Product array with pricing and availability**
```javascript
[
  {
    id: 'p1',                    // Unique product ID
    name: 'Tomatoes',            // Product name
    farmerId: 'f1',              // Link to farmer
    farmer: "John's Farm",       // Farmer display name
    price: 100,                  // Current price (KES)
    originalPrice: 120,          // Original price for discounts (optional)
    category: 'vegetables',      // 'vegetables' | 'greens' | 'fruits'
    unit: 'per kg',              // Unit of measurement
    available: true              // Availability boolean
  },
  // ... more products
]
```

### Key: `ff_farmers`
**Farmer profile array**
```javascript
[
  {
    id: 'f1',                              // Unique farmer ID
    name: 'John Kamau',                    // Farmer name
    location: 'Nakuru, Kenya',             // Farm location
    bio: 'John has been farming...',       // Bio text
    phone: '0711111111',                   // Phone number
    email: 'john@farmfresh.co.ke'          // Email
  },
  // ... more farmers
]
```

### Key: `ff_orders`
**Order history array with multi-farmer support**
```javascript
[
  {
    id: 'ord-001',                         // Unique order ID
    customerId: 'cust-001',                // Link to customer
    customer: 'Grace Njeri',               // Customer name
    phone: '0712345678',                   // Phone number
    address: '14 Moi Avenue, Nairobi',     // Delivery address
    items: [                               // Array of ordered items
      {
        productId: 'p1',                   // Link to product
        farmerId: 'f1',                    // Link to farmer
        name: 'Tomatoes',                  // Product name
        farmerName: "John's Farm",         // Farmer display name
        quantity: 2,                       // Quantity ordered
        price: 100,                        // Unit price (KES)
        subtotal: 200,                     // quantity * price
        itemStatus: 'Delivered'            // 'Pending' | 'Confirmed' | 'Dispatched' | 'Delivered'
      }
      // Multiple items from different farmers possible
    ],
    total: 200,                            // Total order amount (KES)
    status: 'Delivered',                   // Overall order status
    date: '2026-03-01'                     // Date (YYYY-MM-DD format)
  },
  // ... more orders
]
```

### Key: `ff_users`
**Customer profile array**
```javascript
[
  {
    id: 'cust-001',                        // Unique customer ID
    name: 'Grace Njeri',                   // Customer name
    phone: '0712345678',                   // Phone (unique key for lookups)
    address: '14 Moi Avenue, Nairobi',     // Delivery address
    ordersCount: 1                         // Count of orders placed
  },
  // ... more customers
]
```

### Key: `ff_reviews`
**Review array**
```javascript
[
  {
    id: 'rev-001',                         // Unique review ID
    customerId: 'cust-001',                // Link to customer
    name: 'Grace Njeri',                   // Reviewer name
    productId: 'p1',                       // Link to product (optional)
    farmerId: 'f1',                        // Link to farmer (optional)
    rating: 5,                             // Rating 1-5
    comment: 'The tomatoes were...',       // Review text
    status: 'Approved',                    // 'Pending' | 'Approved'
    date: '2026-03-01'                     // Date (YYYY-MM-DD format)
  },
  // ... more reviews
]
```

### Key: `adminLoggedIn`
**Admin authentication flag**
```javascript
'true' or undefined  // Set to 'true' after successful login at admin-login.html
```

### Key: `ff_farmer_session`
**Farmer dashboard session (farmer ID)**
```javascript
'f1'  // Contains the selected farmer's ID during farmer portal session
```

---

## 3. CHECKOUT FLOW (in script.js)

### Flow Overview:
```
1. User adds products to cart
   ↓
2. Cart updates in real-time (updateCartDisplay)
   ↓
3. User clicks "Checkout" button
   ↓
4. Checkout form shown (lines 332-358)
   ↓
5. User fills in: Name, Phone, Address
   ↓
6. Form validates fields (lines 378-403)
   ↓
7. User clicks "Confirm Order"
   ↓
8. Order persisted to ff_orders (lines 445-469)
   ↓
9. Receipt generated & displayed (lines 479-543)
   ↓
10. Cart cleared after 3 seconds (lines 545-553)
```

### Key Checkout Functions:

**updateCartDisplay() - Lines 230-281**
- Renders cart items in DOM
- Calculates total
- Updates cart badges (header + FAB)
- Shows/hides checkout button

**attachAddToCartListeners() - Lines 284-307**
- Captures "Add to Cart" button clicks
- Reads quantity from input
- Merges with existing cart items or adds new
- Shows toast notification

**validateCheckoutField(input) - Lines 378-403**
- Validates Full Name (required, non-empty)
- Validates Phone (required, matches Kenyan pattern `/^0[17]\d{8}$/`)
- Validates Address (required, non-empty)
- Shows field-specific error messages

**Checkout Form Submit - Lines 413-554**
1. Validates all 3 fields
2. Looks up customer by phone in `ff_users`
3. Creates new customer if not found with ID: `cust-{timestamp}`
4. Creates order object with:
   - ID: `ord-{timestamp}`
   - Maps cart items to include: productId, farmerId, farmerName, subtotal, itemStatus: 'Pending'
   - Sets order status: 'Pending'
5. Persists order to `ff_orders` via `setStore()`
6. Groups items by farmer in receipt
7. Shows receipt block with print button (hidden by default)
8. Clears cart after 3 seconds
9. Resets form

---

## 4. PRODUCT CARD RENDERING (in script.js)

### renderProducts() - Lines 128-175

**For each product in ff_products:**
```html
<li class="product-card"
    data-name="{name}"
    data-farmer="{farmer}"
    data-category="{category}"
    data-availability="{available ? 'available' : 'out-of-stock'}">
    
  <img src="{product-image}" alt="{name}">
  <h3>{name}</h3>
  <small>By {farmer}</small>
  
  <!-- Optional: Show discount if originalPrice differs -->
  {if originalPrice && originalPrice !== price}
    <del class="price-was">KES {originalPrice}</del>
  {/if}
  
  <p>KES {price}</p>
  <small class="product-unit">{unit}</small>
  
  <span class="badge {available ? 'available' : 'out-of-stock'}">
    {available ? 'In Stock' : 'Out of Stock'}
  </span>
  
  <!-- Quantity Selector -->
  <div class="qty-wrapper">
    <button class="qty-minus">−</button>
    <input type="number" class="qty-input" min="1" value="1">
    <button class="qty-plus">+</button>
  </div>
  
  <!-- Add to Cart Button -->
  <button class="add-to-cart"
          data-name="{name}"
          data-price="{price}"
          data-farmer="{farmer}"
          data-product-id="{id}"
          data-farmer-id="{farmerId}"
          data-farmer-name="{farmer}"
          data-availability="{available ? 'available' : 'out-of-stock'}"
          {!available ? disabled : ''}>
    🛒 Add to Cart
  </button>
</li>
```

**Image Mapping:**
- p1 → product-1.png
- p2 → product-2.png
- p3 → product-3.png

**Availability Badge:**
- Green: "In Stock" (available: true or missing)
- Red: "Out of Stock" (available: false)
- Button disabled if out of stock

---

## 5. FARMER CARD RENDERING (in script.js)

### renderFarmers() - Lines 178-195

**For each farmer in ff_farmers:**
```html
<div class="farmer-card">
  <h3>{name}</h3>
  <p class="farmer-location">📍 {location}</p>
  <p class="farmer-bio">{bio}</p>
  <a href="#products" class="farmer-link">View Products</a>
</div>
```

**Rendering location:** `#farmers .farmers-grid` section (line 218 in index.html)

**Key Features:**
- Simple card layout with emoji icon
- Links to products section when clicked
- Bio text displayed (no truncation)
- No ratings displayed yet (potential enhancement area)

---

## 6. FILE CONTENTS SUMMARY

### index.html (264 lines)
- Header with search and cart
- Hero section with CTA buttons
- Product list section (populated by script.js)
- Reviews section with form
- Cart sidebar with checkout flow (3-step process)
- Order tracking section
- Farmers section
- Contact info
- Footer with links

### script.js (811 lines)
- Utility helpers: formatKES, escapeHtml, showToast
- localStorage helpers: getStore, setStore
- Seed data function with default products/farmers/orders/reviews
- renderProducts() - Product cards with images, prices, qty selector
- renderFarmers() - Farmer profile cards
- renderReviews() - Customer review cards
- **Cart management:** cartItems array, updateCartDisplay(), attachAddToCartListeners()
- **Quantity steppers:** +/- buttons to adjust product quantities
- **Checkout flow:** Form validation, order creation, receipt generation (lines 332-554)
- **Review submission:** Form handling with async UI feedback
- **Product search:** Filter products by category and search term
- **Order tracking:** Track order by ID with status lookup

### styles.css (1612 lines)
- CSS variables (colors, shadows, border-radius)
- Responsive header with sticky positioning
- Hero section with gradient background
- Product grid with card styling
- Cart sidebar with fixed positioning
- Checkout form styling (3-step progress indicator)
- Receipt styling with table layout
- Farmer cards grid
- Reviews section styling
- Responsive breakpoints for mobile/tablet/desktop
- Animations for toast notifications
- Button and form element styling

### admin.html (367 lines)
- Sidebar navigation (7 tabs)
- Topbar with logout button
- Overview tab: stats + recent orders
- Orders tab: all orders table
- Products tab: products table with add/edit buttons
- Farmers tab: farmers table with add/edit buttons
- Reviews tab: reviews table
- Shipping tab: shipping status management with filters
- Customers tab: customer list
- Product modal form
- Farmer modal form

### admin.js (765 lines)
- seedData() function (mirrors script.js)
- Auth check: isLoggedIn(), handleLogout()
- Tab switching: switchTab()
- **renderProducts()** - Admin product table with edit/delete buttons
- **renderFarmers()** - Admin farmer table with edit/delete buttons
- **renderOrders()** - All orders with status display
- **renderReviews()** - Reviews table with approval status
- **renderShipping()** - Order shipping status management
- **renderCustomers()** - Customer purchase history
- **renderOverview()** - Dashboard stats and recent orders
- Modal management: openProductModal(), openFarmerModal(), etc.
- Form handlers: saveProduct(), saveFarmer(), deleteProduct(), deleteFarmer()
- Shipping filters by status and farmer

### farmer-dashboard.html (267 lines)
- Farmer login overlay with dropdown to select farmer
- Sidebar with farmer-specific sections
- Overview tab: my products, active orders, delivery count, earnings
- My Products tab: farmer's products with edit/toggle availability
- My Orders tab: orders containing this farmer's products
- Shipping tab: active shipping orders
- Earnings tab: revenue breakdown and monthly chart

### farmer-dashboard.js (553 lines)
- getFarmerSession() - Get logged-in farmer ID from localStorage
- getFarmer() - Get full farmer object
- getMyProducts(farmerId) - Filter products by farmer ID
- Farmer login UI: dropdown select and session storage
- **renderMyProducts(farmer)** - Farmer's products table
- Edit product inline form with inline validation
- toggleMyProduct() - Toggle product availability
- Add product inline form
- renderMyOrders(farmer) - Orders containing farmer's products
- renderShipping(farmer) - Active shipping orders
- Earnings calculations and monthly breakdown
- Farmer logout handling

### admin-login.html (57 lines)
- Login card centered on gradient background
- Form with username and password inputs
- Hardcoded credentials check (admin / farmfresh2026)
- Sets localStorage flag 'adminLoggedIn' = 'true'
- Redirects to admin.html after successful login

### admin-login.css (128 lines)
- Centered login card with shadow
- Gradient green background
- Form styling with focus states
- Error message styling in red
- Sign In button with hover effect

---

## 7. KEY FEATURES & WORKFLOWS

### Checkout Workflow Summary
1. **Cart Management**: In-memory array, survives page reload via updateCartDisplay
2. **Multi-farmer orders**: Items from different farmers grouped in receipt, but all tracked in single order
3. **Guest checkout**: No account required, creates customer on first order by phone
4. **Validation**: Client-side only, Kenyan phone format enforced (`/^0[17]\d{8}$/`)
5. **Order Status**: Starts as 'Pending', can be updated via admin dashboard
6. **Receipt**: Generated post-checkout, includes order ID, customer, items grouped by farmer, total, delivery address

### Product Management
- Products display with: image, name, farmer, price (with optional discount), availability badge
- Quantity selector (+/- buttons and input)
- Out-of-stock items disable the "Add to Cart" button
- Category filtering in UI (All, Vegetables, Greens, Fruits)

### Farmer Portal
- Farmers select themselves from dropdown to access dashboard
- Session stored in localStorage as farmer ID
- Can view only their products, orders, and earnings
- Can toggle product availability
- Can edit product prices/unit inline
- Earnings tracked by order status (Pending, Confirmed, Delivered)

### Admin Dashboard
- Full CRUD operations on products and farmers
- View all orders with status management
- Filter orders by farmer and status
- Shipping management with status updates
- Customer insights (purchase count, total spend)
- Review moderation (Pending/Approved status)

---

## 8. IMPORTANT NOTES

1. **Order Status Values**: Pending → Confirmed → Dispatched → Delivered
2. **Item Status vs Order Status**: Items have individual `itemStatus`, order has overall `status`
3. **Legacy Migration**: Code auto-upgrades old orders without productId/farmerId (lines 29-54 in admin.js)
4. **Phone Lookup**: Customer identified by phone number for returning customers
5. **No Backend**: All data stored in localStorage (JSON serialization)
6. **Images**: Only 3 products (p1, p2, p3) have mapped PNG images
7. **Farmer Name Display**: Uses `farmer` field in product (human-readable), `farmerId` for linking
8. **Order Timestamp**: Uses `Date.now()` for order/customer ID generation
9. **Currency**: All prices in KES (Kenyan Shillings)
10. **Responsive Design**: Mobile-first approach with breakpoints for tablet/desktop

___BEGIN___COMMAND_DONE_MARKER___0
