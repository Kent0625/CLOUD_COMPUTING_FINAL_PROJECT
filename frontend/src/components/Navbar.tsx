"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link
          href="/"
          className="font-playfair text-2xl italic tracking-tighter focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Archive
        </Link>

        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-[10px] uppercase tracking-widest font-bold hover:text-gray-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            Analytics
          </Link>
          <button
            type="button"
            aria-label="Open cart"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            <span className="text-[10px] uppercase tracking-widest font-bold group-hover:text-gray-500 transition-colors">
              Cart
            </span>
            {cart.length > 0 && (
              <span className="bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold tabular-nums">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
