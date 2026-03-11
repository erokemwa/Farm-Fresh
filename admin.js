/* ===== Admin Dashboard JavaScript ===== */

/* ===== Helpers ===== */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch (e) { return []; }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function starsHtml(rating) {
  const n = Math.max(0, Math.min(5, parseInt(rating, 10) || 0));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/* ===== Seed Default Data ===== */
function seedData() {
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

/* ===== Auth ===== */
function isLoggedIn() {
  return localStorage.getItem('adminLoggedIn') === 'true';
}

function handleLogout() {
  localStorage.removeItem('adminLoggedIn');
  window.location.replace('admin-login.html');
}

/* ===== Tab Switching ===== */
function switchTab(tabId) {
  var tabTitles = { overview: 'Overview', orders: 'Orders', products: 'Products', farmers: 'Farmers', reviews: 'Reviews', shipping: 'Shipping', customers: 'Customers' };
  var titleEl = document.getElementById('topbar-section-title');
  if (titleEl) titleEl.textContent = tabTitles[tabId] || tabId;

  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });
  document.querySelectorAll('.admin-section').forEach(function (sec) {
    sec.classList.toggle('active', sec.id === 'tab-' + tabId);
  });

  if (tabId === 'overview') renderOverview();
  else if (tabId === 'orders') renderOrders();
  else if (tabId === 'products') renderProducts();
  else if (tabId === 'farmers') renderFarmers();
  else if (tabId === 'reviews') renderReviews();
  else if (tabId === 'shipping') renderShipping();
  else if (tabId === 'customers') renderCustomers();
}

/* ===== Overview Tab ===== */
function renderOverview() {
  var orders = getStore('ff_orders');
  var products = getStore('ff_products');
  var farmers = getStore('ff_farmers');
  var revenue = orders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);

  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-revenue').textContent = 'KES ' + revenue.toLocaleString();
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-farmers').textContent = farmers.length;

  var recent = orders.slice().sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; }).slice(0, 5);
  var tbody = document.getElementById('recent-orders-body');
  if (recent.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(function (o) {
    var itemsStr = o.items.map(function (i) { return escapeHtml(i.name) + ' x' + escapeHtml(String(i.quantity)); }).join(', ');
    return '<tr>' +
      '<td>' + escapeHtml(o.customer) + '</td>' +
      '<td>' + itemsStr + '</td>' +
      '<td>KES ' + escapeHtml(String(o.total)) + '</td>' +
      '<td>' + statusBadge(o.status) + '</td>' +
      '<td>' + escapeHtml(o.date) + '</td>' +
      '</tr>';
  }).join('');
}

function statusBadge(status) {
  var cls = 'badge-pending';
  if (status === 'Confirmed') cls = 'badge-confirmed';
  else if (status === 'Dispatched') cls = 'badge-dispatched';
  else if (status === 'Delivered') cls = 'badge-delivered';
  return '<span class="badge ' + cls + '">' + escapeHtml(status) + '</span>';
}

/* ===== Orders Tab ===== */
function renderOrders() {
  var orders = getStore('ff_orders');
  var tbody = document.getElementById('orders-body');
  if (orders.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No orders found.</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(function (o) {
    var itemsStr = o.items.map(function (i) {
      var farmerPart = i.farmerName ? ' <small style="color:#666;">(' + escapeHtml(i.farmerName) + ')</small>' : '';
      return escapeHtml(i.name) + farmerPart + ' x' + escapeHtml(String(i.quantity));
    }).join(', ');
    return '<tr>' +
      '<td>' + escapeHtml(o.id) + '</td>' +
      '<td>' + escapeHtml(o.customer) + '</td>' +
      '<td>' + escapeHtml(o.phone) + '</td>' +
      '<td>' + escapeHtml(o.address) + '</td>' +
      '<td>' + itemsStr + '</td>' +
      '<td>KES ' + escapeHtml(String(o.total)) + '</td>' +
      '<td>' + orderStatusSelect(o.id, o.status) + '</td>' +
      '<td>' + escapeHtml(o.date) + '</td>' +
      '<td><button class="btn-danger" onclick="deleteOrder(' + escapeHtml(JSON.stringify(o.id)) + ')">Delete</button></td>' +
      '</tr>';
  }).join('');
}

function orderStatusSelect(id, current) {
  var opts = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
  var safeId = escapeHtml(JSON.stringify(id));
  return '<select class="status-select" onchange="updateOrderStatus(' + safeId + ', this.value)">' +
    opts.map(function (s) {
      return '<option value="' + escapeHtml(s) + '"' + (s === current ? ' selected' : '') + '>' + escapeHtml(s) + '</option>';
    }).join('') +
    '</select>';
}

function updateOrderStatus(id, newStatus) {
  var orders = getStore('ff_orders');
  var order = orders.find(function (o) { return o.id === id; });
  if (order) {
    order.status = newStatus;
    setStore('ff_orders', orders);
    if (document.getElementById('tab-overview').classList.contains('active')) {
      renderOverview();
    }
  }
}

function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  var orders = getStore('ff_orders').filter(function (o) { return o.id !== id; });
  setStore('ff_orders', orders);
  renderOrders();
  if (document.getElementById('tab-overview').classList.contains('active')) {
    renderOverview();
  }
}

/* ===== Products Tab ===== */
var productEditId = null;

function renderProducts() {
  var products = getStore('ff_products');
  var tbody = document.getElementById('products-body');
  if (products.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No products yet.</td></tr>';
    return;
  }
  tbody.innerHTML = products.map(function (p) {
    var avail = p.available;
    var toggleCls = avail ? 'in-stock' : 'out-of-stock';
    var toggleLabel = avail ? 'In Stock' : 'Out of Stock';
    var safeId = escapeHtml(JSON.stringify(p.id));
    return '<tr>' +
      '<td>' + escapeHtml(p.name) + '</td>' +
      '<td>' + escapeHtml(p.farmer) + '</td>' +
      '<td>KES ' + escapeHtml(String(p.price)) + '</td>' +
      '<td>' + escapeHtml(p.category) + '</td>' +
      '<td>' + escapeHtml(p.unit) + '</td>' +
      '<td><button class="toggle-btn ' + toggleCls + '" onclick="toggleAvailability(' + safeId + ')">' + toggleLabel + '</button></td>' +
      '<td><div class="btn-actions">' +
        '<button class="btn-edit" onclick="openProductModal(' + safeId + ')">Edit</button>' +
        '<button class="btn-danger" onclick="deleteProduct(' + safeId + ')">Delete</button>' +
      '</div></td>' +
      '</tr>';
  }).join('');
}

function toggleAvailability(id) {
  var products = getStore('ff_products');
  var product = products.find(function (p) { return p.id === id; });
  if (product) {
    product.available = !product.available;
    setStore('ff_products', products);
    renderProducts();
  }
}

function openProductModal(id) {
  productEditId = id || null;
  var modal = document.getElementById('product-modal');
  var titleEl = document.getElementById('product-modal-title');
  var form = document.getElementById('product-form');
  form.reset();

  // Populate the farmer select dropdown
  var farmerSelect = document.getElementById('p-farmer-id');
  if (farmerSelect) {
    var farmers = getStore('ff_farmers');
    farmerSelect.innerHTML = '<option value="">— Select Farmer —</option>' +
      farmers.map(function (f) {
        return '<option value="' + escapeHtml(f.id) + '">' + escapeHtml(f.name) + '</option>';
      }).join('');
  }

  if (id) {
    var products = getStore('ff_products');
    var p = products.find(function (p) { return p.id === id; });
    if (p) {
      titleEl.textContent = 'Edit Product';
      form.elements['p-name'].value = p.name;
      if (farmerSelect) farmerSelect.value = p.farmerId || '';
      form.elements['p-price'].value = p.price;
      form.elements['p-original-price'].value = p.originalPrice || '';
      form.elements['p-category'].value = p.category;
      form.elements['p-unit'].value = p.unit;
    }
  } else {
    titleEl.textContent = 'Add Product';
  }
  modal.classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
  productEditId = null;
}

function saveProduct(e) {
  e.preventDefault();
  var form = document.getElementById('product-form');
  var name = form.elements['p-name'].value.trim();
  var farmerId = document.getElementById('p-farmer-id') ? document.getElementById('p-farmer-id').value : '';
  var price = parseFloat(form.elements['p-price'].value) || 0;
  var origPrice = parseFloat(form.elements['p-original-price'].value) || null;
  var category = form.elements['p-category'].value;
  var unit = form.elements['p-unit'].value.trim();

  // Resolve farmer display name from farmerId
  var farmers = getStore('ff_farmers');
  var farmerObj = farmers.find(function (f) { return f.id === farmerId; });
  var firstName = farmerObj ? farmerObj.name.split(' ')[0] : '';
  var farmerName = farmerObj ? firstName + "'s Farm" : (farmerId || '');

  var products = getStore('ff_products');
  if (!name || !farmerId || !price || !unit) {
    alert('Please fill in all required fields: Name, Farmer, Price, and Unit.');
    return;
  }
  if (productEditId) {
    var product = products.find(function (p) { return p.id === productEditId; });
    if (product) {
      product.name = name;
      product.farmerId = farmerId;
      product.farmer = farmerName;
      product.price = price;
      product.originalPrice = origPrice;
      product.category = category;
      product.unit = unit;
    }
  } else {
    products.push({ id: Date.now().toString(), name: name, farmerId: farmerId, farmer: farmerName, price: price, originalPrice: origPrice, category: category, unit: unit, available: true });
  }
  setStore('ff_products', products);
  closeProductModal();
  renderProducts();
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  var products = getStore('ff_products').filter(function (p) { return p.id !== id; });
  setStore('ff_products', products);
  renderProducts();
}

/* ===== Farmers Tab ===== */
var farmerEditId = null;

function renderFarmers() {
  var farmers = getStore('ff_farmers');
  var orders = getStore('ff_orders');
  var tbody = document.getElementById('farmers-body');
  if (farmers.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="9">No farmers yet.</td></tr>';
    return;
  }
  tbody.innerHTML = farmers.map(function (f) {
    var safeId = escapeHtml(JSON.stringify(f.id));
    // Compute revenue and order count for this farmer
    var farmerOrderCount = 0;
    var farmerRevenue = 0;
    orders.forEach(function (order) {
      var hasItem = false;
      order.items.forEach(function (item) {
        if (item.farmerId === f.id) {
          hasItem = true;
          farmerRevenue += item.subtotal || (item.price * item.quantity);
        }
      });
      if (hasItem) farmerOrderCount++;
    });
    var overallNum = (f.ratings && typeof f.ratings.overall === 'number') ? f.ratings.overall : 0;
    var overall = overallNum > 0 ? overallNum.toFixed(1) : '—';
    var reviews = f.totalReviews || 0;
    var badgesArr = Array.isArray(f.badges) ? f.badges : [];
    var badgesStr = badgesArr.length ? escapeHtml(badgesArr.join(', ')) : '—';
    return '<tr>' +
      '<td>' + escapeHtml(f.name) + '</td>' +
      '<td>' + escapeHtml(f.location) + '</td>' +
      '<td>' + escapeHtml(f.phone || '—') + '</td>' +
      '<td>' + escapeHtml(f.email || '—') + '</td>' +
      '<td>' +
        '<span class="badge badge-confirmed">' + farmerOrderCount + ' orders</span> ' +
        '<span class="badge badge-delivered">KES ' + farmerRevenue.toLocaleString() + '</span>' +
      '</td>' +
      '<td>' + escapeHtml(String(overall)) + '</td>' +
      '<td>' + escapeHtml(String(reviews)) + '</td>' +
      '<td><small>' + badgesStr + '</small></td>' +
      '<td><div class="btn-actions">' +
        '<button class="btn-edit" onclick="openFarmerModal(' + safeId + ')">Edit</button>' +
        '<button class="btn-danger" onclick="deleteFarmer(' + safeId + ')">Delete</button>' +
        '<button class="btn-secondary" style="font-size:0.75rem;padding:3px 8px;" onclick="resetFarmerRatings(' + safeId + ')">Reset Ratings</button>' +
      '</div></td>' +
      '</tr>';
  }).join('');
}

function openFarmerModal(id) {
  farmerEditId = id || null;
  var modal = document.getElementById('farmer-modal');
  var titleEl = document.getElementById('farmer-modal-title');
  var form = document.getElementById('farmer-form');
  form.reset();

  if (id) {
    var farmers = getStore('ff_farmers');
    var f = farmers.find(function (f) { return f.id === id; });
    if (f) {
      titleEl.textContent = 'Edit Farmer';
      form.elements['f-name'].value = f.name;
      form.elements['f-location'].value = f.location;
      form.elements['f-bio'].value = f.bio;
      if (form.elements['f-phone']) form.elements['f-phone'].value = f.phone || '';
      if (form.elements['f-email']) form.elements['f-email'].value = f.email || '';
      if (form.elements['f-badges']) {
        var badgesArr = Array.isArray(f.badges) ? f.badges : [];
        form.elements['f-badges'].value = badgesArr.join(', ');
      }
    }
  } else {
    titleEl.textContent = 'Add Farmer';
  }
  modal.classList.remove('hidden');
}

function closeFarmerModal() {
  document.getElementById('farmer-modal').classList.add('hidden');
  farmerEditId = null;
}

function saveFarmer(e) {
  e.preventDefault();
  var form = document.getElementById('farmer-form');
  var name = form.elements['f-name'].value.trim();
  var location = form.elements['f-location'].value.trim();
  var bio = form.elements['f-bio'].value.trim();
  var phone = form.elements['f-phone'] ? form.elements['f-phone'].value.trim() : '';
  var email = form.elements['f-email'] ? form.elements['f-email'].value.trim() : '';
  var badgesRaw = form.elements['f-badges'] ? form.elements['f-badges'].value.trim() : '';
  var badges = badgesRaw ? badgesRaw.split(',').map(function(b) { return b.trim(); }).filter(function(b) { return b; }) : [];

  var farmers = getStore('ff_farmers');
  if (!name || !location || !bio) {
    alert('Please fill in all required fields: Name, Location, and Bio.');
    return;
  }
  if (farmerEditId) {
    var farmer = farmers.find(function (f) { return f.id === farmerEditId; });
    if (farmer) {
      farmer.name = name;
      farmer.location = location;
      farmer.bio = bio;
      farmer.phone = phone;
      farmer.email = email;
      farmer.badges = badges;
      // Preserve existing ratings and totalReviews
    }
  } else {
    farmers.push({ id: 'f' + Date.now(), name: name, location: location, bio: bio, phone: phone, email: email, badges: badges, ratings: { overall: 0, freshness: 0, delivery: 0, packaging: 0, communication: 0, value: 0, consistency: 0 }, totalReviews: 0 });
  }
  setStore('ff_farmers', farmers);
  closeFarmerModal();
  renderFarmers();
}

function resetFarmerRatings(id) {
  if (!confirm('Reset all ratings for this farmer to zero?')) return;
  var farmers = getStore('ff_farmers');
  var farmer = farmers.find(function (f) { return f.id === id; });
  if (farmer) {
    farmer.ratings = { overall: 0, freshness: 0, delivery: 0, packaging: 0, communication: 0, value: 0, consistency: 0 };
    farmer.totalReviews = 0;
    setStore('ff_farmers', farmers);
    renderFarmers();
  }
}

function deleteFarmer(id) {
  if (!confirm('Delete this farmer?')) return;
  var farmers = getStore('ff_farmers').filter(function (f) { return f.id !== id; });
  setStore('ff_farmers', farmers);
  renderFarmers();
}

/* ===== Reviews Tab ===== */
function renderReviews() {
  var reviews = getStore('ff_reviews');
  var tbody = document.getElementById('reviews-body');
  if (reviews.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No reviews yet.</td></tr>';
    return;
  }
  tbody.innerHTML = reviews.map(function (r) {
    var isPending = r.status === 'Pending';
    var badgeCls = isPending ? 'badge-pending' : 'badge-approved';
    var safeId = escapeHtml(JSON.stringify(r.id));
    return '<tr>' +
      '<td>' + escapeHtml(r.name) + '</td>' +
      '<td><span class="stars">' + starsHtml(r.rating) + '</span> ' + escapeHtml(String(r.rating)) + '/5</td>' +
      '<td>' + escapeHtml(r.comment) + '</td>' +
      '<td><span class="badge ' + badgeCls + '">' + escapeHtml(r.status) + '</span></td>' +
      '<td><div class="btn-actions">' +
        (isPending ? '<button class="btn-approve" onclick="approveReview(' + safeId + ')">Approve</button>' : '') +
        '<button class="btn-danger" onclick="deleteReview(' + safeId + ')">Delete</button>' +
      '</div></td>' +
      '</tr>';
  }).join('');
}

function approveReview(id) {
  var reviews = getStore('ff_reviews');
  var review = reviews.find(function (r) { return r.id === id; });
  if (review) {
    review.status = 'Approved';
    setStore('ff_reviews', reviews);
    renderReviews();
  }
}

function deleteReview(id) {
  if (!confirm('Delete this review?')) return;
  var reviews = getStore('ff_reviews').filter(function (r) { return r.id !== id; });
  setStore('ff_reviews', reviews);
  renderReviews();
}

/* ===== Shipping Tab ===== */
function buildShippingSteps(currentStatus) {
  var steps = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
  var currentIdx = steps.indexOf(currentStatus);
  var html = '<div class="shipping-steps">';
  steps.forEach(function (step, i) {
    var done = i <= currentIdx;
    html += '<div class="shipping-step">' +
      '<div class="step-circle' + (done ? ' done' : '') + '">' + (i + 1) + '</div>' +
      '<div class="step-label' + (done ? ' done' : '') + '">' + escapeHtml(step) + '</div>' +
      '</div>';
    if (i < steps.length - 1) {
      html += '<div class="step-connector' + (done && currentIdx > i ? ' done' : '') + '"></div>';
    }
  });
  html += '</div>';
  return html;
}

function buildShippingCard(order) {
  // Group items by farmer
  var farmerGroups = {};
  order.items.forEach(function (item) {
    var key = item.farmerId || 'unknown';
    if (!farmerGroups[key]) {
      farmerGroups[key] = { farmerName: item.farmerName || item.name, items: [] };
    }
    farmerGroups[key].items.push(item);
  });

  var farmerGroupsHtml = Object.keys(farmerGroups).map(function (key) {
    var group = farmerGroups[key];
    var itemsStr = group.items.map(function (i) {
      var safeOrderId = escapeHtml(JSON.stringify(order.id));
      var safeItemName = escapeHtml(JSON.stringify(i.name));
      var opts = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
      var selectHtml = '<select class="status-select" style="padding:2px 4px;font-size:0.78rem;" onchange="updateItemStatus(' + safeOrderId + ',' + safeItemName + ',this.value)">' +
        opts.map(function (s) {
          return '<option value="' + escapeHtml(s) + '"' + (s === (i.itemStatus || order.status) ? ' selected' : '') + '>' + escapeHtml(s) + '</option>';
        }).join('') + '</select>';
      return '<li style="font-size:0.82rem;margin:2px 0;">' + escapeHtml(i.name) + ' \xD7' + escapeHtml(String(i.quantity)) + ' ' + selectHtml + '</li>';
    }).join('');
    return '<div style="margin:4px 0 8px;"><strong style="font-size:0.85rem;">👨‍🌾 ' + escapeHtml(group.farmerName) + '</strong><ul style="margin:2px 0;padding-left:16px;">' + itemsStr + '</ul></div>';
  }).join('');

  return '<div class="shipping-card">' +
    '<h4>' + escapeHtml(order.id) + '</h4>' +
    '<p class="shipping-customer">👤 ' + escapeHtml(order.customer) + '</p>' +
    buildShippingSteps(order.status) +
    farmerGroupsHtml +
    '<p style="font-size:0.82rem;color:#555;margin:4px 0 2px;">📍 ' + escapeHtml(order.address) + '</p>' +
    '<p style="font-size:0.82rem;color:#555;margin:2px 0 2px;">📞 ' + escapeHtml(order.phone) + '</p>' +
    '<p style="font-size:0.82rem;color:#555;margin:2px 0 2px;">📅 ' + escapeHtml(order.date) + '</p>' +
    '<p style="font-size:0.82rem;font-weight:700;color:#333;margin:2px 0 0;">Total: KES ' + escapeHtml(String(order.total)) + '</p>' +
    '</div>';
}

function renderShipping() {
  var orders = getStore('ff_orders');
  var farmers = getStore('ff_farmers');
  var statusFilter = document.getElementById('shipping-status-filter');
  var farmerFilter = document.getElementById('shipping-farmer-filter');

  // Build farmer list from ff_farmers using id as value
  if (farmerFilter) {
    var currentFarmerVal = farmerFilter.value;
    farmerFilter.innerHTML = '<option value="all">All Farmers</option>' +
      farmers.map(function (f) {
        return '<option value="' + escapeHtml(f.id) + '"' + (f.id === currentFarmerVal ? ' selected' : '') + '>' + escapeHtml(f.name) + '</option>';
      }).join('');
  }

  var selectedStatus = statusFilter ? statusFilter.value : 'all';
  var selectedFarmer = farmerFilter ? farmerFilter.value : 'all';

  // Filter orders
  var filtered = orders.filter(function (o) {
    var matchesStatus = selectedStatus === 'all' || o.status === selectedStatus;
    var matchesFarmer = selectedFarmer === 'all' || o.items.some(function (item) {
      return item.farmerId === selectedFarmer;
    });
    return matchesStatus && matchesFarmer;
  });

  // Render cards
  var cardsContainer = document.getElementById('shipping-cards-container');
  if (cardsContainer) {
    if (filtered.length === 0) {
      cardsContainer.innerHTML = '<p style="color:#777;font-style:italic;">No orders match the selected filters.</p>';
    } else {
      cardsContainer.innerHTML = filtered.map(buildShippingCard).join('');
    }
  }

  // Render report table
  var tbody = document.getElementById('shipping-report-tbody');
  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No orders found.</td></tr>';
    } else {
      tbody.innerHTML = filtered.map(function (o) {
        var itemsStr = o.items.map(function (i) {
          var farmerPart = i.farmerName ? ' (' + escapeHtml(i.farmerName) + ')' : '';
          return escapeHtml(i.name) + farmerPart + ' x' + escapeHtml(String(i.quantity));
        }).join(', ');
        var orderFarmerNames = o.items.map(function (item) {
          return item.farmerName || '—';
        }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(', ');
        var safeId = escapeHtml(JSON.stringify(o.id));
        var opts = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
        var selectHtml = '<select class="status-select" onchange="updateShippingStatus(' + safeId + ', this.value)">' +
          opts.map(function (s) {
            return '<option value="' + escapeHtml(s) + '"' + (s === o.status ? ' selected' : '') + '>' + escapeHtml(s) + '</option>';
          }).join('') + '</select>';
        return '<tr>' +
          '<td>' + escapeHtml(o.id) + '</td>' +
          '<td>' + escapeHtml(o.customer) + '</td>' +
          '<td>' + escapeHtml(orderFarmerNames) + '</td>' +
          '<td>' + itemsStr + '</td>' +
          '<td>KES ' + escapeHtml(String(o.total)) + '</td>' +
          '<td>' + statusBadge(o.status) + '</td>' +
          '<td>' + escapeHtml(o.date) + '</td>' +
          '<td>' + selectHtml + '</td>' +
          '</tr>';
      }).join('');
    }
  }
}

function updateShippingStatus(id, newStatus) {
  var orders = getStore('ff_orders');
  var order = orders.find(function (o) { return o.id === id; });
  if (order) {
    order.status = newStatus;
    setStore('ff_orders', orders);
    renderShipping();
    if (document.getElementById('tab-overview').classList.contains('active')) {
      renderOverview();
    }
  }
}

function updateItemStatus(orderId, itemName, newItemStatus) {
  var orders = getStore('ff_orders');
  var order = orders.find(function (o) { return o.id === orderId; });
  if (order) {
    var item = order.items.find(function (i) { return i.name === itemName; });
    if (item) {
      item.itemStatus = newItemStatus;
      // Update overall order status to worst/most-recent (least advanced)
      var statusRank = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
      var worstIdx = order.items.reduce(function (worst, i) {
        var idx = statusRank.indexOf(i.itemStatus || 'Pending');
        return idx < worst ? idx : worst;
      }, statusRank.length - 1);
      order.status = statusRank[worstIdx];
      setStore('ff_orders', orders);
      renderShipping();
    }
  }
}

/* ===== Customers Tab ===== */
function renderCustomers() {
  var users = getStore('ff_users');
  var orders = getStore('ff_orders');
  var tbody = document.getElementById('customers-body');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No customers yet.</td></tr>';
    return;
  }

  tbody.innerHTML = users.map(function (u) {
    var userOrders = orders.filter(function (o) { return o.customerId === u.id; });
    var totalSpend = userOrders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);
    var lastOrderDate = userOrders.length > 0
      ? userOrders.slice().sort(function (a, b) { return b.date > a.date ? -1 : 1; })[0].date
      : '—';
    return '<tr>' +
      '<td>' + escapeHtml(u.name) + '</td>' +
      '<td>' + escapeHtml(u.phone) + '</td>' +
      '<td>' + escapeHtml(u.address) + '</td>' +
      '<td>' + userOrders.length + '</td>' +
      '<td>KES ' + totalSpend.toLocaleString() + '</td>' +
      '<td>' + escapeHtml(lastOrderDate) + '</td>' +
      '</tr>';
  }).join('');
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', function () {
  // Auth guard — redirect to login if not authenticated
  if (!isLoggedIn()) {
    window.location.replace('admin-login.html');
    return;
  }

  seedData();
  renderOverview();

  /* Logout button */
  document.getElementById('btn-logout').addEventListener('click', handleLogout);

  /* Sidebar nav */
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      switchTab(link.dataset.tab);
    });
  });

  /* Product modal */
  document.getElementById('btn-add-product').addEventListener('click', function () {
    openProductModal(null);
  });
  document.getElementById('product-form').addEventListener('submit', saveProduct);
  document.getElementById('product-modal-close').addEventListener('click', closeProductModal);
  document.getElementById('product-modal-cancel').addEventListener('click', closeProductModal);
  document.getElementById('product-modal').addEventListener('click', function (e) {
    if (e.target === this) closeProductModal();
  });

  /* Farmer modal */
  document.getElementById('btn-add-farmer').addEventListener('click', function () {
    openFarmerModal(null);
  });
  document.getElementById('farmer-form').addEventListener('submit', saveFarmer);
  document.getElementById('farmer-modal-close').addEventListener('click', closeFarmerModal);
  document.getElementById('farmer-modal-cancel').addEventListener('click', closeFarmerModal);
  document.getElementById('farmer-modal').addEventListener('click', function (e) {
    if (e.target === this) closeFarmerModal();
  });

  /* Shipping filters */
  var shippingStatusFilter = document.getElementById('shipping-status-filter');
  var shippingFarmerFilter = document.getElementById('shipping-farmer-filter');
  if (shippingStatusFilter) shippingStatusFilter.addEventListener('change', renderShipping);
  if (shippingFarmerFilter) shippingFarmerFilter.addEventListener('change', renderShipping);
});
