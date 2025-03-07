const API_BASE_URL = "https://1vdvb9orb2.execute-api.us-east-1.amazonaws.com/prod";
 // Replace with actual API Gateway URL

let cart = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await fetchCart();
    await fetchProducts();
    updateCartCount();
});

// Fetch cart from DynamoDB
async function fetchCart() {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/123`); // Replace "123" with actual user ID
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        cart = await response.json();
        updateCart();
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}

// Fetch products from API Gateway
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Render products dynamically
function renderProducts(products) {
    const productGrid = document.getElementById('product-grid');
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" onclick="addToCart('${product.productId}', '${product.name}', ${product.price}, '${product.imageUrl}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add to cart and update DynamoDB
async function addToCart(productId, name, price, imageUrl) {
    const existingItem = cart.find(item => item.productId === productId);
    let quantity = existingItem ? existingItem.quantity + 1 : 1;

    await updateCartInDB(productId, name, price, imageUrl, quantity);
}

// Update cart item quantity
async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        cart = cart.filter(item => item.productId !== productId);
    } else {
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    
    const item = cart.find(item => item.productId === productId);
    await updateCartInDB(productId, item?.name || "", item?.price || 0, item?.image || "", newQuantity);
}

// Send cart updates to DynamoDB via API Gateway
async function updateCartInDB(productId, name, price, imageUrl, quantity) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
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
        
        // Refresh cart after updating
        await fetchCart();
    } catch (error) {
        console.error("Error updating cart in DB:", error);
    }
}

// Update cart UI
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imageUrl}" alt="${item.productName}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.productName}</h4>
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

// Update cart count badge
function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Toggle cart sidebar visibility
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

// Proceed to checkout - Send data to AWS Lambda
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

    setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const products = await response.json();

            const filteredProducts = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm)
            );

            const productGrid = document.getElementById('product-grid');
            if (filteredProducts.length === 0) {
                productGrid.innerHTML = '<p class="no-results">No products found</p>';
            } else {
                renderProducts(filteredProducts);
            }
        } catch (error) {
            console.error("Error searching products:", error);
        }
    }, 300);
});
