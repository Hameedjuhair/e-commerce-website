async function fetchProducts() {
    try {
        const response = await fetch("https://1vdvb9orb2.execute-api.us-east-1.amazonaws.com/prod/products"); // Replace with your API Gateway URL
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const products = await response.json();
        console.log("Fetched products:", products); // Debugging: Check API response

        // Display products dynamically
        displayProducts(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// Function to render products dynamically
function displayProducts(products) {
    const productContainer = document.getElementById("product-grid"); // Ensure this ID exists in your HTML
    productContainer.innerHTML = ""; // Clear existing content

    products.forEach(product => {
        const productCard = `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart('${product.productId}', '${product.name}', ${product.price}, '${product.image}')">
                    Add to Cart
                </button>
            </div>
        `;
        productContainer.innerHTML += productCard;
    });
}

// Call the function to load products on page load
fetchProducts();
const products = [
    {
        id: '1',
        name: 'Premium Wireless Headphones',
        price: 299.99,
        image: 'images/headphone.png'
    },
    {
        id: '2',
        name: 'Smart Watch Pro',
        price: 199.99,
        image: 'images/watch.png'
    },
    {
        id: '3',
        name: 'Leather Laptop Bag',
        price: 89.99,
        image: 'images/lap-bag.png' 
    },
    {
        id: '4',
        name: 'Minimalist Desk Lamp',
        price: 49.99,
        image: 'images/lamp.png'
    },
    {
        id: '5',
        name: 'Wireless Charging Pad',
        price: 29.99,
        image: 'images/charging-pad.png'
    },
    {
        id: '6',
        name: 'Premium Coffee Maker',
        price: 159.99,
        image: 'images/coffee-maker.png'
    }
];
