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
      { id: 'f1', name: 'John Kamau', location: 'Nakuru, Kenya', bio: 'John has been farming organically for over 15 years, specialising in tomatoes and leafy greens grown without pesticides.', phone: '0711111111', email: 'john@farmfresh.co.ke' },
      { id: 'f2', name: 'Amina Wanjiru', location: 'Kiambu, Kenya', bio: 'Amina runs a family farm famous for its award-winning spinach and zucchini, using traditional irrigation methods.', phone: '0722222222', email: 'amina@farmfresh.co.ke' }
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

// ===== Render Products from localStorage =====
function renderProducts() {
  var products = getStore('ff_products');
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
      '<small>By ' + escapeHtml(p.farmer) + '</small>' +
      (p.originalPrice && p.originalPrice !== p.price
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

// ===== Render Farmers from localStorage =====
function renderFarmers() {
  var farmers = getStore('ff_farmers');
  var grid = document.querySelector('#farmers .farmers-grid');
  if (!grid) return;
  grid.innerHTML = '';

  farmers.forEach(function (f) {
    var card = document.createElement('div');
    card.className = 'farmer-card';
    card.innerHTML =
      '<h3>' + escapeHtml(f.name) + '</h3>' +
      '<p class="farmer-location">📍 ' + escapeHtml(f.location) + '</p>' +
      '<p class="farmer-bio">' + escapeHtml(f.bio) + '</p>' +
      '<a href="#products" class="farmer-link">View Products</a>';
    grid.appendChild(card);
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

// ===== Checkout Button: show form + populate summary table =====
checkoutButton.addEventListener('click', function () {
  if (cartItems.length === 0) return;
  if (checkoutFormWrapper) {
    checkoutFormWrapper.hidden = false;
  }
  var summaryEl = document.getElementById('order-summary-preview');
  if (summaryEl) {
    var rows = cartItems.map(function (i) {
      return '<tr>' +
        '<td>' + escapeHtml(i.name) + '</td>' +
        '<td class="summary-qty">\xD7' + i.quantity + '</td>' +
        '<td class="summary-price">' + formatKES(i.price) + '</td>' +
        '<td class="summary-price">' + formatKES(i.price * i.quantity) + '</td>' +
        '</tr>';
    }).join('');
    var grandTotal = cartItems.reduce(function (a, i) { return a + i.price * i.quantity; }, 0);
    summaryEl.innerHTML =
      '<table class="summary-table">' +
        '<thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr>' +
          '<td colspan="3"><strong>Grand Total</strong></td>' +
          '<td class="summary-price"><strong>' + formatKES(grandTotal) + '</strong></td>' +
        '</tr></tfoot>' +
      '</table>';
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
    if (!/^0[17]\d{8}$/.test(cleanPhone)) {
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

// ===== Checkout Form =====
if (checkoutForm) {
  // Blur validation
  ['checkout-name', 'checkout-phone', 'checkout-address'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('blur', function () { validateCheckoutField(el); });
  });

  checkoutForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var nameInput = document.getElementById('checkout-name');
    var phoneInput = document.getElementById('checkout-phone');
    var addressInput = document.getElementById('checkout-address');

    var validName = validateCheckoutField(nameInput);
    var validPhone = validateCheckoutField(phoneInput);
    var validAddress = validateCheckoutField(addressInput);
    if (!validName || !validPhone || !validAddress) return;

    var name = nameInput.value.trim();
    var phone = phoneInput.value.replace(/\s/g, '');
    var address = addressInput.value.trim();
    var totalValue = cartItems.reduce(function (a, i) { return a + i.price * i.quantity; }, 0);

    // Look up or create customer in ff_users
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

    // Persist order to ff_orders
    var orders = getStore('ff_orders');
    var newOrderId = 'ord-' + Date.now();
    orders.push({
      id: newOrderId,
      customerId: customerId,
      customer: name,
      phone: phone,
      address: address,
      items: cartItems.map(function (i) {
        return {
          productId:  i.productId || '',
          farmerId:   i.farmerId || '',
          farmerName: i.farmerName || '',
          name:       i.name,
          quantity:   i.quantity,
          price:      i.price,
          subtotal:   i.price * i.quantity,
          itemStatus: 'Pending'
        };
      }),
      total: totalValue,
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10)
    });
    setStore('ff_orders', orders);

    // Show inline confirmation
    if (orderConfirmation) orderConfirmation.hidden = false;
    if (checkoutFormWrapper) checkoutFormWrapper.hidden = true;
    cartList.style.display = 'none';
    var totalLine = cart.querySelector('.cart-total-line');
    if (totalLine) totalLine.style.display = 'none';
    checkoutButton.style.display = 'none';

    // ===== Populate & Show Receipt =====
    var receiptBlock = document.getElementById('receipt-block');
    var receiptMeta = document.getElementById('receipt-meta');
    var receiptItems = document.getElementById('receipt-items');
    var receiptGrandTotal = document.getElementById('receipt-grand-total');
    var receiptAddress = document.getElementById('receipt-address');
    var receiptPhone = document.getElementById('receipt-phone');
    var btnPrintReceipt = document.getElementById('btn-print-receipt');

    if (receiptBlock) {
      var orderDate = new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' });
      if (receiptMeta) receiptMeta.innerHTML = 'Order ID: <strong>' + escapeHtml(newOrderId) + '</strong> &nbsp;|&nbsp; Date: ' + escapeHtml(orderDate);

      var receiptCustomer = document.getElementById('receipt-customer');
      if (receiptCustomer) receiptCustomer.textContent = 'Customer: ' + name;

      if (receiptItems) {
        // Group cart items by farmer
        var farmerGroups = [];
        cartItems.forEach(function (i) {
          var farmerKey = i.farmerId || 'unknown';
          var group = farmerGroups.find(function (g) { return g.farmerId === farmerKey; });
          if (!group) {
            group = { farmerId: farmerKey, farmerName: i.farmerName || 'Unknown Farmer', items: [] };
            farmerGroups.push(group);
          }
          group.items.push(i);
        });

        var rowsHtml = '';
        farmerGroups.forEach(function (group) {
          rowsHtml += '<tr class="receipt-farmer-group-header"><td colspan="4">👨‍🌾 ' + escapeHtml(group.farmerName) + '</td></tr>';
          group.items.forEach(function (i) {
            rowsHtml +=
              '<tr>' +
              '<td>' + escapeHtml(i.name) + ' <small class="receipt-farmer">by ' + escapeHtml(i.farmerName || '') + '</small></td>' +
              '<td class="receipt-qty">' + i.quantity + '</td>' +
              '<td class="receipt-price">' + formatKES(i.price) + '</td>' +
              '<td class="receipt-price">' + formatKES(i.price * i.quantity) + '</td>' +
              '</tr>';
          });
        });
        receiptItems.innerHTML = rowsHtml;
      }

      if (receiptGrandTotal) receiptGrandTotal.textContent = formatKES(totalValue);
      if (receiptAddress) receiptAddress.textContent = address;
      if (receiptPhone) receiptPhone.textContent = phone;

      // Shipping status badge
      var receiptStatusBadge = document.getElementById('receipt-status-badge');
      if (receiptStatusBadge) {
        var currentOrders = getStore('ff_orders');
        var thisOrder = currentOrders.find(function (o) { return o.id === newOrderId; });
        var status = thisOrder ? thisOrder.status : 'Pending';
        var badgeCls = 'receipt-badge-pending';
        if (status === 'Confirmed') badgeCls = 'receipt-badge-confirmed';
        else if (status === 'Dispatched') badgeCls = 'receipt-badge-dispatched';
        else if (status === 'Delivered') badgeCls = 'receipt-badge-delivered';
        receiptStatusBadge.innerHTML = '<span class="receipt-status-badge ' + badgeCls + '">' + escapeHtml(status) + '</span>';
      }

      receiptBlock.hidden = false;
      if (btnPrintReceipt) btnPrintReceipt.hidden = false;
    }

    setTimeout(function () {
      cartItems = [];
      if (orderConfirmation) orderConfirmation.hidden = true;
      // Do NOT hide receipt-block or btn-print-receipt here — user needs time to print
      cartList.style.display = '';
      if (totalLine) totalLine.style.display = '';
      checkoutForm.reset();
      updateCartDisplay();
    }, 3000);
  });
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
