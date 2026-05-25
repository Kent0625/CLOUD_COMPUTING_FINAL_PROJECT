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
const STORAGE_KEY = "thrift_cart";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const savedCart = window.localStorage.getItem(STORAGE_KEY);
  if (!savedCart) return [];

  try {
    const parsed: unknown = JSON.parse(savedCart);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (error) {
    console.error("Failed to parse cart from storage", error);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(readStoredCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: CartItem) => {
    setCart((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
    setTimeout(() => setIsCartOpen(true), 100);
  };

  const removeFromCart = async (id: number) => {
    try {
      const { unreserveProduct } = await import("@/lib/api");
      await unreserveProduct(id);
    } catch (e) {
      console.error("Failed to unreserve product", e);
    }
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
