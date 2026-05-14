"use client";

import { useEffect, useState, useMemo } from "react";
import { PH_DATA } from "@/lib/ph-data";

const TIMER_DURATION = 600;

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

interface Product {
  id: number;
  archive_id: string;
  name: string;
  brand: string;
  price: number;
  srp: number;
  size: string;
  color: string;
  images: string[];
}

interface SlideOutCartProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  timerSeconds: number;
  onCheckout: (details: CheckoutDetails) => void;
}

export interface CheckoutDetails {
  zone: string;
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

export default function SlideOutCart({ isOpen, onClose, product, timerSeconds, onCheckout }: SlideOutCartProps) {
  const [zone, setZone] = useState("Zone 1");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+63");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  
  // Payment States: idle | qr | processing | success
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'qr' | 'processing' | 'success'>('idle');
  const [qrCountdown, setQrCountdown] = useState(6);
  const [touched, setTouched] = useState({ fullName: false, phone: false, street: false });

  // Internal countdown for real-time display
  const [internalTimer, setInternalTimer] = useState(timerSeconds);

  useEffect(() => {
    setInternalTimer(timerSeconds);
  }, [timerSeconds]);

  useEffect(() => {
    if (!isOpen || internalTimer <= 0) return;
    const id = setInterval(() => {
      setInternalTimer(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen, internalTimer]);

  const errors = {
    fullName: touched.fullName && fullName.trim().length < 3 ? "Name too short" : null,
    phone: touched.phone && !/^\d{10}$/.test(phone.replace(/\s/g, "")) ? "Invalid number (10 digits)" : null,
    address: (province && city && barangay && street.length >= 5) ? null : "Complete your address",
  };

  const isFormValid = useMemo(() => 
    !errors.fullName && !errors.phone && 
    fullName.trim() !== "" && province !== "" && city !== "" && barangay !== "" && street.length >= 5
  , [errors, fullName, province, city, barangay, street]);

  // Data Selectors
  const provincesList = Object.keys(PH_DATA);
  const citiesList = province ? Object.keys(PH_DATA[province].cities) : [];
  const barangaysList = (province && city) ? PH_DATA[province].cities[city] : [];

  const handleCheckoutClick = () => {
    if (!isFormValid) {
      setTouched({ fullName: true, phone: true, street: true });
      return;
    }
    setCheckoutStatus('qr');
    setQrCountdown(6);
  };

  // QR Countdown Effect
  useEffect(() => {
    if (checkoutStatus !== 'qr') return;
    if (qrCountdown === 0) {
      setCheckoutStatus('processing');
      const fullAddress = `${street}, Brgy. ${barangay}, ${city}, ${province}`;
      setTimeout(() => {
        onCheckout({ zone, fullName, phone: `${countryCode}${phone}`, address: fullAddress, paymentMethod });
        setCheckoutStatus('success');
      }, 2000);
      return;
    }
    const id = setInterval(() => setQrCountdown(c => c - 1), 1000);
    return () => clearInterval(id);
  }, [checkoutStatus, qrCountdown, countryCode, phone, street, barangay, city, province, zone, fullName, paymentMethod, onCheckout]);

  if (!product) return null;

  if (checkoutStatus === 'qr') {
    return (
      <div className={`fixed top-0 right-0 bottom-0 z-[205] w-[min(520px,94vw)] bg-warm-white flex flex-col items-center justify-center p-8 shadow-[-20px_0_60px_rgba(0,0,0,0.2)]`}>
        <p className="font-dm-sans text-[10px] tracking-[0.2em] text-muted-gray uppercase mb-8 text-center">Scan to Pay via {paymentMethod}</p>
        <div className="bg-white p-6 border border-[#E0DED8] mb-8 shadow-sm">
          {/* Mock QR Code Animation - Static pattern to avoid hydration mismatch */}
          <div className="w-48 h-48 bg-charcoal flex flex-col items-center justify-center text-warm-white text-[9px] text-center p-6 space-y-4">
             <div className="w-full h-full border-[1px] border-warm-white/20 flex flex-wrap opacity-40">
                {[...Array(64)].map((_, i) => <div key={i} className={`w-[12.5%] h-[12.5%] ${(i % 3 === 0 || i % 7 === 0) ? 'bg-white' : 'bg-transparent'}`} />)}
             </div>
             <p className="tracking-widest uppercase font-light letter-spacing-[0.2em]">[ ARCHIVÉ SECURE ]</p>
          </div>
        </div>
        <p className="font-playfair text-[32px] mb-2">{qrCountdown}s</p>
        <p className="font-dm-sans text-[11px] text-muted-gray text-center leading-relaxed">Awaiting confirmation from {paymentMethod}...<br/>Please keep this screen open.</p>
      </div>
    );
  }

  if (checkoutStatus === 'success') {
    return (
      <div className={`fixed top-0 right-0 bottom-0 z-[205] w-[min(520px,94vw)] bg-warm-white flex flex-col items-center justify-center p-8 shadow-[-20px_0_60px_rgba(0,0,0,0.2)] text-center`}>
        <div className="w-20 h-20 rounded-full border border-charcoal flex items-center justify-center mb-8 animate-pulse">
          <span className="text-3xl text-charcoal font-light">✓</span>
        </div>
        <h2 className="font-playfair text-[32px] mb-4 tracking-tight">Order Confirmed</h2>
        <p className="font-dm-sans text-[14px] text-muted-gray mb-10 leading-relaxed max-w-[320px]">
          Your curated piece <strong>{product.name}</strong> is now archived. A tracking number will be sent to <strong>{countryCode}{phone}</strong> shortly.
        </p>
        <button 
          onClick={() => {
            setCheckoutStatus('idle');
            onClose();
            window.location.reload(); 
          }}
          className="bg-charcoal text-warm-white px-16 py-5 font-dm-sans text-[11px] tracking-[0.25em] uppercase hover:bg-accent-navy transition-colors shadow-lg"
        >
          Explore More
        </button>
      </div>
    );
  }

  const urgent = internalTimer < 120;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className={`fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-[2px] transition-opacity duration-400 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-[201] w-[min(520px,94vw)] bg-warm-white flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.12)] transition-transform duration-450 cubic-bezier(0.25, 0.46, 0.45, 0.94) ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-7 pb-6 border-b border-[#E0DED8]">
          <div>
            <p className="font-dm-sans text-[10px] tracking-[0.22em] uppercase text-muted-gray mb-1">Your Selection</p>
            <h2 className="font-playfair text-[22px] font-light text-charcoal tracking-[0.04em]">Reserved Piece</h2>
          </div>
          <button onClick={onClose} className="text-muted-gray text-[22px] font-extralight leading-none p-1 hover:text-charcoal transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-7">
          {/* Timer */}
          <div className={`rounded-sm p-4 border transition-colors duration-500 mb-8 ${urgent ? 'bg-[#FBF3E8] border-[#D4A853]' : 'bg-warm-white border-[#E0DED8]'}`}>
            <div className="flex justify-between items-baseline mb-2.5">
              <span className={`font-dm-sans text-[10px] tracking-[0.16em] uppercase ${urgent ? 'text-[#8A6A28]' : 'text-muted-gray'}`}>Reserved for you</span>
              <span className={`font-playfair text-[22px] font-normal tracking-[0.08em] ${urgent ? 'text-[#8A6A28]' : 'text-charcoal'}`}>{formatTime(internalTimer)}</span>
            </div>
            <div className="bg-[#E0DED8] rounded-[1px] h-[2px] overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 linear ${urgent ? 'bg-reserved-amber' : 'bg-charcoal'}`}
                style={{ width: `${(internalTimer / TIMER_DURATION) * 100}%` }}
              />
            </div>
          </div>

          {/* Delivery Details Form */}
          <div className="mb-8">
            <p className="font-dm-sans text-[10px] tracking-[0.18em] uppercase text-muted-gray mb-6">Delivery Details</p>
            <div className="flex flex-col gap-5">
              {/* Name */}
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={fullName}
                  onBlur={() => setTouched(t => ({ ...t, fullName: true }))}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full bg-transparent border-b py-2 font-dm-sans text-[13px] outline-none transition-colors ${errors.fullName ? 'border-red-400' : 'border-[#D0CEC8] focus:border-charcoal'}`}
                />
              </div>

              {/* Phone with Country Code */}
              <div className="relative flex gap-2">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-transparent border-b border-[#D0CEC8] py-2 font-dm-sans text-[13px] outline-none focus:border-charcoal"
                >
                  <option value="+63">🇵🇭 +63</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+81">🇯🇵 +81</option>
                </select>
                <input 
                  type="tel" 
                  placeholder="917 123 4567" 
                  value={phone}
                  onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`flex-1 bg-transparent border-b py-2 font-dm-sans text-[13px] outline-none transition-colors ${errors.phone ? 'border-red-400' : 'border-[#D0CEC8] focus:border-charcoal'}`}
                />
              </div>

              {/* Address Selectors (Shopee-Style) */}
              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={province}
                  onChange={(e) => { setProvince(e.target.value); setCity(""); setBarangay(""); }}
                  className="bg-transparent border-b border-[#D0CEC8] py-2 font-dm-sans text-[13px] outline-none focus:border-charcoal"
                >
                  <option value="" disabled>Select Province</option>
                  {provincesList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select 
                  value={city}
                  disabled={!province}
                  onChange={(e) => { setCity(e.target.value); setBarangay(""); }}
                  className="bg-transparent border-b border-[#D0CEC8] py-2 font-dm-sans text-[13px] outline-none focus:border-charcoal disabled:opacity-40"
                >
                  <option value="" disabled>Select City</option>
                  {citiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select 
                  value={barangay}
                  disabled={!city}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="bg-transparent border-b border-[#D0CEC8] py-2 font-dm-sans text-[13px] outline-none focus:border-charcoal disabled:opacity-40"
                >
                  <option value="" disabled>Select Barangay</option>
                  {barangaysList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <input 
                  type="text" 
                  placeholder="Street / House No." 
                  value={street}
                  onBlur={() => setTouched(t => ({ ...t, street: true }))}
                  onChange={(e) => setStreet(e.target.value)}
                  className={`bg-transparent border-b py-2 font-dm-sans text-[13px] outline-none transition-colors ${touched.street && street.length < 5 ? 'border-red-400' : 'border-[#D0CEC8] focus:border-charcoal'}`}
                />
              </div>
            </div>
          </div>

          {/* Delivery Zone */}
          <div className="mb-8 pt-2">
            <p className="font-dm-sans text-[10px] tracking-[0.18em] uppercase text-muted-gray mb-3">Delivery Option</p>
            {[
              { zone: "Zone 1", label: "Metro — Same Day", note: "Maxim / Lalamove", price: "120" },
              { zone: "Zone 2", label: "Provincial — 3–5 Days", note: "J&T Express", price: "180" },
            ].map((z) => (
              <label key={z.zone} className={`flex items-center gap-3 py-3 px-3 cursor-pointer border rounded-sm mb-2 transition-colors ${zone === z.zone ? 'border-charcoal bg-[#F0F0EE]' : 'border-[#E0DED8]'}`}>
                <input 
                  type="radio" 
                  name="zone" 
                  checked={zone === z.zone} 
                  onChange={() => setZone(z.zone)}
                  className="accent-charcoal" 
                />
                <div className="flex-1">
                  <p className="font-dm-sans text-[12px] text-charcoal font-normal">{z.label}</p>
                  <p className="font-dm-sans text-[10px] text-muted-gray">via {z.note}</p>
                </div>
                <span className="font-dm-sans text-[12px] text-charcoal">₱{z.price}</span>
              </label>
            ))}
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <p className="font-dm-sans text-[10px] tracking-[0.18em] uppercase text-muted-gray mb-3">Payment via</p>
            <div className="grid grid-cols-2 gap-2">
              {["GCash", "Maya", "QR Ph", "Bank Transfer"].map(m => (
                <button 
                  key={m} 
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`font-dm-sans text-[11px] py-3 border rounded-sm transition-all ${paymentMethod === m ? 'border-charcoal bg-charcoal text-warm-white' : 'border-[#D0CEC8] text-[#5A5A56] hover:border-charcoal'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Product Summary */}
          <div className="flex gap-4 pt-6 border-t border-[#E0DED8]">
            <div className="w-[60px] aspect-[2/3] bg-[#ECEAE4] shrink-0 overflow-hidden">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-playfair text-[15px] font-normal text-charcoal leading-tight mb-1">{product.name}</h3>
              <p className="font-dm-sans text-[11px] text-muted-gray">₱{product.price.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-8 pt-5 pb-8 border-t border-[#E0DED8] bg-warm-white">
          <div className="flex justify-between mb-4">
            <span className="font-dm-sans text-[11px] tracking-[0.12em] text-muted-gray uppercase">Total Amount</span>
            <span className="font-playfair text-[22px] font-normal text-charcoal">
              ₱{(product.price + (zone === "Zone 1" ? 120 : 180)).toLocaleString()}
            </span>
          </div>
          <button 
            onClick={handleCheckoutClick}
            disabled={checkoutStatus !== 'idle' || !isFormValid}
            className={`w-full py-4 font-dm-sans text-[11px] tracking-[0.22em] uppercase font-normal transition-all flex items-center justify-center gap-3 ${
              checkoutStatus !== 'idle' ? 'bg-charcoal/70 cursor-wait text-warm-white' : 
              !isFormValid ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
              'bg-charcoal text-warm-white hover:bg-accent-navy'
            }`}
          >
            {isFormValid ? `Pay via ${paymentMethod}` : 'Complete Details to Pay'}
          </button>
          <p className="font-dm-sans text-[10px] text-[#B0ADA8] text-center mt-3 tracking-tight">
            Encrypted Transaction · Powered by PayMongo
          </p>
        </div>
      </div>
    </>
  );
}
