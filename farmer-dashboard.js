/* ===== Farmer Dashboard JavaScript ===== */

/* ===== Utility Helpers ===== */
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

function formatKES(amount) {
  return 'KES ' + Number(amount).toFixed(2);
}

/* ===== Status Badge ===== */
function statusBadge(status) {
  var cls = 'badge-pending';
  if (status === 'Confirmed') cls = 'badge-confirmed';
  else if (status === 'Dispatched') cls = 'badge-dispatched';
  else if (status === 'Delivered') cls = 'badge-delivered';
  return '<span class="badge ' + cls + '">' + escapeHtml(status) + '</span>';
}

/* ===== Shipping Steps Builder ===== */
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

/* ===== Session Helpers ===== */
function getSession() {
  return localStorage.getItem('ff_farmer_session');
}

function getFarmer() {
  var sessionId = getSession();
  if (!sessionId) return null;
  var farmers = getStore('ff_farmers');
  return farmers.find(function (f) { return f.id === sessionId; }) || null;
}

function getMyProducts(farmerId) {
  var products = getStore('ff_products');
  return products.filter(function (p) { return p.farmerId === farmerId || p.farmer === farmerId; });
}

function getMyOrders(farmerId) {
  var orders = getStore('ff_orders');
  return orders.filter(function (o) {
    return o.items.some(function (item) { return item.farmerId === farmerId; });
  });
}

function getMyItemsInOrder(order, farmerId) {
  return order.items.filter(function (item) { return item.farmerId === farmerId; });
}

/* ===== Tab Switching ===== */
var TAB_TITLES = {
  overview: 'Overview',
  products: 'My Products',
  orders: 'My Orders',
  shipping: 'Shipping',
  earnings: 'Earnings'
};

function switchTab(tabId) {
  var titleEl = document.getElementById('topbar-section-title');
  if (titleEl) titleEl.textContent = TAB_TITLES[tabId] || tabId;

  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });
  document.querySelectorAll('.admin-section').forEach(function (sec) {
    sec.classList.toggle('active', sec.id === 'tab-' + tabId);
  });

  var farmer = getFarmer();
  if (!farmer) return;

  if (tabId === 'overview') renderOverview(farmer);
  else if (tabId === 'products') renderMyProducts(farmer);
  else if (tabId === 'orders') renderMyOrders(farmer);
  else if (tabId === 'shipping') renderShipping(farmer);
  else if (tabId === 'earnings') renderEarnings(farmer);
}

/* ===== Overview Tab ===== */
function renderOverview(farmer) {
  var myProducts = getMyProducts(farmer.id);
  var myOrders = getMyOrders(farmer.id);

  var activeOrders = myOrders.filter(function (o) { return o.status !== 'Delivered'; });
  var deliveredOrders = myOrders.filter(function (o) { return o.status === 'Delivered'; });

  var totalEarnings = deliveredOrders.reduce(function (sum, o) {
    var myItems = getMyItemsInOrder(o, farmer.id);
    return sum + myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
  }, 0);

  var statEl = function (id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  statEl('stat-my-products', myProducts.length);
  statEl('stat-active-orders', activeOrders.length);
  statEl('stat-delivered', deliveredOrders.length);
  statEl('stat-earnings', totalEarnings.toFixed(2));

  // Recent 5 orders
  var recent = myOrders.slice().sort(function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : 0; }).slice(0, 5);
  var tbody = document.getElementById('recent-activity-body');
  if (!tbody) return;
  if (recent.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="6">No orders yet.</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map(function (o) {
    var myItems = getMyItemsInOrder(o, farmer.id);
    var itemsStr = myItems.map(function (i) { return escapeHtml(i.name) + ' x' + escapeHtml(String(i.quantity)); }).join(', ');
    var subtotal = myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
    return '<tr>' +
      '<td>' + escapeHtml(o.id) + '</td>' +
      '<td>' + escapeHtml(o.customer) + '</td>' +
      '<td>' + itemsStr + '</td>' +
      '<td>' + formatKES(subtotal) + '</td>' +
      '<td>' + statusBadge(o.status) + '</td>' +
      '<td>' + escapeHtml(o.date) + '</td>' +
      '</tr>';
  }).join('');
}

/* ===== My Products Tab ===== */
var editingProductId = null;

function renderMyProducts(farmer) {
  var myProducts = getMyProducts(farmer.id);
  var tbody = document.getElementById('my-products-body');
  if (!tbody) return;

  if (myProducts.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No products yet. Click "+ Add Product" to add one.</td></tr>';
    return;
  }

  tbody.innerHTML = myProducts.map(function (p) {
    var avail = p.available !== false;
    var safeId = escapeHtml(JSON.stringify(p.id));
    return '<tr id="product-row-' + escapeHtml(p.id) + '">' +
      '<td>' + escapeHtml(p.name) + '</td>' +
      '<td>' + escapeHtml(p.category) + '</td>' +
      '<td>' + escapeHtml(p.unit) + '</td>' +
      '<td>KES ' + escapeHtml(String(p.price)) + '</td>' +
      '<td>' + (p.originalPrice ? 'KES ' + escapeHtml(String(p.originalPrice)) : '—') + '</td>' +
      '<td><span class="badge ' + (avail ? 'badge-in-stock' : 'badge-out-of-stock') + '">' + (avail ? 'Yes' : 'No') + '</span></td>' +
      '<td><div class="btn-actions">' +
        '<button class="btn-edit" onclick="openEditProduct(' + safeId + ')">Edit</button>' +
        '<button class="btn-primary" style="padding:6px 12px;font-size:0.82rem;" onclick="toggleMyProduct(' + safeId + ')">Toggle Avail.</button>' +
      '</div></td>' +
      '</tr>';
  }).join('');
}

function openEditProduct(id) {
  editingProductId = id;
  var products = getStore('ff_products');
  var p = products.find(function (p) { return p.id === id; });
  if (!p) return;

  var row = document.getElementById('product-row-' + id);
  if (!row) return;

  row.innerHTML =
    '<td colspan="7" class="edit-row-form" style="background:var(--green-light);padding:12px;">' +
      '<form onsubmit="saveEditProduct(event,' + escapeHtml(JSON.stringify(id)) + ')" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">' +
        '<label style="font-size:0.82rem;font-weight:600;">Price: <input type="number" id="edit-price-' + escapeHtml(id) + '" value="' + escapeHtml(String(p.price)) + '" min="0" step="1" required></label>' +
        '<label style="font-size:0.82rem;font-weight:600;">Unit: <input type="text" id="edit-unit-' + escapeHtml(id) + '" value="' + escapeHtml(p.unit) + '" required></label>' +
        '<label style="font-size:0.82rem;font-weight:600;display:flex;align-items:center;gap:4px;"><input type="checkbox" id="edit-avail-' + escapeHtml(id) + '"' + (p.available !== false ? ' checked' : '') + '> Available</label>' +
        '<button type="submit" class="btn-save-edit">Save</button>' +
        '<button type="button" class="btn-cancel-edit" onclick="cancelEditProduct()">Cancel</button>' +
      '</form>' +
    '</td>';
}

function saveEditProduct(e, id) {
  e.preventDefault();
  var products = getStore('ff_products');
  var p = products.find(function (p) { return p.id === id; });
  if (!p) return;

  var priceInput = document.getElementById('edit-price-' + id);
  var unitInput = document.getElementById('edit-unit-' + id);
  var availInput = document.getElementById('edit-avail-' + id);

  if (priceInput) p.price = parseFloat(priceInput.value) || p.price;
  if (unitInput) p.unit = unitInput.value.trim() || p.unit;
  if (availInput) p.available = availInput.checked;

  setStore('ff_products', products);
  editingProductId = null;
  var farmer = getFarmer();
  if (farmer) renderMyProducts(farmer);
}

function cancelEditProduct() {
  editingProductId = null;
  var farmer = getFarmer();
  if (farmer) renderMyProducts(farmer);
}

function toggleMyProduct(id) {
  var products = getStore('ff_products');
  var p = products.find(function (p) { return p.id === id; });
  if (p) {
    p.available = !p.available;
    setStore('ff_products', products);
    var farmer = getFarmer();
    if (farmer) renderMyProducts(farmer);
  }
}

/* ===== My Orders Tab ===== */
function renderMyOrders(farmer) {
  var myOrders = getMyOrders(farmer.id);
  var statusFilter = document.getElementById('orders-status-filter');
  var selectedStatus = statusFilter ? statusFilter.value : 'all';

  var filtered = selectedStatus === 'all' ? myOrders : myOrders.filter(function (o) { return o.status === selectedStatus; });

  var tbody = document.getElementById('my-orders-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="8">No orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(function (o) {
    var myItems = getMyItemsInOrder(o, farmer.id);
    var itemsStr = myItems.map(function (i) { return escapeHtml(i.name) + ' x' + escapeHtml(String(i.quantity)); }).join(', ');
    var subtotal = myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
    return '<tr>' +
      '<td>' + escapeHtml(o.id) + '</td>' +
      '<td>' + escapeHtml(o.customer) + '</td>' +
      '<td>' + escapeHtml(o.phone) + '</td>' +
      '<td>' + escapeHtml(o.address) + '</td>' +
      '<td>' + itemsStr + '</td>' +
      '<td>' + formatKES(subtotal) + '</td>' +
      '<td>' + statusBadge(o.status) + '</td>' +
      '<td>' + escapeHtml(o.date) + '</td>' +
      '</tr>';
  }).join('');
}

/* ===== Shipping Tab ===== */
function renderShipping(farmer) {
  var myOrders = getMyOrders(farmer.id);
  var activeOrders = myOrders.filter(function (o) { return o.status !== 'Delivered'; });

  var container = document.getElementById('farmer-shipping-cards');
  if (!container) return;

  if (activeOrders.length === 0) {
    container.innerHTML = '<p style="color:#777;font-style:italic;">No active shipments right now. All orders have been delivered!</p>';
    return;
  }

  container.innerHTML = activeOrders.map(function (o) {
    var myItems = getMyItemsInOrder(o, farmer.id);
    var subtotal = myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
    var itemsHtml = myItems.map(function (i) {
      var safeOrderId = escapeHtml(JSON.stringify(o.id));
      var safeItemName = escapeHtml(JSON.stringify(i.name));
      var currentItemStatus = i.itemStatus || o.status;
      var opts = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
      var selectHtml = '<select class="status-select" style="padding:2px 4px;font-size:0.78rem;" onchange="updateMyItemStatus(' + safeOrderId + ',' + safeItemName + ',this.value)">' +
        opts.map(function (s) {
          return '<option value="' + escapeHtml(s) + '"' + (s === currentItemStatus ? ' selected' : '') + '>' + escapeHtml(s) + '</option>';
        }).join('') + '</select>';
      return '<li style="font-size:0.82rem;margin:2px 0;">' + escapeHtml(i.name) + ' \xD7' + escapeHtml(String(i.quantity)) + ' ' + selectHtml + '</li>';
    }).join('');
    return '<div class="shipping-card">' +
      '<h4>' + escapeHtml(o.id) + '</h4>' +
      '<p class="shipping-customer">👤 ' + escapeHtml(o.customer) + '</p>' +
      buildShippingSteps(o.status) +
      '<p style="font-size:0.82rem;color:#555;margin:4px 0 2px;">📍 ' + escapeHtml(o.address) + '</p>' +
      '<p style="font-size:0.82rem;color:#555;margin:2px 0 2px;">📞 ' + escapeHtml(o.phone) + '</p>' +
      '<p style="font-size:0.82rem;color:#555;margin:2px 0 2px;">📅 ' + escapeHtml(o.date) + '</p>' +
      '<p style="font-size:0.82rem;margin:4px 0 2px;"><strong>My items:</strong></p>' +
      '<ul style="margin:2px 0 4px;padding-left:16px;">' + itemsHtml + '</ul>' +
      '<p style="font-size:0.82rem;font-weight:700;color:#333;margin:2px 0 0;">Subtotal: ' + formatKES(subtotal) + '</p>' +
      '</div>';
  }).join('');
}

function updateMyItemStatus(orderId, itemName, newItemStatus) {
  var orders = getStore('ff_orders');
  var order = orders.find(function (o) { return o.id === orderId; });
  if (order) {
    var item = order.items.find(function (i) { return i.name === itemName; });
    if (item) {
      item.itemStatus = newItemStatus;
      // Update overall order status to worst (least advanced)
      var statusRank = ['Pending', 'Confirmed', 'Dispatched', 'Delivered'];
      var worstIdx = order.items.reduce(function (worst, i) {
        var idx = statusRank.indexOf(i.itemStatus || 'Pending');
        return idx < worst ? idx : worst;
      }, statusRank.length - 1);
      order.status = statusRank[worstIdx];
      setStore('ff_orders', orders);
      var farmer = getFarmer();
      if (farmer) renderShipping(farmer);
    }
  }
}

/* ===== Earnings Tab ===== */
function renderEarnings(farmer) {
  var myOrders = getMyOrders(farmer.id);

  var calcRevenue = function (orders) {
    return orders.reduce(function (sum, o) {
      var myItems = getMyItemsInOrder(o, farmer.id);
      return sum + myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
    }, 0);
  };

  var totalRevenue = calcRevenue(myOrders);
  var confirmedRevenue = calcRevenue(myOrders.filter(function (o) { return o.status !== 'Pending'; }));
  var deliveredRevenue = calcRevenue(myOrders.filter(function (o) { return o.status === 'Delivered'; }));

  var setVal = function (id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setVal('earn-total-revenue', formatKES(totalRevenue));
  setVal('earn-confirmed-revenue', formatKES(confirmedRevenue));
  setVal('earn-delivered-revenue', formatKES(deliveredRevenue));

  // Delivered orders table
  var deliveredOrders = myOrders.filter(function (o) { return o.status === 'Delivered'; });
  var tbody = document.getElementById('delivered-orders-body');
  if (tbody) {
    if (deliveredOrders.length === 0) {
      tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No delivered orders yet.</td></tr>';
    } else {
      tbody.innerHTML = deliveredOrders.map(function (o) {
        var myItems = getMyItemsInOrder(o, farmer.id);
        var itemsStr = myItems.map(function (i) { return escapeHtml(i.name) + ' x' + escapeHtml(String(i.quantity)); }).join(', ');
        var subtotal = myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
        return '<tr>' +
          '<td>' + escapeHtml(o.id) + '</td>' +
          '<td>' + itemsStr + '</td>' +
          '<td>' + formatKES(subtotal) + '</td>' +
          '<td>' + escapeHtml(o.date) + '</td>' +
          '</tr>';
      }).join('');
    }
  }

  // Monthly Breakdown bar chart
  var monthlyMap = {};
  deliveredOrders.forEach(function (o) {
    var month = (o.date && o.date.length >= 7) ? o.date.slice(0, 7) : 'Unknown';
    var myItems = getMyItemsInOrder(o, farmer.id);
    var subtotal = myItems.reduce(function (s, i) { return s + (i.subtotal || i.price * i.quantity); }, 0);
    monthlyMap[month] = (monthlyMap[month] || 0) + subtotal;
  });

  var months = Object.keys(monthlyMap).sort();
  var maxVal = months.reduce(function (m, k) { return Math.max(m, monthlyMap[k]); }, 1);

  var chartEl = document.getElementById('monthly-chart');
  if (chartEl) {
    if (months.length === 0) {
      chartEl.innerHTML = '<p style="color:#777;font-style:italic;">No data yet.</p>';
    } else {
      chartEl.innerHTML = months.map(function (month) {
        var val = monthlyMap[month];
        var pct = Math.round((val / maxVal) * 100);
        return '<div class="month-bar-row">' +
          '<span class="month-bar-label">' + escapeHtml(month) + '</span>' +
          '<div class="month-bar-track"><div class="month-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="month-bar-value">KES ' + val.toFixed(2) + '</span>' +
          '</div>';
      }).join('');
    }
  }
}

/* ===== Add Product Form ===== */
function initAddProductForm(farmer) {
  var btnAdd = document.getElementById('btn-add-my-product');
  var formWrapper = document.getElementById('add-product-form-wrapper');
  var form = document.getElementById('add-product-form');
  var btnCancel = document.getElementById('btn-cancel-add-product');

  if (btnAdd && formWrapper) {
    btnAdd.addEventListener('click', function () {
      formWrapper.style.display = formWrapper.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (btnCancel && formWrapper) {
    btnCancel.addEventListener('click', function () {
      formWrapper.style.display = 'none';
      if (form) form.reset();
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('np-name').value.trim();
      var category = document.getElementById('np-category').value;
      var unit = document.getElementById('np-unit').value.trim();
      var price = parseFloat(document.getElementById('np-price').value) || 0;
      var origPrice = parseFloat(document.getElementById('np-orig-price').value) || null;

      if (!name || !unit || !price) {
        alert('Please fill in all required fields.');
        return;
      }

      var products = getStore('ff_products');
      products.push({
        id: 'p' + Date.now(),
        name: name,
        farmerId: farmer.id,
        farmer: farmer.name,
        price: price,
        originalPrice: origPrice,
        category: category,
        unit: unit,
        available: true
      });
      setStore('ff_products', products);
      form.reset();
      if (formWrapper) formWrapper.style.display = 'none';
      renderMyProducts(farmer);
    });
  }
}

/* ===== Login Overlay ===== */
function showLoginOverlay() {
  var overlay = document.getElementById('farmer-login-overlay');
  if (overlay) overlay.classList.remove('hidden');

  var farmers = getStore('ff_farmers');
  var select = document.getElementById('farmer-select');
  if (select && farmers.length > 0) {
    select.innerHTML = farmers.map(function (f) {
      return '<option value="' + escapeHtml(f.id) + '">' + escapeHtml(f.name) + '</option>';
    }).join('');
  } else if (select) {
    select.innerHTML = '<option value="">No farmers found</option>';
  }
}

function hideLoginOverlay() {
  var overlay = document.getElementById('farmer-login-overlay');
  if (overlay) overlay.classList.add('hidden');
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', function () {
  var sessionId = getSession();

  if (!sessionId) {
    showLoginOverlay();

    var btnContinue = document.getElementById('btn-farmer-continue');
    if (btnContinue) {
      btnContinue.addEventListener('click', function () {
        var select = document.getElementById('farmer-select');
        if (!select || !select.value) {
          alert('Please select a farmer to continue.');
          return;
        }
        localStorage.setItem('ff_farmer_session', select.value);
        hideLoginOverlay();
        initDashboard();
      });
    }
  } else {
    initDashboard();
  }

  /* Logout */
  var btnLogout = document.getElementById('btn-farmer-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', function () {
      localStorage.removeItem('ff_farmer_session');
      window.location.reload();
    });
  }

  /* Sidebar nav */
  document.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      switchTab(link.dataset.tab);
    });
  });

  /* Orders status filter */
  var ordersFilter = document.getElementById('orders-status-filter');
  if (ordersFilter) {
    ordersFilter.addEventListener('change', function () {
      var farmer = getFarmer();
      if (farmer) renderMyOrders(farmer);
    });
  }
});

function initDashboard() {
  var farmer = getFarmer();
  if (!farmer) {
    showLoginOverlay();
    return;
  }

  var nameEl = document.getElementById('topbar-farmer-name');
  if (nameEl) nameEl.textContent = '👤 ' + farmer.name;

  initAddProductForm(farmer);
  renderOverview(farmer);
}
