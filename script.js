// Get all the "add to cart" buttons
const addToCartButtons = document.querySelectorAll('.add-to-cart');

// Get the cart section and its child elements
const cart = document.querySelector('.cart');
const cartList = cart.querySelector('ul');
const cartTotal = cart.querySelector('.total');
const checkoutButton = cart.querySelector('.checkout');

// Initialize an empty cart array to hold the added products
let cartItems = [];

// Hide the checkout button on page load since the cart starts empty
checkoutButton.style.display = 'none';

// Add event listeners to all "add to cart" buttons
addToCartButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Get the product information from the button's data attributes
    const name = button.dataset.name;
    const price = button.dataset.price;

    // Add the product to the cart array
    cartItems.push({ name, price });

    // Update the cart display
    updateCartDisplay();
  });
});

function updateCartDisplay() {
  // Clear the cart list
  cartList.innerHTML = '';

  if (cartItems.length === 0) {
    // Show the empty cart message
    const emptyMsg = document.createElement('li');
    emptyMsg.className = 'empty-cart-msg';
    emptyMsg.textContent = 'Your cart is empty.';
    cartList.appendChild(emptyMsg);
    checkoutButton.style.display = 'none';
    cartTotal.textContent = '0.00';
    return;
  }

  // Add each cart item to the cart list
  cartItems.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.name} - KES ${item.price}`;
    cartList.appendChild(listItem);
  });

  // Calculate the total price of all items in the cart
  const total = cartItems.reduce((acc, item) => acc + parseFloat(item.price), 0);

  // Update the total price display
  cartTotal.textContent = total.toFixed(2);

  // Show the checkout button
  checkoutButton.style.display = 'block';
}

// Add event listener to the checkout button
checkoutButton.addEventListener('click', () => {
  alert(`Total: KES${cartTotal.textContent}`);
  // Reset the cart items array and update the cart display
  cartItems = [];
  updateCartDisplay();
});
