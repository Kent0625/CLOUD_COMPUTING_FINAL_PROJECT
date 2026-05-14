import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SlideOutCart from "@/components/SlideOutCart";
import { CartProvider } from "@/contexts/CartContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Archivé | Premium Curated Vintage",
  description: "Exclusive vintage boutique prioritizing whitespace, high-end typography, and cinematic photography.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#F5F4F0]">
      <body className={`${playfair.variable} ${dmSans.variable} font-dm-sans text-[#111110]`}>
        <CartProvider>
          <Navbar />
          <SlideOutCart />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
