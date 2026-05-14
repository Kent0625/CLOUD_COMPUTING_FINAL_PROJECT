"use client";

import { useState, useEffect } from "react";
import { fetchProduct, reserveProduct } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";

const TIMER_DURATION = 600;

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export default function ProductPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [timerSecs, setTimerSecs] = useState(TIMER_DURATION);
  const [openAccordion, setOpenAccordion] = useState<string | null>("fit");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart, setIsCartOpen, cart } = useCart();
  const inCart = cart.some(item => item.id === product?.id);

  useEffect(() => {
    async function loadProduct() {
      try {
        setError(null);
        setLoading(true);
        const data = await fetchProduct(parseInt(productId));
        setProduct(data);
        if (data.status === "reserved" && data.is_locked) {
          setTimerSecs(data.lock_ttl || TIMER_DURATION);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!inCart || timerSecs <= 0) return;
    const id = setInterval(() => {
      setTimerSecs(s => {
        if (s <= 1) { 
          clearInterval(id); 
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
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      });
      setIsCartOpen(true);
    } catch (err: any) {
      alert(err.message || "Could not reserve this item.");
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.status !== "available") {
        if (inCart) {
            setIsCartOpen(true);
        }
        return;
    }
    await handleAddToCart();
    setIsCartOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-playfair uppercase tracking-widest animate-pulse">Archivé Boutique...</div>;
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#F5F4F0]">
      <h2 className="font-playfair text-2xl mb-4 italic">Pardon our delay</h2>
      <p className="font-dm-sans text-gray-500 mb-8 max-w-sm">{error}</p>
      <button onClick={() => window.location.reload()} className="border border-black px-8 py-3 font-dm-sans text-[11px] tracking-widest uppercase hover:bg-black hover:text-white transition-colors">
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
    <div className="bg-[#F5F4F0] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="mb-12 flex gap-3 items-center">
          {["Collection", product.brand, product.name].map((crumb, i, arr) => (
            <span key={crumb} className="flex items-center gap-3">
              <span className={`text-[9px] uppercase tracking-[0.2em] font-semibold ${i === arr.length - 1 ? 'text-black' : 'text-gray-400'}`}>
                {crumb}
              </span>
              {i < arr.length - 1 && <span className="text-gray-300">/</span>}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[3/4] overflow-hidden bg-gray-100">
              <img 
                src={product.images[activeImg]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-opacity duration-500" 
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img: string, i: number) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImg(i)} 
                  className={`aspect-square overflow-hidden cursor-pointer bg-gray-100 transition-opacity duration-300 ${activeImg === i ? 'opacity-100 ring-1 ring-black ring-offset-2' : 'opacity-50 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase font-bold">ARC-{product.archive_id}</span>
                <span className={`text-[9px] px-3 py-1 font-bold uppercase tracking-widest ${
                  product.status === 'available' ? 'bg-green-50 text-green-700' : 
                  product.status === 'reserved' ? 'bg-amber-50 text-amber-700' : 
                  'bg-gray-100 text-gray-500'
                }`}>
                  {product.status === 'available' ? 'Available' : product.status === 'reserved' ? 'Reserved' : 'Sold'}
                </span>
              </div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">{product.brand}</p>
              <h1 className="text-5xl font-playfair mb-4 leading-tight">{product.name}</h1>
              <p className="text-lg text-gray-500 font-playfair italic mb-10">{product.era}</p>

              <div className="flex items-baseline gap-6 mb-12">
                <span className="text-4xl font-dm-sans font-medium">₱{product.price.toLocaleString()}</span>
                <span className="text-sm text-gray-300 line-through font-light">SRP ₱{product.srp.toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-white/50 p-4 border border-black/5">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Size</p>
                  <p className="text-sm font-medium">{product.size}</p>
                </div>
                <div className="bg-white/50 p-4 border border-black/5">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold mb-1">Color</p>
                  <p className="text-sm font-medium">{product.color}</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-4">
                {product.status === "available" && (
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleAddToCart}
                      className="bg-white border border-black text-black py-5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white transition-all active:scale-[0.98]"
                    >
                      Add to Cart
                    </button>
                    <button 
                      onClick={handleBuyNow}
                      className="bg-black text-white py-5 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-gray-900 transition-all active:scale-[0.98]"
                    >
                      Buy Now
                    </button>
                  </div>
                )}
                
                {product.status === "reserved" && !inCart && (
                  <div className="w-full py-5 text-center border border-amber-200 bg-amber-50 text-[10px] uppercase tracking-[0.3em] font-bold text-amber-700">
                    Currently Reserved
                  </div>
                )}

                {inCart && (
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="w-full border border-black py-5 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center justify-center gap-4 hover:bg-black hover:text-white transition-all"
                  >
                    <span>Item in Cart</span>
                    <span className="font-dm-sans font-normal text-amber-600">{formatTime(timerSecs)}</span>
                  </button>
                )}
                
                <p className="text-[9px] text-gray-400 text-center uppercase tracking-widest pt-4">
                  1-of-1 Original. No returns.
                </p>
              </div>

              {/* Accordions */}
              <div className="mt-16 border-t border-black/10">
                {accordionData.map(({ key, title, content }) => (
                  <div key={key} className="border-b border-black/10">
                    <button 
                      onClick={() => setOpenAccordion(openAccordion === key ? null : key)}
                      className="w-full flex justify-between items-center py-6 group"
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold group-hover:tracking-[0.3em] transition-all">{title}</span>
                      <span className={`text-xl font-light transition-transform duration-300 ${openAccordion === key ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openAccordion === key ? 'max-h-64 pb-8' : 'max-h-0'}`}>
                      <p className="text-sm leading-relaxed text-gray-500 font-light">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
