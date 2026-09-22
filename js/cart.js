// Cart module - exposes window.cart for chatbot integration
// Backed by localStorage for persistence across page reloads

window.cart = (() => {
  const STORAGE_KEY = 'fdf_cart';

  // Load cart from localStorage or create empty cart
  function loadCart() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { items: [], total: 0, itemCount: 0 };
  }

  // Save cart to localStorage
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    dispatchCartUpdate(cart);
    return cart;
  }

  // Dispatch custom event so pages can listen for cart changes
  function dispatchCartUpdate(cart) {
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  }

  // Calculate totals
  function updateTotals(cart) {
    cart.itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    return cart;
  }

  return {
    add(product) {
      const cart = loadCart();
      const existingItem = cart.items.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (product.quantity || 1);
      } else {
        cart.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: product.quantity || 1,
        });
      }

      return saveCart(updateTotals(cart));
    },

    remove(productId) {
      const cart = loadCart();
      cart.items = cart.items.filter(item => item.id !== productId);
      return saveCart(updateTotals(cart));
    },

    updateQuantity(productId, quantity) {
      const cart = loadCart();
      const item = cart.items.find(item => item.id === productId);

      if (item) {
        if (quantity <= 0) {
          cart.items = cart.items.filter(i => i.id !== productId);
        } else {
          item.quantity = quantity;
        }
      }

      return saveCart(updateTotals(cart));
    },

    get() {
      return loadCart();
    },

    getTotal() {
      return loadCart().total;
    },

    getItemCount() {
      return loadCart().itemCount;
    },

    clear() {
      return saveCart({ items: [], total: 0, itemCount: 0 });
    },

    // For debugging
    print() {
      const cart = loadCart();
      console.table(cart.items);
      console.log(`Total: £${(cart.total / 100).toFixed(2)}, Items: ${cart.itemCount}`);
      return cart;
    },
  };
})();

// Expose products globally (will be populated from products.json)
window.products = [];

console.log('✅ Cart module loaded. Use window.cart.add({id, name, price, image, quantity}) to add items.');
