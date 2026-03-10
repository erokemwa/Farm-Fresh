// Get all the "add to cart" buttons
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Get the cart section and its child elements
const cart = document.querySelector('.cart');
const cartList = cart.querySelector('ul');
const cartTotal = cart.querySelector('.total');
const checkoutButton = cart.querySelector('.checkout');
const cartCountBadge = document.getElementById('cart-count');
const orderConfirmation = document.getElementById('order-confirmation');
const checkoutFormWrapper = document.getElementById('checkout-form-wrapper');
const checkoutForm = document.getElementById('checkout-form');

// Initialize an empty cart array to hold the added products
let cartItems = [];

// Hide checkout button on page load
// Hide the checkout button on page load since the cart starts empty
checkoutButton.style.display = 'none';

// Add event listeners to all "add to cart" buttons
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = parseFloat(button.dataset.price);
    // Read quantity from the qty-input in the same product <li>
    const productLi = button.closest('li');
    const qtyInput = productLi ? productLi.querySelector('.qty-input') : null;
    const quantity = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;

    // Check if item already exists in cart — if so, increase quantity
    const existing = cartItems.find(item => item.name === name);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cartItems.push({ name, price, quantity });
    }

    updateCartDisplay();
  });
});

function updateCartDisplay() {
  cartList.innerHTML = '';

  if (cartItems.length === 0) {
    const emptyMsg = document.createElement('li');
    emptyMsg.className = 'empty-cart-msg';
    emptyMsg.textContent = 'Your cart is empty.';
    cartList.appendChild(emptyMsg);
    checkoutButton.style.display = 'none';
    cartTotal.textContent = '0.00';
    if (cartCountBadge) cartCountBadge.textContent = '0';
    return;
  }

  cartItems.forEach(item => {
    const listItem = document.createElement('li');

    const textSpan = document.createElement('span');
    textSpan.textContent = `${item.name} x${item.quantity} - ${formatKES(item.price * item.quantity)}`;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.className = 'remove-btn';
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Remove ${item.name} from cart`);
    const itemName = item.name;
    removeBtn.addEventListener('click', () => {
      cartItems = cartItems.filter(i => i.name !== itemName);
      updateCartDisplay();
    });

    listItem.appendChild(textSpan);
    listItem.appendChild(removeBtn);
    cartList.appendChild(listItem);
  });

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  cartTotal.textContent = total.toFixed(2);

  const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  if (cartCountBadge) {
    cartCountBadge.textContent = totalQty;
  }

  checkoutButton.style.display = cartItems.length === 0 ? 'none' : 'block';
}

// Add event listener to the checkout button — show payment form
checkoutButton.addEventListener('click', () => {
  if (checkoutFormWrapper) {
    checkoutFormWrapper.hidden = false;
  }
});

// Handle checkout form submission
if (checkoutForm) {
  checkoutForm.addEventListener('submit', event => {
    event.preventDefault();
    // Show inline order confirmation
    if (orderConfirmation) {
      orderConfirmation.hidden = false;
    }
    if (checkoutFormWrapper) {
      checkoutFormWrapper.hidden = true;
    }
    // Hide cart list and total line during confirmation
    cartList.style.display = 'none';
    const totalLine = cart.querySelector('.cart-total-line');
    if (totalLine) totalLine.style.display = 'none';
    checkoutButton.style.display = 'none';

    // Reset after 3 seconds
    setTimeout(() => {
      cartItems = [];
      if (orderConfirmation) orderConfirmation.hidden = true;
      cartList.style.display = '';
      if (totalLine) totalLine.style.display = '';
      checkoutForm.reset();
      updateCartDisplay();
    }, 3000);
  });
}

// ===== Search Functionality =====
const searchInput = document.getElementById('product-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    const productItems = document.querySelectorAll('.product-list ul li');
    productItems.forEach(li => {
      const name = (li.dataset.name || '').toLowerCase();
      const farmer = (li.dataset.farmer || '').toLowerCase();
      const availability = (li.dataset.availability || '').toLowerCase();
      if (!query || name.includes(query) || farmer.includes(query) || availability.includes(query)) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });
  });
}

// ===== Review Form Submission =====
const reviewForm = document.getElementById('review-form');
if (reviewForm) {
  reviewForm.addEventListener('submit', event => {
    event.preventDefault();
    const nameInput = document.getElementById('review-name');
    const ratingInput = reviewForm.querySelector('input[name="rating"]:checked');
    const commentInput = document.getElementById('review-comment');

    const reviewerName = nameInput ? nameInput.value.trim() : '';
    const rating = ratingInput ? parseInt(ratingInput.value, 10) : 0;
    const comment = commentInput ? commentInput.value.trim() : '';

    if (!reviewerName || !rating || !comment) return;

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const ariaLabel = `${rating} out of 5 stars`;

    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
      <strong>${escapeHtml(reviewerName)}</strong>
      <div class="rating" aria-label="${ariaLabel}">${stars}</div>
      <p>"${escapeHtml(comment)}"</p>
    `;

    const reviewsList = document.querySelector('.reviews-list');
    if (reviewsList) {
      reviewsList.prepend(card);
    }

    reviewForm.reset();
  });
}

// Format a price value as a KES currency string
function formatKES(amount) {
  return `KES ${amount.toFixed(2)}`;
}

// Minimal HTML escape to prevent XSS in dynamically created review cards
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
