// ===== Utility Helpers =====
function formatKES(amount) {
  return `KES ${amount.toFixed(2)}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== localStorage Helpers =====
function getStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (e) { return []; }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== Seed Default Data (mirrors admin.js seedData) =====
function seedAdminData() {
  // Migrate legacy orders that lack productId/farmerId on items
  (function migrateLegacyOrders() {
    var orders = JSON.parse(localStorage.getItem('ff_orders') || '[]');
    var products = JSON.parse(localStorage.getItem('ff_products') || '[]');
    var changed = false;
    orders.forEach(function(order) {
      order.items.forEach(function(item) {
        if (!item.productId) {
          var match = products.find(function(p) { return p.name === item.name; });
          if (match) {
            item.productId  = match.id;
            item.farmerId   = match.farmerId || '';
            item.farmerName = match.farmer || '';
            item.subtotal   = item.price * item.quantity;
            item.itemStatus = item.itemStatus || order.status;
            changed = true;
          }
        }
      });
      if (!order.customerId) {
        order.customerId = 'cust-legacy';
        changed = true;
      }
    });
    if (changed) localStorage.setItem('ff_orders', JSON.stringify(orders));
  })();

  if (!localStorage.getItem('ff_products')) {
    setStore('ff_products', [
      { id: 'p1', name: 'Tomatoes', farmerId: 'f1', farmer: "John's Farm", price: 100, originalPrice: 120, category: 'vegetables', unit: 'per kg', available: true },
      { id: 'p2', name: 'Spinach', farmerId: 'f2', farmer: "Amina's Farm", price: 30, originalPrice: null, category: 'greens', unit: 'per bunch', available: true },
      { id: 'p3', name: 'Zucchini', farmerId: 'f2', farmer: "Amina's Farm", price: 110, originalPrice: 140, category: 'vegetables', unit: 'per kg', available: true }
    ]);
  }
  if (!localStorage.getItem('ff_farmers')) {
    setStore('ff_farmers', [
      {
        id: 'f1', name: 'John Kamau', location: 'Nakuru, Kenya',
        bio: 'John has been farming organically for over 15 years, specialising in tomatoes and leafy greens grown without pesticides.',
        phone: '0711111111', email: 'john@farmfresh.co.ke',
        ratings: { overall: 4.7, freshness: 4.8, delivery: 4.6, packaging: 4.5, communication: 4.9, value: 4.7, consistency: 4.6 },
        totalReviews: 23, badges: ['Top Seller', 'Eco Packaging']
      },
      {
        id: 'f2', name: 'Amina Wanjiru', location: 'Kiambu, Kenya',
        bio: 'Amina runs a family farm famous for its award-winning spinach and zucchini, using traditional irrigation methods.',
        phone: '0722222222', email: 'amina@farmfresh.co.ke',
        ratings: { overall: 4.5, freshness: 4.6, delivery: 4.4, packaging: 4.7, communication: 4.3, value: 4.5, consistency: 4.4 },
        totalReviews: 18, badges: ['Eco Packaging', 'Best Value']
      }
    ]);
  }
  if (!localStorage.getItem('ff_users')) {
    setStore('ff_users', [
      { id: 'cust-001', name: 'Grace Njeri',   phone: '0712345678', address: '14 Moi Avenue, Nairobi',   ordersCount: 1 },
      { id: 'cust-002', name: 'Brian Omondi',  phone: '0723456789', address: 'Westlands, Nairobi',        ordersCount: 1 },
      { id: 'cust-003', name: 'Peter Mwangi',  phone: '0756789012', address: 'Thika Road, Nairobi',       ordersCount: 1 },
      { id: 'cust-004', name: 'Faith Wambua',  phone: '0734567890', address: 'Karen, Nairobi',            ordersCount: 1 },
      { id: 'cust-005', name: 'Mary Akinyi',   phone: '0745678901', address: 'Kilimani, Nairobi',         ordersCount: 1 }
    ]);
  }
  if (!localStorage.getItem('ff_orders')) {
    setStore('ff_orders', [
      {
        id: 'ord-001', customerId: 'cust-001', customer: 'Grace Njeri', phone: '0712345678', address: '14 Moi Avenue, Nairobi',
        items: [{ productId: 'p1', farmerId: 'f1', name: 'Tomatoes', farmerName: "John's Farm", quantity: 2, price: 100, subtotal: 200, itemStatus: 'Delivered' }],
        total: 200, status: 'Delivered', date: '2026-03-01'
      },
      {
        id: 'ord-002', customerId: 'cust-002', customer: 'Brian Omondi', phone: '0723456789', address: 'Westlands, Nairobi',
        items: [{ productId: 'p2', farmerId: 'f2', name: 'Spinach', farmerName: "Amina's Farm", quantity: 3, price: 30, subtotal: 90, itemStatus: 'Confirmed' }],
        total: 90, status: 'Confirmed', date: '2026-03-08'
      },
      {
        id: 'ord-003', customerId: 'cust-004', customer: 'Faith Wambua', phone: '0734567890', address: 'Karen, Nairobi',
        items: [{ productId: 'p3', farmerId: 'f2', name: 'Zucchini', farmerName: "Amina's Farm", quantity: 1, price: 110, subtotal: 110, itemStatus: 'Pending' }],
        total: 110, status: 'Pending', date: '2026-03-10'
      },
      {
        id: 'ord-004', customerId: 'cust-005', customer: 'Mary Akinyi', phone: '0745678901', address: 'Kilimani, Nairobi',
        items: [{ productId: 'p1', farmerId: 'f1', name: 'Tomatoes', farmerName: "John's Farm", quantity: 3, price: 100, subtotal: 300, itemStatus: 'Dispatched' }],
        total: 300, status: 'Dispatched', date: '2026-03-09'
      },
      {
        id: 'ord-005', customerId: 'cust-003', customer: 'Peter Mwangi', phone: '0756789012', address: 'Thika Road, Nairobi',
        items: [
          { productId: 'p1', farmerId: 'f1', name: 'Tomatoes', farmerName: "John's Farm", quantity: 2, price: 100, subtotal: 200, itemStatus: 'Dispatched' },
          { productId: 'p2', farmerId: 'f2', name: 'Spinach',  farmerName: "Amina's Farm", quantity: 3, price: 30,  subtotal: 90,  itemStatus: 'Pending' }
        ],
        total: 290, status: 'Pending', date: '2026-03-11'
      }
    ]);
  }
  if (!localStorage.getItem('ff_reviews')) {
    setStore('ff_reviews', [
      { id: 'rev-001', customerId: 'cust-001', name: 'Grace Njeri', productId: 'p1', farmerId: 'f1', rating: 5, comment: 'The tomatoes were incredibly fresh and arrived quickly. Will definitely order again!', status: 'Approved', date: '2026-03-01' },
      { id: 'rev-002', customerId: 'cust-002', name: 'Brian Omondi', productId: 'p2', farmerId: 'f2', rating: 4, comment: 'Great spinach, very fresh. Delivery was a bit late but overall happy.', status: 'Pending', date: '2026-03-08' }
    ]);
  }
}

// ===== Product Image Map =====
var PRODUCT_IMAGES = { 'p1': 'product-1.png', 'p2': 'product-2.png', 'p3': 'product-3.png' };

// ===== Constants =====
var KENYAN_PHONE_RE = /^0[17]\d{8}$/;

// Payment configuration — update these values before going live
// Exchange rates are stubs (last updated 2026-03): replace with a live-rate API in production
var PAYMENT_CONFIG = {
  // Simulated delay (ms) for M-Pesa STK push before advancing to confirmation
  mpesaStkDelay: 4000,
  // Simulated delay (ms) for card processing before advancing to confirmation
  cardProcessDelay: 2000,
  // KES → USD stub rate (1 USD = 130 KES); replace with a live FX feed in production
  kesPerUsd: 130,
  // BTC stub price in USD; replace with a live price feed in production
  btcUsdPrice: 60000,
  // DEMO ONLY — mock wallet addresses; replace with real custodial addresses in production
  // WARNING: Do NOT use these in a live payment flow without replacing with verified addresses
  usdtWalletAddress: 'TRC20Walletxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  btcWalletAddress:  'bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
};

// ===== Render Products from localStorage =====
function renderProducts() {
  var products = getStore('ff_products');
  var farmers = getStore('ff_farmers');
  var ul = document.querySelector('#products ul');
  if (!ul) return;
  ul.innerHTML = '';

  products.forEach(function (p) {
    var isAvailable = p.available !== false;
    var imgSrc = PRODUCT_IMAGES[p.id] || 'product-1.png';
    var nameLower = p.name.toLowerCase().replace(/\s+/g, '-');

    var li = document.createElement('li');
    li.dataset.name = p.name;
    li.dataset.farmer = p.farmer;
    li.dataset.category = p.category;
    li.dataset.availability = isAvailable ? 'available' : 'out-of-stock';

    li.innerHTML =
      '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' +
      '<h3>' + escapeHtml(p.name) + '</h3>' +
      (function() {
        var pFarmer = farmers.find(function(f) { return f.id === p.farmerId || f.name === p.farmer; });
        var overall = pFarmer && pFarmer.ratings ? pFarmer.ratings.overall : null;
        return '<small class="product-farmer-info">By ' + escapeHtml(p.farmer) +
          (overall ? ' <span class="product-farmer-rating" aria-label="' + overall.toFixed(1) + ' out of 5 stars">⭐ ' + overall.toFixed(1) + '</span>' : '') +
        '</small>';
      })() +      (p.originalPrice && p.originalPrice !== p.price
        ? '<del class="price-was">KES ' + escapeHtml(String(p.originalPrice)) + '</del>'
        : '') +
      '<p>KES ' + escapeHtml(String(p.price)) + '</p>' +
      '<small class="product-unit">' + escapeHtml(p.unit) + '</small>' +
      '<span class="badge ' + (isAvailable ? 'available' : 'out-of-stock') + '">' +
        (isAvailable ? 'In Stock' : 'Out of Stock') +
      '</span>' +
      '<div class="qty-wrapper">' +
        '<button type="button" class="qty-minus" aria-label="Decrease quantity for ' + escapeHtml(p.name) + '">−</button>' +
        '<input type="number" id="qty-' + escapeHtml(nameLower) + '" class="qty-input" min="1" value="1" aria-label="Quantity for ' + escapeHtml(p.name) + '">' +
        '<button type="button" class="qty-plus" aria-label="Increase quantity for ' + escapeHtml(p.name) + '">+</button>' +
      '</div>' +
      '<button type="button" class="add-to-cart"' +
        ' data-name="' + escapeHtml(p.name) + '"' +
        ' data-price="' + escapeHtml(String(p.price)) + '"' +
        ' data-farmer="' + escapeHtml(p.farmer) + '"' +
        ' data-product-id="' + escapeHtml(p.id) + '"' +
        ' data-farmer-id="' + escapeHtml(p.farmerId || '') + '"' +
        ' data-farmer-name="' + escapeHtml(p.farmer) + '"' +
        ' data-availability="' + (isAvailable ? 'available' : 'out-of-stock') + '"' +
        (!isAvailable ? ' disabled aria-disabled="true"' : '') +
      '>🛒 Add to Cart</button>';

    ul.appendChild(li);
  });
}

// ===== Farmer Rating Helpers =====

// Generate star rating HTML (filled/half/empty)
function starsHtml(score, labelText) {
  var filled = Math.floor(score);
  var half = score - filled >= 0.25 && score - filled < 0.75;
  var empty = 5 - filled - (half ? 1 : 0);
  var html = '';
  for (var i = 0; i < filled; i++) html += '<span class="star star-full" aria-hidden="true">★</span>';
  if (half) html += '<span class="star star-half" aria-hidden="true">★</span>';
  for (var i = 0; i < empty; i++) html += '<span class="star star-empty" aria-hidden="true">☆</span>';
  return '<span class="stars-display" aria-label="' + escapeHtml(labelText || (score + ' out of 5 stars')) + '">' + html + '</span>';
}

// Metric bars HTML for farmer card
function metricBarsHtml(ratings) {
  var metrics = [
    { key: 'freshness', label: 'Freshness' },
    { key: 'delivery', label: 'Delivery' },
    { key: 'packaging', label: 'Packaging' },
    { key: 'communication', label: 'Communication' },
    { key: 'value', label: 'Value' },
    { key: 'consistency', label: 'Consistency' }
  ];
  return '<div class="metric-bars">' + metrics.map(function(m) {
    var score = (ratings && ratings[m.key]) ? ratings[m.key] : 0;
    var pct = (score / 5) * 100;
    return '<div class="metric-bar-row">' +
      '<span class="metric-label">' + escapeHtml(m.label) + '</span>' +
      '<div class="metric-bar-track"><div class="metric-bar-fill" style="width:0%" data-width="' + pct.toFixed(1) + '%"></div></div>' +
      '<span class="metric-score">' + score.toFixed(1) + '</span>' +
    '</div>';
  }).join('') + '</div>';
}

// Badge icons map
var BADGE_ICONS = { 'Top Seller': '🏆', 'Eco Packaging': '🌿', 'Best Value': '💰', 'Fast Delivery': '⚡', 'Organic Certified': '✅' };

function badgesHtml(badges) {
  if (!badges || !badges.length) return '';
  return '<div class="farmer-badges">' + badges.map(function(b) {
    var icon = BADGE_ICONS[b] || '🎖️';
    return '<span class="farmer-badge-pill">' + icon + ' ' + escapeHtml(b) + '</span>';
  }).join('') + '</div>';
}

// ===== Render Farmers from localStorage =====
function renderFarmers() {
  var farmers = getStore('ff_farmers');
  var grid = document.querySelector('#farmers .farmers-grid');
  if (!grid) return;
  grid.innerHTML = '';

  farmers.forEach(function (f) {
    var ratings = f.ratings || { overall: 0, freshness: 0, delivery: 0, packaging: 0, communication: 0, value: 0, consistency: 0 };
    var totalReviews = f.totalReviews || 0;
    var overall = ratings.overall || 0;

    var card = document.createElement('div');
    card.className = 'farmer-card';
    card.innerHTML =
      '<h3>' + escapeHtml(f.name) + '</h3>' +
      '<p class="farmer-location">📍 ' + escapeHtml(f.location) + '</p>' +
      '<p class="farmer-bio">' + escapeHtml(f.bio) + '</p>' +
      '<div class="farmer-rating-summary">' +
        starsHtml(overall, overall.toFixed(1) + ' out of 5 stars') +
        '<span class="farmer-rating-score">' + overall.toFixed(1) + '</span>' +
        '<span class="farmer-review-count">(' + totalReviews + ' reviews)</span>' +
      '</div>' +
      metricBarsHtml(ratings) +
      badgesHtml(f.badges) +
      '<div class="farmer-card-actions">' +
        '<a href="#products" class="farmer-link">View Products</a>' +
        '<button type="button" class="btn-rate-farmer" data-farmer-id="' + escapeHtml(f.id) + '">Rate This Farmer</button>' +
      '</div>';
    grid.appendChild(card);
  });

  // Animate metric bars after render
  setTimeout(function() {
    document.querySelectorAll('.metric-bar-fill').forEach(function(bar) {
      bar.style.width = bar.dataset.width;
    });
  }, 100);

  // Attach rate-farmer button listeners
  document.querySelectorAll('.btn-rate-farmer').forEach(function(btn) {
    btn.addEventListener('click', function() {
      openRatingModal(btn.dataset.farmerId);
    });
  });
}

// ===== Render Reviews from localStorage =====
function renderReviews() {
  var reviews = getStore('ff_reviews');
  var list = document.querySelector('.reviews-list');
  if (!list) return;
  list.innerHTML = '';

  reviews.forEach(function (r) {
    var n = Math.min(5, Math.max(0, parseInt(r.rating, 10) || 0));
    var stars = '★'.repeat(n) + '☆'.repeat(5 - n);
    var card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML =
      '<strong>' + escapeHtml(r.name) + '</strong>' +
      '<div class="rating" aria-label="' + escapeHtml(String(r.rating)) + ' out of 5 stars">' + stars + '</div>' +
      '<p>"' + escapeHtml(r.comment) + '"</p>';
    list.appendChild(card);
  });
}

// ===== Cart State & DOM References =====
var cart = document.querySelector('.cart');
var cartList = cart.querySelector('ul');
var cartTotal = cart.querySelector('.total');
var checkoutButton = cart.querySelector('.checkout');
var cartCountBadge = document.getElementById('cart-count');
var orderConfirmation = document.getElementById('order-confirmation');
var checkoutFormWrapper = document.getElementById('checkout-form-wrapper');
var checkoutForm = document.getElementById('checkout-form');
var cartItems = [];

checkoutButton.style.display = 'none';

// ===== Update Cart Display =====
function updateCartDisplay() {
  cartList.innerHTML = '';

  if (cartItems.length === 0) {
    var emptyMsg = document.createElement('li');
    emptyMsg.className = 'empty-cart-msg';
    emptyMsg.textContent = 'Your cart is empty.';
    cartList.appendChild(emptyMsg);
    checkoutButton.style.display = 'none';
    cartTotal.textContent = '0.00';
    if (cartCountBadge) cartCountBadge.textContent = '';
    var cartHeaderCount = document.getElementById('cart-header-count');
    if (cartHeaderCount) cartHeaderCount.textContent = '0';
    var fabCount = document.getElementById('fab-cart-count');
    if (fabCount) fabCount.textContent = '';
    return;
  }

  cartItems.forEach(function (item) {
    var listItem = document.createElement('li');

    var textSpan = document.createElement('span');
    textSpan.textContent = item.name + ' \xD7' + item.quantity + ' \u2013 ' + formatKES(item.price * item.quantity);

    var removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', 'Remove ' + item.name + ' from cart');
    var itemName = item.name;
    removeBtn.addEventListener('click', function () {
      cartItems = cartItems.filter(function (i) { return i.name !== itemName; });
      updateCartDisplay();
    });

    listItem.appendChild(textSpan);
    listItem.appendChild(removeBtn);
    cartList.appendChild(listItem);
  });

  var total = cartItems.reduce(function (acc, item) { return acc + item.price * item.quantity; }, 0);
  cartTotal.textContent = total.toFixed(2);

  var totalQty = cartItems.reduce(function (acc, item) { return acc + item.quantity; }, 0);
  if (cartCountBadge) cartCountBadge.textContent = totalQty;
  var cartHeaderCountEl = document.getElementById('cart-header-count');
  if (cartHeaderCountEl) cartHeaderCountEl.textContent = totalQty;
  var fabCountEl = document.getElementById('fab-cart-count');
  if (fabCountEl) fabCountEl.textContent = totalQty;

  checkoutButton.style.display = cartItems.length === 0 ? 'none' : 'block';
}

// ===== Attach Add-to-Cart Listeners (called after renderProducts) =====
function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart:not([disabled])').forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.dataset.name;
      var price = parseFloat(button.dataset.price);
      var productId = button.dataset.productId || '';
      var farmerId = button.dataset.farmerId || '';
      var farmerName = button.dataset.farmerName || '';
      var productLi = button.closest('li');
      var qtyInput = productLi ? productLi.querySelector('.qty-input') : null;
      var quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

      var existing = cartItems.find(function (item) { return item.name === name; });
      if (existing) {
        existing.quantity += quantity;
      } else {
        cartItems.push({ productId: productId, farmerId: farmerId, farmerName: farmerName, name: name, price: price, quantity: quantity });
      }

      updateCartDisplay();
      showToast('✅ ' + name + ' added to cart');
    });
  });
}

// ===== Attach Qty Steppers (called after renderProducts) =====
function attachQtySteppers() {
  document.querySelectorAll('.product-list ul li').forEach(function (li) {
    var minusBtn = li.querySelector('.qty-minus');
    var plusBtn = li.querySelector('.qty-plus');
    var input = li.querySelector('.qty-input');
    if (!minusBtn || !plusBtn || !input) return;
    minusBtn.addEventListener('click', function () {
      var current = parseInt(input.value, 10) || 1;
      if (current > 1) input.value = current - 1;
    });
    plusBtn.addEventListener('click', function () {
      var current = parseInt(input.value, 10) || 1;
      input.value = current + 1;
    });
    input.addEventListener('blur', function () {
      var val = parseInt(input.value, 10);
      if (!val || val < 1) input.value = 1;
    });
  });
}

// ===== Checkout Wizard State =====
var wizardPromoApplied = false;
var wizardGrandTotal = 0;

// ===== Step Navigation =====
function goToStep(n) {
  [1, 2, 3].forEach(function(i) {
    var step = document.getElementById('checkout-step-' + i);
    var ind = document.getElementById('step-indicator-' + i);
    if (step) step.hidden = (i !== n);
    if (ind) {
      ind.classList.toggle('active', i === n);
      if (i === n) ind.setAttribute('aria-current', 'step');
      else ind.removeAttribute('aria-current');
    }
  });
  var wrapper = document.getElementById('checkout-form-wrapper');
  if (wrapper) wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Step 1: Cart Table =====
function renderCheckoutCartTable() {
  var wrapper = document.getElementById('checkout-cart-table-wrapper');
  if (!wrapper) return;
  if (cartItems.length === 0) {
    wrapper.innerHTML = '<p style="color:#777;font-style:italic;">Your cart is empty.</p>';
    return;
  }
  var rows = cartItems.map(function(item) {
    var safe = escapeHtml(item.name);
    return '<tr>' +
      '<td>' + safe + '</td>' +
      '<td><div class="cart-qty-controls">' +
        '<button type="button" class="cart-qty-btn" data-action="minus" data-name="' + safe + '" aria-label="Decrease quantity">−</button>' +
        '<span class="cart-qty-num">' + item.quantity + '</span>' +
        '<button type="button" class="cart-qty-btn" data-action="plus" data-name="' + safe + '" aria-label="Increase quantity">+</button>' +
      '</div></td>' +
      '<td><button type="button" class="btn-remove-cart-item" data-name="' + safe + '" aria-label="Remove ' + safe + '">🗑</button></td>' +
      '<td>' + formatKES(item.price) + '</td>' +
      '<td>' + formatKES(item.price * item.quantity) + '</td>' +
    '</tr>';
  }).join('');
  wrapper.innerHTML =
    '<table class="checkout-cart-table">' +
      '<thead><tr><th>Item</th><th>Qty</th><th>Remove</th><th>Unit Price</th><th>Subtotal</th></tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table>';

  wrapper.querySelectorAll('.cart-qty-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var name = btn.dataset.name;
      var action = btn.dataset.action;
      var item = cartItems.find(function(i) { return i.name === name; });
      if (!item) return;
      if (action === 'minus') { if (item.quantity > 1) item.quantity--; else return; }
      else item.quantity++;
      updateCartDisplay();
      renderCheckoutCartTable();
      renderFeeSummary();
      updateStep1NextBtn();
    });
  });
  wrapper.querySelectorAll('.btn-remove-cart-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var name = btn.dataset.name;
      cartItems = cartItems.filter(function(i) { return i.name !== name; });
      updateCartDisplay();
      renderCheckoutCartTable();
      renderFeeSummary();
      updateStep1NextBtn();
    });
  });
}

function computeTotals() {
  var subtotal = cartItems.reduce(function(a, i) { return a + i.price * i.quantity; }, 0);
  var delivery = subtotal >= 500 ? 0 : 80;
  var discount = wizardPromoApplied ? Math.round(subtotal * 0.1) : 0;
  wizardGrandTotal = subtotal + delivery - discount;
  return { subtotal: subtotal, delivery: delivery, discount: discount, grand: wizardGrandTotal };
}

function renderFeeSummary() {
  var el = document.getElementById('checkout-fee-summary');
  if (!el) return;
  var t = computeTotals();
  var html = '<div class="fee-row"><span>Subtotal</span><span>' + formatKES(t.subtotal) + '</span></div>';
  html += '<div class="fee-row"><span>Delivery</span><span>' + (t.delivery === 0 ? '🆓 Free' : formatKES(t.delivery)) + '</span></div>';
  if (t.discount > 0) {
    html += '<div class="fee-row discount-row"><span>Promo (FRESH10 −10%)</span><span>−' + formatKES(t.discount) + '</span></div>';
  }
  html += '<div class="fee-row grand-total"><span>Grand Total</span><span>' + formatKES(t.grand) + '</span></div>';
  el.innerHTML = html;
}

function updateStep1NextBtn() {
  var btn = document.getElementById('btn-step1-next');
  if (!btn) return;
  var nameEl = document.getElementById('checkout-name');
  var phoneEl = document.getElementById('checkout-phone');
  var addrEl = document.getElementById('checkout-address');
  var nameVal = nameEl ? nameEl.value.trim() : '';
  var phoneVal = phoneEl ? phoneEl.value.replace(/\s/g, '') : '';
  var addrVal = addrEl ? addrEl.value.trim() : '';
  btn.disabled = !(cartItems.length > 0 && nameVal && KENYAN_PHONE_RE.test(phoneVal) && addrVal);
}

// ===== Checkout Button: open wizard =====
checkoutButton.addEventListener('click', function () {
  if (cartItems.length === 0) return;
  if (checkoutFormWrapper) checkoutFormWrapper.hidden = false;
  goToStep(1);
  renderCheckoutCartTable();
  wizardPromoApplied = false;
  var promoMsg = document.getElementById('promo-msg');
  if (promoMsg) { promoMsg.textContent = ''; promoMsg.className = 'promo-msg'; }
  var promoInput = document.getElementById('promo-code-input');
  if (promoInput) promoInput.value = '';
  renderFeeSummary();

  // Pre-fill from last customer
  try {
    var last = JSON.parse(localStorage.getItem('ff_last_customer') || 'null');
    if (last) {
      var nEl = document.getElementById('checkout-name');
      var phEl = document.getElementById('checkout-phone');
      var adEl = document.getElementById('checkout-address');
      if (nEl && last.name) nEl.value = last.name;
      if (phEl && last.phone) phEl.value = last.phone;
      if (adEl && last.address) adEl.value = last.address;
    }
  } catch(e) {}
  updateStep1NextBtn();

  // Promo code handler
  var promoBtn = document.getElementById('btn-apply-promo');
  if (promoBtn) {
    promoBtn.onclick = function() {
      var pInput = document.getElementById('promo-code-input');
      var pMsg = document.getElementById('promo-msg');
      var code = pInput ? pInput.value.trim().toUpperCase() : '';
      if (code === 'FRESH10') {
        wizardPromoApplied = true;
        if (pMsg) { pMsg.textContent = '✅ 10% discount applied!'; pMsg.className = 'promo-msg promo-success'; }
      } else {
        wizardPromoApplied = false;
        if (pMsg) { pMsg.textContent = '❌ Invalid promo code.'; pMsg.className = 'promo-msg promo-error'; }
      }
      renderFeeSummary();
    };
  }

  // Blur & input validation for delivery fields
  ['checkout-name', 'checkout-phone', 'checkout-address'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.onblur = function() { validateCheckoutField(el); updateStep1NextBtn(); };
      el.oninput = function() { updateStep1NextBtn(); };
    }
  });

  // Step 1 next button
  var btnNext = document.getElementById('btn-step1-next');
  if (btnNext) {
    btnNext.onclick = function() {
      var nameInput = document.getElementById('checkout-name');
      var phoneInput = document.getElementById('checkout-phone');
      var addressInput = document.getElementById('checkout-address');
      var v1 = validateCheckoutField(nameInput);
      var v2 = validateCheckoutField(phoneInput);
      var v3 = validateCheckoutField(addressInput);
      if (!v1 || !v2 || !v3) return;
      try {
        localStorage.setItem('ff_last_customer', JSON.stringify({
          name: nameInput.value.trim(),
          phone: phoneInput.value.replace(/\s/g, ''),
          address: addressInput.value.trim()
        }));
      } catch(e) {}
      goToStep(2);
      initStep2();
    };
  }
});

// ===== Inline Validation Helpers =====
function showFieldError(input, message) {
  clearFieldError(input);
  input.setAttribute('aria-invalid', 'true');
  var err = document.createElement('span');
  err.className = 'field-error';
  err.id = input.id + '-error';
  err.textContent = message;
  input.setAttribute('aria-describedby', err.id);
  input.parentNode.appendChild(err);
}

function clearFieldError(input) {
  input.removeAttribute('aria-invalid');
  var existing = input.parentNode.querySelector('.field-error');
  if (existing) existing.remove();
}

function validateCheckoutField(input) {
  var id = input.id;
  if (id === 'checkout-name') {
    if (!input.value.trim()) {
      showFieldError(input, 'Please enter your full name');
      return false;
    }
  } else if (id === 'checkout-phone') {
    var cleanPhone = input.value.replace(/\s/g, '');
    if (!cleanPhone) {
      showFieldError(input, 'Please enter your phone number');
      return false;
    }
    if (!KENYAN_PHONE_RE.test(cleanPhone)) {
      showFieldError(input, 'Please enter a valid Kenyan phone number (e.g. 0712 345 678)');
      return false;
    }
  } else if (id === 'checkout-address') {
    if (!input.value.trim()) {
      showFieldError(input, 'Please enter your delivery address');
      return false;
    }
  }
  clearFieldError(input);
  return true;
}

// ===== Step 2: Payment Method =====
function initStep2() {
  // Wire payment method card selection
  document.querySelectorAll('.payment-method-card').forEach(function(label) {
    label.onclick = function() {
      document.querySelectorAll('.payment-method-card').forEach(function(l) { l.classList.remove('selected'); });
      label.classList.add('selected');
      var radio = label.querySelector('input[type="radio"]');
      if (radio) showPaymentPanel(radio.value);
    };
  });

  showPaymentPanel('mpesa');
  initMpesaPanel();
  initCardPanel();
  initCryptoPanel();

  var btnBack = document.getElementById('btn-step2-back');
  if (btnBack) btnBack.onclick = function() { goToStep(1); renderCheckoutCartTable(); renderFeeSummary(); };
}

function showPaymentPanel(method) {
  ['mpesa', 'card', 'crypto'].forEach(function(m) {
    var panel = document.getElementById('panel-' + m);
    if (panel) panel.hidden = (m !== method);
  });
}

function initMpesaPanel() {
  var phoneEl = document.getElementById('checkout-phone');
  var mpesaEl = document.getElementById('mpesa-phone');
  if (mpesaEl && phoneEl) {
    var clean = phoneEl.value.replace(/\s/g, '');
    if (KENYAN_PHONE_RE.test(clean)) mpesaEl.value = clean;
  }
  var btn = document.getElementById('btn-pay-mpesa');
  if (!btn) return;
  btn.onclick = function() {
    var phoneInput = document.getElementById('mpesa-phone');
    var errEl = document.getElementById('mpesa-phone-error');
    var phone = phoneInput ? phoneInput.value.replace(/\s/g, '') : '';
    if (!KENYAN_PHONE_RE.test(phone)) {
      if (errEl) { errEl.textContent = 'Please enter a valid Kenyan phone number (e.g. 0712 345 678)'; errEl.style.display = 'block'; }
      return;
    }
    if (errEl) errEl.style.display = 'none';
    var spinnerMsg = document.getElementById('mpesa-spinner-msg');
    var statusText = document.getElementById('mpesa-status-text');
    if (spinnerMsg) spinnerMsg.hidden = false;
    if (statusText) statusText.textContent = 'STK Push sent to ' + phone + ' — Enter your M-Pesa PIN on your phone';
    btn.disabled = true;
    setTimeout(function() {
      if (spinnerMsg) spinnerMsg.hidden = true;
      btn.disabled = false;
      placeOrder('M-Pesa', phone);
    }, PAYMENT_CONFIG.mpesaStkDelay);
  };
}

function initCardPanel() {
  var cardNumEl = document.getElementById('card-number');
  var cardTypeIcon = document.getElementById('card-type-icon');
  if (cardNumEl) {
    cardNumEl.addEventListener('input', function() {
      var raw = cardNumEl.value.replace(/\D/g, '').slice(0, 16);
      var parts = raw.match(/.{1,4}/g);
      cardNumEl.value = parts ? parts.join(' ') : raw;
      if (cardTypeIcon) {
        if (raw.startsWith('4')) cardTypeIcon.textContent = '💳 Visa';
        else if (raw.startsWith('5')) cardTypeIcon.textContent = '💳 Mastercard';
        else cardTypeIcon.textContent = '';
      }
    });
    cardNumEl.addEventListener('blur', function() {
      var raw = cardNumEl.value.replace(/\D/g, '');
      var errEl = document.getElementById('card-number-error');
      if (errEl) errEl.textContent = (!raw || raw.length < 13) ? 'Please enter a valid card number' : '';
    });
  }
  var expiryEl = document.getElementById('card-expiry');
  if (expiryEl) {
    expiryEl.addEventListener('input', function() {
      var raw = expiryEl.value.replace(/\D/g, '');
      if (raw.length >= 3) expiryEl.value = raw.slice(0, 2) + ' / ' + raw.slice(2, 4);
      else expiryEl.value = raw;
    });
    expiryEl.addEventListener('blur', function() {
      var errEl = document.getElementById('card-expiry-error');
      var val = expiryEl.value.replace(/\D/g, '');
      if (errEl) errEl.textContent = (!val || val.length < 4) ? 'Please enter a valid expiry (MM/YY)' : '';
    });
  }
  var cvvEl = document.getElementById('card-cvv');
  if (cvvEl) {
    cvvEl.addEventListener('blur', function() {
      var errEl = document.getElementById('card-cvv-error');
      if (errEl) errEl.textContent = (!cvvEl.value || cvvEl.value.length < 3) ? 'Please enter a valid CVV' : '';
    });
  }
  var cardNameEl = document.getElementById('card-name');
  if (cardNameEl) {
    cardNameEl.addEventListener('blur', function() {
      var errEl = document.getElementById('card-name-error');
      if (errEl) errEl.textContent = !cardNameEl.value.trim() ? 'Please enter the cardholder name' : '';
    });
  }
  var btnPayCard = document.getElementById('btn-pay-card');
  if (btnPayCard) {
    btnPayCard.onclick = function() {
      var numRaw = cardNumEl ? cardNumEl.value.replace(/\D/g, '') : '';
      var nameVal = cardNameEl ? cardNameEl.value.trim() : '';
      var expVal = expiryEl ? expiryEl.value.replace(/\D/g, '') : '';
      var cvvVal = cvvEl ? cvvEl.value : '';
      var numErr = document.getElementById('card-number-error');
      var nameErr = document.getElementById('card-name-error');
      var expErr = document.getElementById('card-expiry-error');
      var cvvErr = document.getElementById('card-cvv-error');
      var hasError = false;
      if (!numRaw || numRaw.length < 13) { if (numErr) numErr.textContent = 'Please enter a valid card number'; hasError = true; } else { if (numErr) numErr.textContent = ''; }
      if (!nameVal) { if (nameErr) nameErr.textContent = 'Please enter the cardholder name'; hasError = true; } else { if (nameErr) nameErr.textContent = ''; }
      if (!expVal || expVal.length < 4) { if (expErr) expErr.textContent = 'Please enter a valid expiry (MM/YY)'; hasError = true; } else { if (expErr) expErr.textContent = ''; }
      if (!cvvVal || cvvVal.length < 3) { if (cvvErr) cvvErr.textContent = 'Please enter a valid CVV'; hasError = true; } else { if (cvvErr) cvvErr.textContent = ''; }
      if (hasError) return;
      var cardType = numRaw.startsWith('4') ? 'Visa' : (numRaw.startsWith('5') ? 'Mastercard' : 'Card');
      var maskedDetail = cardType + ' ···' + numRaw.slice(-4);
      var spinnerMsg = document.getElementById('card-spinner-msg');
      if (spinnerMsg) spinnerMsg.hidden = false;
      btnPayCard.disabled = true;
      setTimeout(function() {
        if (spinnerMsg) spinnerMsg.hidden = true;
        btnPayCard.disabled = false;
        placeOrder('Card', maskedDetail);
      }, PAYMENT_CONFIG.cardProcessDelay);
    };
  }
}

function initCryptoPanel() {
  updateCryptoPanel();
  document.querySelectorAll('input[name="crypto-coin"]').forEach(function(radio) {
    radio.addEventListener('change', updateCryptoPanel);
  });
  var copyBtn = document.getElementById('btn-copy-address');
  if (copyBtn) {
    copyBtn.onclick = function() {
      var addrEl = document.getElementById('crypto-address');
      if (!addrEl) return;
      try {
        navigator.clipboard.writeText(addrEl.value);
      } catch(e) {
        var ta = document.createElement('textarea');
        ta.value = addrEl.value;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copyBtn.textContent = '✅ Copied!';
      setTimeout(function() { copyBtn.textContent = '📋 Copy'; }, 2000);
    };
  }
  var payBtn = document.getElementById('btn-pay-crypto');
  if (payBtn) {
    payBtn.onclick = function() {
      var coinRadio = document.querySelector('input[name="crypto-coin"]:checked');
      var coin = coinRadio ? coinRadio.value.toUpperCase() : 'USDT';
      var amtDisplay = document.getElementById('crypto-amount-display');
      var amtText = amtDisplay ? amtDisplay.textContent.trim() : '';
      placeOrder('Crypto', coin + ' — ' + amtText);
    };
  }
}

function updateCryptoPanel() {
  var coinRadio = document.querySelector('input[name="crypto-coin"]:checked');
  var coin = coinRadio ? coinRadio.value : 'usdt';
  var t = computeTotals();
  var usd = t.grand / PAYMENT_CONFIG.kesPerUsd;
  var amountDisplay = document.getElementById('crypto-amount-display');
  var addrEl = document.getElementById('crypto-address');
  var noteEl = document.getElementById('crypto-note');
  var qrGrid = document.getElementById('qr-grid');
  if (coin === 'usdt') {
    var usdt = usd.toFixed(2);
    if (amountDisplay) amountDisplay.textContent = usdt + ' USDT (TRC-20)  ≈  ' + formatKES(t.grand);
    if (addrEl) addrEl.value = PAYMENT_CONFIG.usdtWalletAddress; // Demo address — replace in production
    if (noteEl) noteEl.textContent = 'Send exactly ' + usdt + ' USDT (TRC-20) to the address above. Payment confirmed after 1 network confirmation (~1 min).';
  } else {
    var btc = (usd / PAYMENT_CONFIG.btcUsdPrice).toFixed(8);
    if (amountDisplay) amountDisplay.textContent = btc + ' BTC  ≈  ' + formatKES(t.grand);
    if (addrEl) addrEl.value = PAYMENT_CONFIG.btcWalletAddress; // Demo address — replace in production
    if (noteEl) noteEl.textContent = 'Send exactly ' + btc + ' BTC to the address above. Payment confirmed after 1 block confirmation (~10 min).';
  }
  // NOTE: This QR grid is purely decorative — it does NOT generate a valid, scannable QR code.
  // For production, replace with a QR code library (e.g. qrcode.js).
  if (qrGrid) {
    var cells = '';
    for (var row = 0; row < 10; row++) {
      for (var col = 0; col < 10; col++) {
        var isFinder = (row < 3 && col < 3) || (row < 3 && col > 6) || (row > 6 && col < 3);
        var dark = isFinder || (Math.sin(row * 7 + col * 13 + coin.length) > 0);
        cells += '<div class="qr-cell ' + (dark ? 'dark' : 'light') + '"></div>';
      }
    }
    qrGrid.innerHTML = cells;
  }
}

// ===== Step 3: Place Order & Confirmation =====
function placeOrder(paymentMethod, paymentDetail) {
  var nameInput = document.getElementById('checkout-name');
  var phoneInput = document.getElementById('checkout-phone');
  var addressInput = document.getElementById('checkout-address');
  var name = nameInput ? nameInput.value.trim() : '';
  var phone = phoneInput ? phoneInput.value.replace(/\s/g, '') : '';
  var address = addressInput ? addressInput.value.trim() : '';
  var t = computeTotals();

  // Look up or create customer
  var users = getStore('ff_users');
  var existingUser = users.find(function (u) { return u.phone === phone; });
  var customerId;
  if (existingUser) {
    existingUser.ordersCount = (existingUser.ordersCount || 0) + 1;
    customerId = existingUser.id;
    setStore('ff_users', users);
  } else {
    customerId = 'cust-' + Date.now();
    users.push({ id: customerId, name: name, phone: phone, address: address, ordersCount: 1 });
    setStore('ff_users', users);
  }

  // Capture items before clearing cart (for receipt)
  var orderedItems = cartItems.slice();

  // Persist order
  var orders = getStore('ff_orders');
  var newOrderId = 'ord-' + Date.now();
  orders.push({
    id: newOrderId,
    customerId: customerId,
    customer: name,
    phone: phone,
    address: address,
    paymentMethod: paymentMethod,
    paymentDetail: paymentDetail,
    items: orderedItems.map(function (i) {
      return { productId: i.productId || '', farmerId: i.farmerId || '', farmerName: i.farmerName || '', name: i.name, quantity: i.quantity, price: i.price, subtotal: i.price * i.quantity, itemStatus: 'Pending' };
    }),
    total: t.grand,
    discount: t.discount,
    deliveryFee: t.delivery,
    status: 'Pending',
    date: new Date().toISOString().slice(0, 10)
  });
  setStore('ff_orders', orders);

  // Populate existing receipt-block for print compatibility
  populatePrintReceiptBlock(newOrderId, name, phone, address, orderedItems, t, paymentMethod, paymentDetail);

  // Go to step 3
  goToStep(3);
  renderStep3(newOrderId, name, phone, address, orderedItems, paymentMethod, paymentDetail, t);

  // Clear cart
  cartItems = [];
  updateCartDisplay();
}

function populatePrintReceiptBlock(orderId, name, phone, address, items, totals, paymentMethod, paymentDetail) {
  var receiptBlock = document.getElementById('receipt-block');
  if (!receiptBlock) return;
  var orderDate = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
  var receiptMeta = document.getElementById('receipt-meta');
  if (receiptMeta) receiptMeta.innerHTML = 'Order ID: <strong>' + escapeHtml(orderId) + '</strong> &nbsp;|&nbsp; Date: ' + escapeHtml(orderDate) + ' &nbsp;|&nbsp; Payment: ' + escapeHtml(paymentMethod) + ' (' + escapeHtml(paymentDetail) + ')';
  var receiptCustomer = document.getElementById('receipt-customer');
  if (receiptCustomer) receiptCustomer.textContent = 'Customer: ' + name;
  var receiptItemsEl = document.getElementById('receipt-items');
  if (receiptItemsEl) {
    var farmerGroups = [];
    items.forEach(function (i) {
      var key = i.farmerId || 'unknown';
      var group = farmerGroups.find(function (g) { return g.farmerId === key; });
      if (!group) { group = { farmerId: key, farmerName: i.farmerName || 'Unknown Farmer', items: [] }; farmerGroups.push(group); }
      group.items.push(i);
    });
    var rowsHtml = '';
    farmerGroups.forEach(function (group) {
      rowsHtml += '<tr class="receipt-farmer-group-header"><td colspan="4">👨‍🌾 ' + escapeHtml(group.farmerName) + '</td></tr>';
      group.items.forEach(function (i) {
        rowsHtml += '<tr><td>' + escapeHtml(i.name) + ' <small class="receipt-farmer">by ' + escapeHtml(i.farmerName || '') + '</small></td><td class="receipt-qty">' + i.quantity + '</td><td class="receipt-price">' + formatKES(i.price) + '</td><td class="receipt-price">' + formatKES(i.price * i.quantity) + '</td></tr>';
      });
    });
    receiptItemsEl.innerHTML = rowsHtml;
  }
  var receiptGrandTotal = document.getElementById('receipt-grand-total');
  if (receiptGrandTotal) receiptGrandTotal.textContent = formatKES(totals.grand);
  var receiptAddress = document.getElementById('receipt-address');
  if (receiptAddress) receiptAddress.textContent = address;
  var receiptPhone = document.getElementById('receipt-phone');
  if (receiptPhone) receiptPhone.textContent = phone;
  var receiptStatusBadge = document.getElementById('receipt-status-badge');
  if (receiptStatusBadge) receiptStatusBadge.innerHTML = '<span class="receipt-status-badge receipt-badge-pending">Pending</span>';
  receiptBlock.hidden = false;
  var btnPrint = document.getElementById('btn-print-receipt');
  if (btnPrint) btnPrint.hidden = false;
}

function renderStep3(orderId, name, phone, address, items, paymentMethod, paymentDetail, totals) {
  var step3 = document.getElementById('checkout-step-3');
  if (!step3) return;
  var orderDate = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });

  // Order stepper — Pending = done
  var stepperSteps = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
  var stepperHtml = '<div class="order-stepper">';
  stepperSteps.forEach(function(s, i) {
    stepperHtml += '<div class="order-step">' +
      '<div class="order-step-circle' + (i === 0 ? ' done' : '') + '">' + (i === 0 ? '✓' : (i + 1)) + '</div>' +
      '<div class="order-step-label' + (i === 0 ? ' done' : '') + '">' + escapeHtml(s) + '</div>' +
    '</div>';
    if (i < stepperSteps.length - 1) stepperHtml += '<div class="order-step-connector"></div>';
  });
  stepperHtml += '</div>';

  var itemRows = items.map(function(i) {
    return '<tr><td>' + escapeHtml(i.name) + '</td><td>' + i.quantity + '</td><td>' + formatKES(i.price) + '</td><td>' + formatKES(i.price * i.quantity) + '</td></tr>';
  }).join('');

  step3.innerHTML =
    '<div class="order-confirmation-card">' +
      '<h3 style="color:var(--green);margin:0 0 4px;">✅ Order Placed!</h3>' +
      '<p style="color:var(--muted);margin:0 0 16px;font-size:0.9rem;">Thank you for shopping with Farm Fresh. We\'ll contact you to confirm.</p>' +
      '<p><strong>Order ID:</strong> ' + escapeHtml(orderId) + '</p>' +
      '<p><strong>Date:</strong> ' + escapeHtml(orderDate) + '</p>' +
      '<p><strong>Customer:</strong> ' + escapeHtml(name) + '</p>' +
      '<p><strong>Phone:</strong> ' + escapeHtml(phone) + '</p>' +
      '<p><strong>Address:</strong> ' + escapeHtml(address) + '</p>' +
      '<p><strong>Payment:</strong> ' + escapeHtml(paymentMethod) + ' (' + escapeHtml(paymentDetail) + ')</p>' +
      '<h4 style="margin:16px 0 8px;color:var(--green);">Order Status</h4>' +
      stepperHtml +
      '<h4 style="margin:16px 0 8px;color:var(--green);">Items</h4>' +
      '<table class="checkout-cart-table">' +
        '<thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>' +
        '<tbody>' + itemRows + '</tbody>' +
      '</table>' +
      '<div class="checkout-fee-summary" style="margin-top:12px;">' +
        '<div class="fee-row"><span>Subtotal</span><span>' + formatKES(totals.subtotal) + '</span></div>' +
        '<div class="fee-row"><span>Delivery</span><span>' + (totals.delivery === 0 ? '🆓 Free' : formatKES(totals.delivery)) + '</span></div>' +
        (totals.discount > 0 ? '<div class="fee-row discount-row"><span>Promo discount</span><span>−' + formatKES(totals.discount) + '</span></div>' : '') +
        '<div class="fee-row grand-total"><span>Grand Total</span><span>' + formatKES(totals.grand) + '</span></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px;">' +
        '<button type="button" class="btn-continue-shopping" id="btn-continue-shopping">🛍️ Continue Shopping</button>' +
        '<button type="button" class="btn-submit" id="btn-step3-print" style="background:#1565c0;">🖨️ Print Receipt</button>' +
      '</div>' +
      '<p style="font-size:0.8rem;color:var(--muted);margin-top:12px;">Expected delivery: within 24 hours. hello@farmfresh.co.ke | +254 712 345 678</p>' +
    '</div>';

  var continueBtn = document.getElementById('btn-continue-shopping');
  if (continueBtn) {
    continueBtn.onclick = function() {
      if (checkoutFormWrapper) checkoutFormWrapper.hidden = true;
      wizardPromoApplied = false;
      var productsSection = document.getElementById('products');
      if (productsSection) productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
  var printBtn = document.getElementById('btn-step3-print');
  if (printBtn) {
    printBtn.onclick = function() {
      var existingPrint = document.getElementById('btn-print-receipt');
      if (existingPrint) existingPrint.click();
      else window.print();
    };
  }
}

// ===== Review Form =====
var reviewForm = document.getElementById('review-form');
if (reviewForm) {
  var reviewNameInput = document.getElementById('review-name');
  var reviewCommentInput = document.getElementById('review-comment');

  function validateReviewTextField(input) {
    if (!input.value.trim()) {
      showFieldError(input, input.id === 'review-name' ? 'Please enter your name' : 'Please enter a comment');
      return false;
    }
    clearFieldError(input);
    return true;
  }

  if (reviewNameInput) reviewNameInput.addEventListener('blur', function () { validateReviewTextField(reviewNameInput); });
  if (reviewCommentInput) reviewCommentInput.addEventListener('blur', function () { validateReviewTextField(reviewCommentInput); });

  reviewForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var nameInput = document.getElementById('review-name');
    var ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
    var commentInput = document.getElementById('review-comment');
    var productSelect = document.getElementById('review-product');

    var reviewerName = nameInput ? nameInput.value.trim() : '';
    var rating = ratingInput ? parseInt(ratingInput.value, 10) : 0;
    var comment = commentInput ? commentInput.value.trim() : '';

    var validName = nameInput ? validateReviewTextField(nameInput) : false;
    var validComment = commentInput ? validateReviewTextField(commentInput) : false;
    if (!validName || !rating || !validComment) {
      if (!rating) showToast('Please select a star rating');
      return;
    }

    var submitBtn = document.getElementById('btn-submit-review');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }

    // Resolve productId / farmerId from selected product
    var selectedProductId = productSelect ? productSelect.value : '';
    var selectedFarmerId = '';
    if (selectedProductId) {
      var allProducts = getStore('ff_products');
      var selectedProduct = allProducts.find(function (p) { return p.id === selectedProductId; });
      if (selectedProduct) selectedFarmerId = selectedProduct.farmerId || '';
    }

    // Persist review to ff_reviews
    var reviews = getStore('ff_reviews');
    reviews.unshift({
      id: 'rev-' + Date.now(),
      name: reviewerName,
      productId: selectedProductId,
      farmerId: selectedFarmerId,
      rating: rating,
      comment: comment,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10)
    });
    setStore('ff_reviews', reviews);

    // Re-render reviews list
    renderReviews();

    reviewForm.reset();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Review';
    }
  });
}

// ===== Search Functionality =====
var searchInput = document.getElementById('product-search');
if (searchInput) {
  searchInput.addEventListener('input', function () {
    var query = searchInput.value.toLowerCase().trim();
    var activeBtn = document.querySelector('.filter-btn.active');
    var activeFilter = activeBtn ? activeBtn.dataset.filter : 'all';
    document.querySelectorAll('.product-list ul li').forEach(function (li) {
      var name = (li.dataset.name || '').toLowerCase();
      var farmer = (li.dataset.farmer || '').toLowerCase();
      var availability = (li.dataset.availability || '').toLowerCase();
      var cat = (li.dataset.category || '');
      var matchesFilter = activeFilter === 'all' || cat === activeFilter;
      var matchesSearch = !query || name.includes(query) || farmer.includes(query) || availability.includes(query);
      li.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
  });
}

// ===== Category Filter Logic =====
var filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(function (btn) {
  btn.addEventListener('click', function () {
    filterButtons.forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var filter = btn.dataset.filter;
    var query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    document.querySelectorAll('.product-list ul li').forEach(function (li) {
      var name = (li.dataset.name || '').toLowerCase();
      var farmer = (li.dataset.farmer || '').toLowerCase();
      var availability = (li.dataset.availability || '').toLowerCase();
      var cat = li.dataset.category || '';
      var matchesFilter = filter === 'all' || cat === filter;
      var matchesSearch = !query || name.includes(query) || farmer.includes(query) || availability.includes(query);
      li.style.display = (matchesFilter && matchesSearch) ? '' : 'none';
    });
  });
});

// ===== Hamburger Menu Toggle =====
var hamburger = document.querySelector('.hamburger');
var headerEl = document.querySelector('header');
if (hamburger && headerEl) {
  hamburger.addEventListener('click', function () {
    headerEl.classList.toggle('nav-open');
  });
}

// ===== Track Order functionality =====
var btnTrackOrder = document.getElementById('btn-track-order');
if (btnTrackOrder) {
  btnTrackOrder.addEventListener('click', function () {
    var input = document.getElementById('track-order-id');
    var resultEl = document.getElementById('track-result');
    if (!input || !resultEl) return;

    var orderId = input.value.trim();
    if (!orderId) {
      resultEl.innerHTML = '<p class="track-error">Please enter an Order ID.</p>';
      resultEl.hidden = false;
      return;
    }

    var orders = getStore('ff_orders');
    var order = orders.find(function (o) { return o.id === orderId; });

    if (!order) {
      resultEl.innerHTML = '<p class="track-error">Order not found. Please check your Order ID.</p>';
      resultEl.hidden = false;
      return;
    }

    var steps = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
    var currentIdx = steps.indexOf(order.status);

    var stepsHtml = '<div class="shipping-steps">';
    steps.forEach(function (step, i) {
      var done = i <= currentIdx;
      stepsHtml += '<div class="shipping-step">' +
        '<div class="step-circle' + (done ? ' done' : '') + '">' + (i + 1) + '</div>' +
        '<div class="step-label' + (done ? ' done' : '') + '">' + escapeHtml(step) + '</div>' +
        '</div>';
      if (i < steps.length - 1) {
        stepsHtml += '<div class="step-connector' + (done && currentIdx > i ? ' done' : '') + '"></div>';
      }
    });
    stepsHtml += '</div>';

    var statusCls = 'receipt-badge-pending';
    if (order.status === 'Confirmed') statusCls = 'receipt-badge-confirmed';
    else if (order.status === 'Dispatched') statusCls = 'receipt-badge-dispatched';
    else if (order.status === 'Delivered') statusCls = 'receipt-badge-delivered';

    // Group items by farmer
    var farmerGroups = {};
    order.items.forEach(function (item) {
      var key = item.farmerId || 'unknown';
      if (!farmerGroups[key]) {
        farmerGroups[key] = { farmerName: item.farmerName || 'Unknown Farmer', itemStatus: item.itemStatus || order.status, items: [] };
      }
      farmerGroups[key].items.push(item);
    });

    var farmerGroupsHtml = Object.keys(farmerGroups).map(function (key) {
      var group = farmerGroups[key];
      var iStatus = group.itemStatus;
      var iCls = 'receipt-badge-pending';
      if (iStatus === 'Confirmed') iCls = 'receipt-badge-confirmed';
      else if (iStatus === 'Dispatched') iCls = 'receipt-badge-dispatched';
      else if (iStatus === 'Delivered') iCls = 'receipt-badge-delivered';
      var itemsListHtml = group.items.map(function (i) {
        return '<li>' + escapeHtml(i.name) + ' \xD7 ' + escapeHtml(String(i.quantity)) +
          ' \u2014 ' + formatKES(i.subtotal || i.price * i.quantity) + '</li>';
      }).join('');
      return '<div class="track-farmer-group">' +
        '<h4>👨‍🌾 ' + escapeHtml(group.farmerName) +
        ' <span class="receipt-status-badge ' + iCls + '">' + escapeHtml(iStatus) + '</span></h4>' +
        '<ul>' + itemsListHtml + '</ul>' +
        '</div>';
    }).join('');

    resultEl.innerHTML =
      '<div class="track-card">' +
        '<h3>Order ' + escapeHtml(order.id) + '</h3>' +
        '<p><strong>Date:</strong> ' + escapeHtml(order.date) + '</p>' +
        '<p><strong>Customer:</strong> ' + escapeHtml(order.customer) + '</p>' +
        stepsHtml +
        '<p>📍 <strong>Delivery Address:</strong> ' + escapeHtml(order.address) + '</p>' +
        '<p><strong>Items by Farmer:</strong></p>' +
        farmerGroupsHtml +
        '<p><strong>Total:</strong> ' + formatKES(order.total) + '</p>' +
        '<p><strong>Overall Status:</strong> <span class="receipt-status-badge ' + statusCls + '">' + escapeHtml(order.status) + '</span></p>' +
      '</div>';
    resultEl.hidden = false;
  });

  // Allow Enter key in track input
  var trackInput = document.getElementById('track-order-id');
  if (trackInput) {
    trackInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btnTrackOrder.click();
    });
  }
}

// ===== Farmer Rating Modal =====
function openRatingModal(farmerId) {
  var farmers = getStore('ff_farmers');
  var farmer = farmers.find(function(f) { return f.id === farmerId; });
  if (!farmer) return;

  var modal = document.getElementById('farmer-rating-modal');
  var title = document.getElementById('rating-modal-farmer-name');
  var sliders = document.getElementById('rating-modal-sliders');
  if (!modal || !title || !sliders) return;

  title.textContent = 'Rate ' + farmer.name;
  modal.dataset.farmerId = farmerId;

  var metrics = [
    { key: 'freshness', label: 'Freshness', desc: 'Produce freshness on arrival' },
    { key: 'delivery', label: 'Delivery', desc: 'Punctuality & reliability' },
    { key: 'packaging', label: 'Packaging', desc: 'Quality & sustainability' },
    { key: 'communication', label: 'Communication', desc: 'Responsiveness to queries' },
    { key: 'value', label: 'Value', desc: 'Price-to-quality ratio' },
    { key: 'consistency', label: 'Consistency', desc: 'Consistent quality order-to-order' }
  ];

  sliders.innerHTML = metrics.map(function(m) {
    return '<div class="rating-slider-row">' +
      '<label for="rate-' + m.key + '" class="rating-slider-label">' +
        '<strong>' + escapeHtml(m.label) + '</strong>' +
        '<small>' + escapeHtml(m.desc) + '</small>' +
      '</label>' +
      '<div class="rating-slider-control">' +
        '<input type="range" id="rate-' + m.key + '" name="rate-' + m.key + '" ' +
          'min="1" max="5" step="0.5" value="3" ' +
          'aria-label="' + escapeHtml(m.label) + ' rating" ' +
          'aria-valuemin="1" aria-valuemax="5" aria-valuenow="3">' +
        '<span class="slider-value" id="rate-' + m.key + '-val">3.0</span>' +
      '</div>' +
    '</div>';
  }).join('');

  sliders.querySelectorAll('input[type="range"]').forEach(function(slider) {
    var valSpan = document.getElementById(slider.id + '-val');
    slider.addEventListener('input', function() {
      if (valSpan) valSpan.textContent = parseFloat(slider.value).toFixed(1);
      slider.setAttribute('aria-valuenow', slider.value);
    });
  });

  modal.hidden = false;
  var box = modal.querySelector('.rating-modal-box');
  if (box) box.focus();
  trapFocus(modal);
}

function closeRatingModal() {
  var modal = document.getElementById('farmer-rating-modal');
  if (modal) modal.hidden = true;
}

function submitFarmerRating() {
  var modal = document.getElementById('farmer-rating-modal');
  if (!modal) return;
  var farmerId = modal.dataset.farmerId;
  var farmers = getStore('ff_farmers');
  var farmer = farmers.find(function(f) { return f.id === farmerId; });
  if (!farmer) return;

  var metrics = ['freshness', 'delivery', 'packaging', 'communication', 'value', 'consistency'];
  var newScores = {};
  metrics.forEach(function(m) {
    var slider = document.getElementById('rate-' + m);
    newScores[m] = slider ? parseFloat(slider.value) : 3;
  });

  var existingRatings = farmer.ratings || {};
  var n = farmer.totalReviews || 0;
  var updatedRatings = {};
  metrics.forEach(function(m) {
    var existing = existingRatings[m] || 0;
    updatedRatings[m] = Math.round(((existing * n + newScores[m]) / (n + 1)) * 10) / 10;
  });
  var sum = metrics.reduce(function(acc, m) { return acc + updatedRatings[m]; }, 0);
  updatedRatings.overall = Math.round((sum / metrics.length) * 10) / 10;

  farmer.ratings = updatedRatings;
  farmer.totalReviews = n + 1;
  setStore('ff_farmers', farmers);
  closeRatingModal();
  renderFarmers();
  showToast('✅ Rating submitted for ' + farmer.name);
}

function trapFocus(element) {
  var focusable = element.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  element.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { closeRatingModal(); element.removeEventListener('keydown', handler); return; }
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

// ===== Init: Seed → Render → Attach Listeners =====
seedAdminData();
renderProducts();
renderFarmers();
renderReviews();
attachAddToCartListeners();
attachQtySteppers();

// Populate review product dropdown
(function populateReviewProductDropdown() {
  var select = document.getElementById('review-product');
  if (!select) return;
  var products = getStore('ff_products');
  select.innerHTML = '<option value="">— Select a product (optional) —</option>' +
    products.map(function (p) {
      return '<option value="' + escapeHtml(p.id) + '">' + escapeHtml(p.name) + ' (' + escapeHtml(p.farmer) + ')</option>';
    }).join('');
})();

// ===== Print Receipt Button =====
var btnPrintReceiptEl = document.getElementById('btn-print-receipt');
if (btnPrintReceiptEl) {
  function afterPrint() {
    var rb = document.getElementById('receipt-block');
    if (rb) rb.hidden = true;
    btnPrintReceiptEl.hidden = true;
    window.removeEventListener('afterprint', afterPrint);
  }
  btnPrintReceiptEl.addEventListener('click', function () {
    window.print();
    // Hide receipt after the print dialog closes (afterprint event)
    window.addEventListener('afterprint', afterPrint);
  });
}
