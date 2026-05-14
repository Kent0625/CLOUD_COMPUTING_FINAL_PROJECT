"use client";

import { useEffect, useState, useMemo } from "react";
import { PH_DATA } from "@/lib/ph-data";
import { useCart } from "@/contexts/CartContext";
import { checkoutProduct } from "@/lib/api";

export default function SlideOutCart() {
  const { cart, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();
  
  const [zone, setZone] = useState("Zone 1");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    province: "",
    city: "",
    barangay: "",
    street: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'qr' | 'processing' | 'success'>('idle');
  const [qrCountdown, setQrCountdown] = useState(6);
  const [touched, setTouched] = useState(false);

  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length >= 3 &&
      phone.replace(/\D/g, "").length >= 10 &&
      address.province !== "" &&
      address.city !== "" &&
      address.barangay !== "" &&
      address.street.length >= 5
    );
  }, [fullName, phone, address]);

  const provincesList = Object.keys(PH_DATA);
  const citiesList = address.province ? Object.keys(PH_DATA[address.province].cities) : [];
  const barangaysList = (address.province && address.city) ? PH_DATA[address.province].cities[address.city] : [];

  const handleCheckoutClick = () => {
    setTouched(true);
    if (!isFormValid) return;
    
    if (paymentMethod === "Cash on Delivery") {
        setCheckoutStatus('processing');
        setTimeout(async () => {
            try {
                for (const item of cart) {
                    await checkoutProduct(item.id, zone);
                }
                setCheckoutStatus('success');
                clearCart();
            } catch (err) {
                alert("Order failed.");
                setCheckoutStatus('idle');
            }
        }, 1500);
    } else {
        setCheckoutStatus('qr');
        setQrCountdown(6);
    }
  };

  useEffect(() => {
    if (checkoutStatus !== 'qr') return;
    if (qrCountdown === 0) {
      setCheckoutStatus('processing');
      
      const processCheckout = async () => {
        try {
          for (const item of cart) {
            await checkoutProduct(item.id, zone);
          }
          setCheckoutStatus('success');
          clearCart();
        } catch (err) {
          console.error(err);
          alert("Checkout failed. Please try again.");
          setCheckoutStatus('idle');
        }
      };
      
      processCheckout();
      return;
    }
    const id = setInterval(() => setQrCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [checkoutStatus, qrCountdown, cart, zone, clearCart]);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = zone === "Zone 1" ? 120 : 180;

  return (
    <>
      <div onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity" />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#F5F4F0] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-2xl font-playfair italic">Your Bag</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-2xl font-light hover:rotate-90 transition-transform">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          
          {/* SUCCESS VIEW */}
          {checkoutStatus === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-24 h-24 rounded-full border border-black flex items-center justify-center mb-10 text-3xl font-light">✓</div>
                <h2 className="text-4xl font-playfair mb-4 italic">Confirmed</h2>
                <p className="text-sm text-gray-500 mb-12 leading-relaxed">
                {paymentMethod === "Cash on Delivery" 
                    ? "Your order has been placed. Please prepare the exact amount upon delivery."
                    : "Your selection has been archived. You will receive a notification shortly."}
                </p>
                <button 
                onClick={() => {
                    setCheckoutStatus('idle');
                    setIsCartOpen(false);
                }}
                className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-widest font-bold"
                >
                Return to Boutique
                </button>
            </div>
          ) : checkoutStatus === 'qr' ? (
            /* QR VIEW */
            <div className="flex flex-col items-center justify-center py-10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8 font-bold">Pay via {paymentMethod}</p>
                <div className="bg-black p-8 mb-8">
                <div className="w-48 h-48 flex flex-wrap opacity-80">
                    {[...Array(64)].map((_, i) => <div key={i} className={`w-[12.5%] h-[12.5%] ${(i % 3 === 0 || i % 7 === 0) ? 'bg-white' : 'bg-transparent'}`} />)}
                </div>
                </div>
                <p className="text-5xl font-playfair mb-4 italic">{qrCountdown}s</p>
                <p className="text-xs text-gray-500 text-center uppercase tracking-widest leading-loose">Awaiting confirmation...<br/>Keep this window active.</p>
                <button onClick={() => setCheckoutStatus('idle')} className="mt-10 text-[9px] uppercase tracking-widest border-b border-black">Cancel Payment</button>
            </div>
          ) : checkoutStatus === 'processing' ? (
            /* PROCESSING VIEW */
            <div className="h-full flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Processing Order...</p>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY VIEW */
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 font-playfair italic text-lg mb-6">Your bag is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1">Start Exploring</button>
            </div>
          ) : (
            /* MAIN CART + FORM VIEW */
            <>
              {/* Items List */}
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Selected Items ({cart.length})</p>
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-6 items-center group bg-white p-4 border border-black/5">
                      <div className="w-16 aspect-[3/4] bg-gray-100 overflow-hidden">
                        <img src={item.image || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[11px] font-bold uppercase tracking-tight">{item.name}</h3>
                        <p className="text-xs text-gray-400 font-medium">₱{item.price.toLocaleString()}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] uppercase tracking-widest text-red-800 mt-2 hover:underline">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              <div className="space-y-8 pt-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Delivery Details</p>
                  {touched && !isFormValid && (
                    <span className="text-[9px] text-red-500 uppercase font-bold tracking-tighter">Required Info</span>
                  )}
                </div>
                <div className="space-y-6">
                  <input 
                    type="text" placeholder="Full Name" value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full bg-transparent border-b py-3 text-sm focus:border-black transition-colors outline-none ${touched && fullName.trim().length < 3 ? 'border-red-400' : 'border-black/10'}`}
                  />
                  <input 
                    type="tel" placeholder="Phone Number (10 digits)" value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className={`w-full bg-transparent border-b py-3 text-sm focus:border-black transition-colors outline-none ${touched && phone.length < 10 ? 'border-red-400' : 'border-black/10'}`}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={address.province}
                      onChange={(e) => setAddress({...address, province: e.target.value, city: "", barangay: ""})}
                      className={`bg-transparent border-b py-3 text-sm outline-none ${touched && !address.province ? 'border-red-400 text-red-400' : 'border-black/10'}`}
                    >
                      <option value="">Province</option>
                      {provincesList.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select 
                      value={address.city}
                      disabled={!address.province}
                      onChange={(e) => setAddress({...address, city: e.target.value, barangay: ""})}
                      className={`bg-transparent border-b py-3 text-sm outline-none disabled:opacity-30 ${touched && !address.city ? 'border-red-400 text-red-400' : 'border-black/10'}`}
                    >
                      <option value="">City</option>
                      {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={address.barangay}
                      disabled={!address.city}
                      onChange={(e) => setAddress({...address, barangay: e.target.value})}
                      className={`bg-transparent border-b py-3 text-sm outline-none disabled:opacity-30 ${touched && !address.barangay ? 'border-red-400 text-red-400' : 'border-black/10'}`}
                    >
                      <option value="">Barangay</option>
                      {barangaysList.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <input 
                      type="text" placeholder="House No. / Street" value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                      className={`bg-transparent border-b py-3 text-sm focus:border-black transition-colors outline-none ${touched && address.street.length < 5 ? 'border-red-400' : 'border-black/10'}`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Shipping</p>
                  <div className="space-y-2">
                    {[
                      { z: "Zone 1", l: "Metro Same Day", p: 120 },
                      { z: "Zone 2", l: "Provincial 3-5 Days", p: 180 }
                    ].map(opt => (
                      <label key={opt.z} className={`flex items-center justify-between p-4 border rounded-sm cursor-pointer transition-all ${zone === opt.z ? 'border-black bg-white' : 'border-black/5 hover:border-black/20'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" checked={zone === opt.z} onChange={() => setZone(opt.z)} className="accent-black" />
                          <span className="text-xs uppercase font-bold tracking-tight">{opt.l}</span>
                        </div>
                        <span className="text-xs font-medium">₱{opt.p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Expanded Payment Methods */}
                <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                        {["GCash", "Online Payment", "Cash on Delivery", "Bank Transfer"].map(m => (
                            <button 
                                key={m} 
                                type="button"
                                onClick={() => setPaymentMethod(m)}
                                className={`text-[10px] uppercase tracking-tight py-3 border rounded-sm transition-all font-bold ${paymentMethod === m ? 'border-black bg-black text-white' : 'border-black/10 text-gray-500 hover:border-black/30'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
              </>
            )
          )}
        </div>

        {/* Footer with Subtotal */}
        {cart.length > 0 && checkoutStatus === 'idle' && (
          <div className="p-8 bg-white border-t border-black/5 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-8">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Subtotal</span>
              <span className="text-2xl font-dm-sans font-medium">₱{(subtotal + shipping).toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCheckoutClick}
              className={`w-full py-5 text-[10px] uppercase tracking-widest font-bold transition-all ${
                isFormValid ? "bg-black text-white hover:bg-gray-900" : "bg-gray-100 text-gray-400"
              }`}
            >
              {isFormValid ? (paymentMethod === "Cash on Delivery" ? "Place Order" : `Pay via ${paymentMethod}`) : "Complete Details"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
