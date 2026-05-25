"use client";

import Image from "next/image";
import Link from "next/link";
import { pesoFormatter } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const isSold = product.status === "sold";
  const isReserved = product.status === "reserved";
  const displayImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
    >
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
        <Image
          src={displayImage}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
            isSold || isReserved ? "grayscale" : ""
          }`}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-white/90 text-black px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
              Sold Out
            </span>
          </div>
        )}
        {isReserved && !isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-900/20">
            <span className="bg-amber-500/90 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold">
              Reserved
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex justify-between items-start gap-3 min-w-0">
          <h3 className="text-[11px] font-bold uppercase text-gray-900 group-hover:underline decoration-1 tracking-tight break-words">
            {product.name}
          </h3>
          <p className="text-sm font-semibold tracking-tighter tabular-nums shrink-0">
            {pesoFormatter.format(product.price)}
          </p>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold truncate">
          {product.brand}
        </p>
      </div>
    </Link>
  );
}
