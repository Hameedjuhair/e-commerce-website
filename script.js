const API_BASE_URL = "https://pe8wxvomy6.execute-api.us-east-1.amazonaws.com/prod/cart"; // Replace with your actual API Gateway URL

let cart = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCart();
    renderProducts();
    updateCartCount();
});

// Fetch cart from DynamoDB
async function fetchCart() {
    try {
        const response = await fetch(`${API_BASE_URL}/123`); // Replace "123" with actual user ID
        const data = await response.json();
        cart = data;
        updateCart();
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}

// Render products
function renderProducts() {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add to cart (and update DynamoDB)
async function addToCart(productId, name, price, image) {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ productId, name, price, image, quantity: 1 });
    }

    await updateCartInDB();
    updateCart();
    toggleCart(); // Show cart when item is added
}

// Remove item from cart (DynamoDB)
async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        cart = cart.filter(item => item.productId !== productId);
    } else {
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }

    await updateCartInDB();
    updateCart();
}

async function updateCartInDB(productId, name, price, imageUrl, quantity) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "123", // 🔹 Replace with actual user ID if available
                productId,
                productName: name,
                quantity,
                price,
                imageUrl
            }),
        });

        const result = await response.json();
        console.log("Cart update response:", result);
        
        // Re-fetch cart to update UI
        await fetchCart();
    } catch (error) {
        console.error("Error updating cart in DB:", error);
    }
}

// Update cart UI
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Render cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                </div>
            </div>
        </div>
    `).join('');

    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;

    updateCartCount();
}

// Update cart count
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    alert('Proceeding to checkout...');
    // Add checkout logic here
}

// Search functionality
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );
    
    const productGrid = document.getElementById('product-grid');
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = '<p class="no-results">No products found</p>';
    } else {
        renderProducts(filteredProducts);
    }
});
