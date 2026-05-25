import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import SlideOutCart from "@/components/SlideOutCart";
import { CartProvider } from "@/contexts/CartContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Archive | Premium Curated Vintage",
  description: "Exclusive vintage boutique prioritizing whitespace, high-end typography, and cinematic photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#F5F4F0]">
      <body className="font-dm-sans text-[#111110]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:outline focus:outline-2 focus:outline-black"
        >
          Skip to content
        </a>
        <CartProvider>
          <Navbar />
          <SlideOutCart />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
