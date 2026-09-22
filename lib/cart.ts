export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export function createEmptyCart(): Cart {
  return {
    items: [],
    total: 0,
    itemCount: 0,
  };
}

export function addToCart(cart: Cart, item: CartItem): Cart {
  const existingItem = cart.items.find((i) => i.id === item.id);

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  return updateCartTotals(cart);
}

export function removeFromCart(cart: Cart, itemId: string): Cart {
  cart.items = cart.items.filter((i) => i.id !== itemId);
  return updateCartTotals(cart);
}

export function updateQuantity(
  cart: Cart,
  itemId: string,
  quantity: number
): Cart {
  const item = cart.items.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.id !== itemId);
    }
  }
  return updateCartTotals(cart);
}

export function updateCartTotals(cart: Cart): Cart {
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return cart;
}

export function clearCart(): Cart {
  return createEmptyCart();
}
