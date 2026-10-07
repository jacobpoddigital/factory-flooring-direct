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

// Samples module - exposes window.samples for ordering free samples per product.
// Samples are just free line items in the SAME cart (window.cart), not a separate
// basket -- this is simpler than maintaining parallel state and matches how the
// real site's cart ultimately treats them (one order, one set of line items).
// A sample line item is distinguished by a `sample-` id prefix and price 0, so it
// can coexist with a full-price cart entry for the same product without the two
// merging into one quantity.
window.samples = (() => {
  const MAX_SAMPLES = 5; // matches the real site's "up to 5 free samples" policy (data/delivery.json faq)

  function sampleId(productId) {
    return `sample-${productId}`;
  }

  function sampleItems() {
    return window.cart.get().items.filter(item => item.id.startsWith('sample-'));
  }

  return {
    // Returns { ok: true, cart } or { ok: false, reason: 'already-added' | 'limit-reached' }
    add(product) {
      if (this.has(product.id)) {
        return { ok: false, reason: 'already-added' };
      }

      if (sampleItems().length >= MAX_SAMPLES) {
        return { ok: false, reason: 'limit-reached' };
      }

      const cart = window.cart.add({
        id: sampleId(product.id),
        name: `${product.name} (Free Sample)`,
        price: 0,
        image: product.image,
        quantity: 1,
      });

      return { ok: true, cart };
    },

    remove(productId) {
      return window.cart.remove(sampleId(productId));
    },

    has(productId) {
      return sampleItems().some(item => item.id === sampleId(productId));
    },

    get() {
      const items = sampleItems();
      return { items, itemCount: items.length, maxSamples: MAX_SAMPLES };
    },

    print() {
      const items = sampleItems();
      console.table(items);
      console.log(`Samples: ${items.length}/${MAX_SAMPLES}`);
      return items;
    },
  };
})();

// Expose products globally (will be populated from products.json)
window.products = [];

console.log('✅ Cart module loaded. Use window.cart.add({id, name, price, image, quantity}) to add items.');
console.log('✅ Samples module loaded. Use window.samples.add({id, name, image, category}) to order a free sample.');
