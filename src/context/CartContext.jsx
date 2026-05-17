// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("verronex-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("verronex-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const finalPrice = product.onSale 
      ? product.price * (1 - product.discount / 100) 
      : product.price;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // 🛑 STOCK CHECK: Prevent adding more than available
        if (existingItem.quantity >= product.stock) {
          alert(`Sorry, only ${product.stock} units of this item are currently in stock.`);
          return prevCart;
        }

        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Ensure we store the 'stock' property in the cart item for future checks
      return [...prevCart, { ...product, price: finalPrice, quantity: 1, stock: product.stock }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          const nextQuantity = item.quantity + delta;

          // 🛑 UPPER LIMIT CHECK: Respect stock threshold
          if (nextQuantity > item.stock) {
            alert(`Maximum stock reached. Only ${item.stock} available.`);
            return item;
          }

          // LOWER LIMIT CHECK: Stay at 1
          return { ...item, quantity: Math.max(1, nextQuantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart }}>
    {children}
  </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);