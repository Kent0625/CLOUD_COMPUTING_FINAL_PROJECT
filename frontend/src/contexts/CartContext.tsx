"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("thrift_cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        console.log("Loaded cart from storage:", parsed);
        setCart(parsed);
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to local storage on change
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving cart to storage:", cart);
      localStorage.setItem("thrift_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: CartItem) => {
    console.log("Adding to cart:", product);
    setCart((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        console.log("Item already in cart, skipping.");
        return prev;
      }
      const newCart = [...prev, product];
      console.log("New cart state:", newCart);
      return newCart;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    console.log("Removing from cart ID:", id);
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    console.log("Clearing cart");
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
