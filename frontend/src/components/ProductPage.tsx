"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import SlideOutCart, { CheckoutDetails } from "./SlideOutCart";
import { fetchProducts, reserveProduct, checkoutProduct, fetchProduct } from "@/lib/api";

const TIMER_DURATION = 600;

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function ProductPage({ params }: { params?: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [timerSecs, setTimerSecs] = useState(TIMER_DURATION);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      try {
        setError(null);
        setLoading(true);
        console.log("Fetching products...");
        const products = await fetchProducts();
        console.log("Products received:", products);
        
        if (products && Array.isArray(products) && products.length > 0) {
          const targetId = params?.id ? parseInt(params.id) : null;
          const initialProduct = targetId 
            ? products.find((p: any) => p.id === targetId) || products[0]
            : products[0];
          
          setProduct(initialProduct);
          if (initialProduct.status === "reserved" && initialProduct.is_locked) {
             setInCart(true); 
             setTimerSecs(initialProduct.lock_ttl || TIMER_DURATION);
          }
        } else {
          setError("The boutique is currently empty. Check back later.");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params?.id]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!inCart || timerSecs <= 0) return;
    const id = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) { 
          clearInterval(id); 
          setInCart(false); 
          fetchProduct(product.id).then(setProduct);
          return TIMER_DURATION; 
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [inCart, timerSecs, product?.id]);

  const handleAddToCart = async () => {
    if (!product || product.status !== "available") return;
    try {
      await reserveProduct(product.id);
      const updated = await fetchProduct(product.id);
      setProduct(updated);
      setInCart(true);
      setTimerSecs(updated.lock_ttl || TIMER_DURATION);
      setCartOpen(true);
    } catch (err: any) {
      alert(err.message || "Could not reserve this item.");
    }
  };

  const handleCheckout = async (details: CheckoutDetails) => {
    if (!product) return;
    try {
      await checkoutProduct(product.id, details.zone);
      alert(`Purchase successful! \n\nReceipt sent to: ${details.fullName}\nAddress: ${details.address}\nPayment: ${details.paymentMethod}\n\nThank you for shopping with Archivé.`);
      setInCart(false);
      setCartOpen(false);
      const updated = await fetchProduct(product.id);
      setProduct(updated);
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Checkout failed.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-playfair uppercase tracking-widest animate-pulse">Archivé Boutique...</div>;
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-warm-white">
      <h2 className="font-playfair text-2xl mb-4">Pardon our delay</h2>
      <p className="font-dm-sans text-muted-gray mb-8 max-w-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-charcoal text-warm-white px-8 py-3 font-dm-sans text-[11px] tracking-widest uppercase">
        Retry Entry
      </button>
    </div>
  );

  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;

  const accordionData = [
    { key: "fit", title: "The Fit", content: product.fit_details },
    { key: "fabric", title: "The Fabric", content: product.fabric_details },
    { key: "condition", title: "The Condition", content: product.condition_details },
  ];

  return (
    <div className="bg-warm-white min-h-screen">
      <Navbar onCartOpen={() => setCartOpen(true)} cartCount={inCart ? 1 : 0} />

      {/* Breadcrumb */}
      <div className="pt-[88px] px-12 flex gap-2.5 items-center">
        {["Collections", "Outerwear", product.name].map((crumb, i, arr) => (
          <span key={crumb} className="flex items-center gap-2.5">
            <span className={`font-dm-sans text-[10px] tracking-[0.14em] uppercase ${i === arr.length - 1 ? 'text-charcoal' : 'text-[#B0ADA8] cursor-pointer'}`}>
              {crumb}
            </span>
            {i < arr.length - 1 && <span className="text-[#D0CEC8] text-[10px]">·</span>}
          </span>
        ))}
      </div>

      {/* Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-[1400px] mx-auto px-12 py-8 pb-20">

        {/* Left: Gallery */}
        <div className="md:pr-12">
          <div className="flex flex-col gap-0">
            <div className="w-full aspect-[3/4] overflow-hidden bg-[#ECEAE4]">
              <img 
                src={product.images[activeImg]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-opacity duration-400" 
              />
            </div>
            <div className="flex gap-1 mt-1">
              {product.images.map((img: string, i: number) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImg(i)} 
                  className={`flex-1 aspect-square overflow-hidden cursor-pointer bg-[#ECEAE4] transition-opacity duration-200 ${activeImg === i ? 'opacity-100' : 'opacity-45'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:pl-4 pt-2">
          {/* Archive ID + Status */}
          <div className="flex justify-between items-center mb-5">
            <span className="font-dm-sans text-[10px] tracking-[0.2em] text-[#B0ADA8] uppercase">Archive No. {product.archive_id}</span>
            <span className={`inline-block px-3 py-1.5 rounded-[2px] font-dm-sans text-[10px] font-medium tracking-[0.14em] uppercase ${
              product.status === 'available' ? 'bg-[#E8F0E8] text-[#2D5A2D]' : 
              product.status === 'reserved' ? 'bg-[#F5EDD8] text-[#8A6A28]' : 
              'bg-[#EEE] text-muted-gray'
            }`}>
              {product.status === 'available' ? 'Available' : product.status === 'reserved' ? 'Currently Reserved' : 'Archived — Sold'}
            </span>
          </div>

          <p className="font-dm-sans text-[11px] tracking-[0.24em] text-muted-gray uppercase mb-2.5">{product.brand}</p>
          <h1 className="font-playfair text-[clamp(32px,4vw,46px)] font-normal text-charcoal leading-[1.1] tracking-tight mb-1.5">
            {product.name}
          </h1>
          <p className="font-playfair italic text-[16px] text-muted-gray mb-8 tracking-[0.06em]">{product.era}</p>

          <div className="border-t border-[#E0DED8] mb-7" />

          {/* Pricing */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-dm-sans text-[10px] tracking-[0.18em] text-[#B0ADA8] uppercase">Curated Price</span>
            </div>
            <div className="flex items-baseline gap-4">
              <span className="font-playfair text-[42px] font-normal text-charcoal tracking-tight">₱{product.price.toLocaleString()}</span>
              <div>
                <p className="font-dm-sans text-[11px] text-[#C8C5BF] line-through font-light">SRP ₱{product.srp.toLocaleString()}</p>
                <p className="font-dm-sans text-[10px] text-reserved-amber tracking-[0.1em] uppercase">Archived Value</p>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Size", value: product.size },
              { label: "Colorway", value: product.color },
            ].map(spec => (
              <div key={spec.label} className="bg-[#ECEAE4] p-3.5 px-4 rounded-[2px]">
                <p className="font-dm-sans text-[9px] tracking-[0.2em] text-muted-gray uppercase mb-1">{spec.label}</p>
                <p className="font-dm-sans text-[13px] text-charcoal font-normal">{spec.value}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {product.status === "available" && (
            <button 
              onClick={handleAddToCart}
              className="w-full bg-charcoal text-warm-white py-4.5 font-dm-sans text-[11px] tracking-[0.24em] uppercase cursor-pointer mb-3 transition-all duration-200 hover:bg-accent-navy hover:tracking-[0.3em]"
            >
              Add to Reserve
            </button>
          )}
          {product.status === "reserved" && !inCart && (
            <div className="w-full py-4.5 text-center border border-[#D4A853] bg-[#FBF3E8] font-dm-sans text-[11px] tracking-[0.2em] uppercase text-[#8A6A28] mb-3">
              Currently Reserved
            </div>
          )}
          {inCart && (
            <button 
              onClick={() => setCartOpen(true)}
              className="w-full border border-charcoal text-charcoal py-4.5 font-dm-sans text-[11px] tracking-[0.24em] uppercase cursor-pointer mb-3 flex items-center justify-center gap-2.5 transition-colors hover:bg-charcoal hover:text-warm-white"
            >
              <span>View Reserve</span>
              <span className="font-playfair text-[14px] text-reserved-amber font-normal">{formatTime(timerSecs)}</span>
            </button>
          )}

          <p className="font-dm-sans text-[10px] text-[#B0ADA8] text-center tracking-[0.1em]">
            One-of-one. This piece exists nowhere else.
          </p>

          <div className="border-t border-[#E0DED8] mt-9" />

          {/* Accordions */}
          <div className="mt-1">
            {accordionData.map(({ key, title, content }) => (
              <div key={key} className="border-b border-[#E0DED8]">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                  className="w-full flex justify-between items-center py-[18px] cursor-pointer"
                >
                  <span className="font-dm-sans text-[11px] tracking-[0.2em] uppercase text-charcoal font-normal">{title}</span>
                  <span className={`font-dm-sans text-[18px] text-muted-gray font-extralight transition-transform duration-300 ${openAccordion === key ? 'rotate-45' : 'rotate-0'}`}>+</span>
                </button>
                <div className={`overflow-hidden transition-all duration-400 ${openAccordion === key ? 'max-h-[300px] pb-5' : 'max-h-0'}`}>
                  <p className="font-dm-sans text-[13px] leading-relaxed text-[#5A5A56] font-light">{content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex gap-6 mt-8">
            {[
              { icon: "○", label: "Condition Verified" },
              { icon: "◇", label: "1-of-1 Guaranteed" },
              { icon: "△", label: "Curated & Cleaned" },
            ].map(b => (
              <div key={b.label} className="text-center flex-1">
                <p className="font-playfair text-[18px] text-[#B0ADA8] mb-1">{b.icon}</p>
                <p className="font-dm-sans text-[9px] tracking-[0.14em] text-[#B0ADA8] uppercase">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="border-t border-[#E0DED8] px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg width="24" height="18" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 24 C4 24, 10 4, 19 4 C28 4, 34 24, 34 24" stroke="#B0ADA8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M9 24 C9 24, 13 12, 19 12 C25 12, 29 24, 29 24" stroke="#B0ADA8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
          <span className="font-playfair text-[13px] font-light tracking-[0.2em] text-[#B0ADA8] uppercase">Archivé · Cagayan de Oro</span>
        </div>
        <p className="font-dm-sans text-[10px] tracking-[0.12em] text-[#C8C5BF]">
          Curated vintage. No imitations. No reproductions.
        </p>
      </div>

      <SlideOutCart 
        isOpen={cartOpen} 
        onClose={() => setCartOpen(false)} 
        product={product} 
        timerSeconds={timerSecs} 
        onCheckout={handleCheckout} 
      />
    </div>
  );
}
