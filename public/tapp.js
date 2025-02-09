// public/tapp.js
console.log("JavaScript is linked and running!");

// ========== CART DATA ==========
let cart = [];
const classes = [
  { id: 0, name: "Old-Time Morning Fiddle Groove", price: 25 },
  { id: 1, name: "Twin Fiddles", price: 25 },
  { id: 2, name: "Swing Time", price: 25 },
  { id: 3, name: "Bluegrass Instrumentals: The Classics", price: 25 },
  { id: 4, name: "Bluegrass Jam", price: 35 },
];

// ========== SELECT DOM ELEMENTS ==========
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");

const addButtons = document.querySelectorAll(".class-card button");
addButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    toggleCartItem(index, button);
  });
});

if (checkoutButton) {
  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty! Please add at least one class.");
    } else {
      alert("Checkout functionality is not implemented yet!");
    }
  });
}

function toggleCartItem(index, button) {
  const itemInCart = cart.find(item => item.id === classes[index].id);
  if (itemInCart) {
    cart = cart.filter(item => item.id !== classes[index].id);
    button.classList.remove("selected");
    button.textContent = "Select";
  } else {
    cart.push(classes[index]);
    button.classList.add("selected");
    button.textContent = "Remove from Cart";
  }
  updateCart();
}

function updateCart() {
  if (!cartItems || !cartTotal) return;
  cartItems.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - $${item.price}`;
    cartItems.appendChild(li);
    total += item.price;
  });
  if (cart.length >= 4) {
    total = cart.reduce((sum, item) => sum + (item.price === 35 ? 30 : 20), 0);
    cartTotal.textContent = `Total (Discount Applied): $${total}`;
  } else {
    cartTotal.textContent = `Total: $${total}`;
  }
}