"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isInitialMount = useRef(true);

  // 1. Initial Load from LocalStorage (ONLY ONCE)
  useEffect(() => {
    const savedCart = localStorage.getItem("thrift_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch (e) {
        console.error("Failed to parse cart from storage", e);
      }
    }
  }, []);

  // 2. Save to LocalStorage whenever cart changes
  useEffect(() => {
    // Skip the very first run to prevent overwriting stored data with empty state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem("thrift_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartItem) => {
    setCart((prev) => {
      // Prevent duplicates
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
    // Give a small delay to ensure state update before opening
    setTimeout(() => setIsCartOpen(true), 100);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
