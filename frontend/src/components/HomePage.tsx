"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
            alt="Curated vintage store interior"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-playfair mb-6 tracking-tight italic">
            Archival Objects
          </h1>
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] font-medium opacity-80 mb-10">
            Curated vintage for the modern minimalist
          </p>
          <a 
            href="#collection"
            className="inline-block border border-white px-10 py-4 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-300"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-black text-white py-4 overflow-hidden whitespace-nowrap border-y border-white/10">
        <div className="animate-marquee inline-block">
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Limited Release</span>
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Worldwide Shipping</span>
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Authenticated Pieces</span>
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Curated in Tokyo</span>
        </div>
        <div className="animate-marquee inline-block">
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Limited Release</span>
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Worldwide Shipping</span>
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Authenticated Pieces</span>
          <span className="mx-10 text-[10px] uppercase tracking-[0.5em] font-semibold">Curated in Tokyo</span>
        </div>
      </div>

      {/* Product Grid */}
      <section id="collection" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 border-b border-gray-100 pb-8">
          <h2 className="text-3xl font-playfair">Latest Arrivals</h2>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-4 md:mt-0">
            {products.length} Items Available
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-4"></div>
                <div className="h-4 bg-gray-200 w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-100 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-playfair mb-6 italic">Archive</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              We curate high-end archival garments from the 80s to the present day, focusing on Japanese and European avant-garde designers.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Service</h4>
            <ul className="text-sm text-gray-500 space-y-4">
              <li><a href="#" className="hover:text-black transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Authentication</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Social</h4>
            <ul className="text-sm text-gray-500 space-y-4">
              <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-black transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
