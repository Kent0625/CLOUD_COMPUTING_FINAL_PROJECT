"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { checkoutProduct } from "@/lib/api";
import { pesoFormatter } from "@/lib/format";
import { PH_DATA } from "@/lib/ph-data";
import { useCart } from "@/contexts/CartContext";

const paymentMethods = ["GCash", "Online Payment", "Cash on Delivery", "Bank Transfer"];
const fallbackImage = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100";

export default function SlideOutCart() {
  const { cart, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();

  const [zone, setZone] = useState("Zone 1");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    province: "",
    city: "",
    barangay: "",
    street: "",
  });
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details">("cart");
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "qr" | "processing" | "success">("idle");
  const [qrCountdown, setQrCountdown] = useState(6);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (isCartOpen) return;

    const id = window.setTimeout(() => setCheckoutStep("cart"), 300);
    return () => window.clearTimeout(id);
  }, [isCartOpen]);

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
  const barangaysList =
    address.province && address.city ? PH_DATA[address.province].cities[address.city] : [];

  const processCheckout = useCallback(async () => {
    try {
      for (const item of cart) {
        await checkoutProduct(item.id, zone, fullName, phone);
      }
      setCheckoutStatus("success");
      clearCart();
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Please try again.");
      setCheckoutStatus("idle");
    }
  }, [cart, zone, fullName, phone, clearCart]);

  const handleActionClick = () => {
    if (checkoutStep === "cart") {
      setCheckoutStep("details");
      return;
    }

    setTouched(true);
    if (!isFormValid) return;

    if (paymentMethod === "Cash on Delivery") {
      setCheckoutStatus("processing");
      window.setTimeout(() => {
        void processCheckout();
      }, 1500);
    } else {
      setCheckoutStatus("qr");
      setQrCountdown(6);
    }
  };

  useEffect(() => {
    if (checkoutStatus !== "qr") return;

    const id = window.setTimeout(() => {
      if (qrCountdown > 0) {
        setQrCountdown((count) => count - 1);
        return;
      }

      setCheckoutStatus("processing");
      void processCheckout();
    }, qrCountdown > 0 ? 1000 : 0);

    return () => window.clearTimeout(id);
  }, [checkoutStatus, qrCountdown, processCheckout]);

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = checkoutStep === "details" ? (zone === "Zone 1" ? 120 : 180) : 0;
  const fieldClass =
    "w-full bg-transparent border-b py-3 text-sm focus:border-black transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";

  return (
    <>
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm transition-opacity"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#F5F4F0] flex flex-col shadow-2xl overscroll-contain"
      >
        <div className="flex justify-between items-center p-8 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {checkoutStep === "details" && checkoutStatus === "idle" && (
              <button
                type="button"
                aria-label="Back to bag"
                onClick={() => setCheckoutStep("cart")}
                className="text-xs uppercase tracking-widest hover:-translate-x-1 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Back
              </button>
            )}
            <h2 className="text-2xl font-playfair italic">
              {checkoutStep === "cart" ? "Your Bag" : "Checkout"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
            className="text-2xl font-light hover:rotate-90 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            x
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {checkoutStatus === "success" ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-24 h-24 rounded-full border border-black flex items-center justify-center mb-10 text-xl font-light">
                OK
              </div>
              <h2 className="text-4xl font-playfair mb-4 italic">Confirmed</h2>
              <p className="text-sm text-gray-500 mb-12 leading-relaxed">
                {paymentMethod === "Cash on Delivery"
                  ? "Your order has been placed. Please prepare the exact amount upon delivery."
                  : "Your selection has been archived. You will receive a notification shortly."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutStatus("idle");
                  setIsCartOpen(false);
                }}
                className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Return to Boutique
              </button>
            </div>
          ) : checkoutStatus === "qr" ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-8 font-bold">
                Pay via {paymentMethod}
              </p>
              <div className="bg-black p-8 mb-8">
                <div className="w-48 h-48 flex flex-wrap opacity-80" aria-hidden="true">
                  {[...Array(64)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-[12.5%] h-[12.5%] ${
                        i % 3 === 0 || i % 7 === 0 ? "bg-white" : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-5xl font-playfair mb-4 italic tabular-nums">{qrCountdown}s</p>
              <p className="text-xs text-gray-500 text-center uppercase tracking-widest leading-loose">
                Awaiting confirmation...
                <br />
                Keep this window active.
              </p>
              <button
                type="button"
                onClick={() => setCheckoutStatus("idle")}
                className="mt-10 text-[9px] uppercase tracking-widest border-b border-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Cancel Payment
              </button>
            </div>
          ) : checkoutStatus === "processing" ? (
            <div className="h-full flex flex-col items-center justify-center py-10" aria-live="polite">
              <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Processing Order...</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 font-playfair italic text-lg mb-6">Your bag is empty.</p>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                  Selected Items ({cart.length})
                </p>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={`flex gap-6 items-center group bg-white p-4 border border-black/5 transition-[opacity,transform] ${
                        checkoutStep === "details" ? "opacity-60 scale-95 origin-left" : ""
                      }`}
                    >
                      <div className="w-16 aspect-[3/4] bg-gray-100 overflow-hidden relative shrink-0">
                        <Image
                          src={item.image || fallbackImage}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[11px] font-bold uppercase tracking-tight truncate">{item.name}</h3>
                        <p className="text-xs text-gray-400 font-medium tabular-nums">
                          {pesoFormatter.format(item.price)}
                        </p>
                        {checkoutStep === "cart" && (
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-[9px] uppercase tracking-widest text-red-800 mt-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {checkoutStep === "details" && (
                <div className="space-y-8 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                      Delivery Details
                    </p>
                    {touched && !isFormValid && (
                      <span className="text-[9px] text-red-500 uppercase font-bold tracking-tighter">
                        Required Info
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    <input
                      aria-label="Full name"
                      name="fullName"
                      autoComplete="name"
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`${fieldClass} ${
                        touched && fullName.trim().length < 3 ? "border-red-400" : "border-black/10"
                      }`}
                    />
                    <input
                      aria-label="Phone number"
                      name="phone"
                      autoComplete="tel"
                      inputMode="tel"
                      type="tel"
                      placeholder="Phone Number (10 digits)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className={`${fieldClass} ${
                        touched && phone.length < 10 ? "border-red-400" : "border-black/10"
                      }`}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        aria-label="Province"
                        name="province"
                        value={address.province}
                        onChange={(e) =>
                          setAddress({ ...address, province: e.target.value, city: "", barangay: "" })
                        }
                        className={`${fieldClass} ${
                          touched && !address.province ? "border-red-400 text-red-400" : "border-black/10"
                        }`}
                      >
                        <option value="">Province</option>
                        {provincesList.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      <select
                        aria-label="City"
                        name="city"
                        value={address.city}
                        disabled={!address.province}
                        onChange={(e) => setAddress({ ...address, city: e.target.value, barangay: "" })}
                        className={`${fieldClass} disabled:opacity-30 ${
                          touched && !address.city ? "border-red-400 text-red-400" : "border-black/10"
                        }`}
                      >
                        <option value="">City</option>
                        {citiesList.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        aria-label="Barangay"
                        name="barangay"
                        value={address.barangay}
                        disabled={!address.city}
                        onChange={(e) => setAddress({ ...address, barangay: e.target.value })}
                        className={`${fieldClass} disabled:opacity-30 ${
                          touched && !address.barangay ? "border-red-400 text-red-400" : "border-black/10"
                        }`}
                      >
                        <option value="">Barangay</option>
                        {barangaysList.map((barangay) => (
                          <option key={barangay} value={barangay}>
                            {barangay}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label="House number and street"
                        name="street"
                        autoComplete="street-address"
                        type="text"
                        placeholder="House No. / Street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className={`${fieldClass} ${
                          touched && address.street.length < 5 ? "border-red-400" : "border-black/10"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Shipping</p>
                    <div className="space-y-2">
                      {[
                        { zone: "Zone 1", label: "Metro Same Day", price: 120 },
                        { zone: "Zone 2", label: "Provincial 3-5 Days", price: 180 },
                      ].map((option) => (
                        <label
                          key={option.zone}
                          className={`flex items-center justify-between p-4 border rounded-sm cursor-pointer transition-colors ${
                            zone === option.zone ? "border-black bg-white" : "border-black/5 hover:border-black/20"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingZone"
                              checked={zone === option.zone}
                              onChange={() => setZone(option.zone)}
                              className="accent-black"
                            />
                            <span className="text-xs uppercase font-bold tracking-tight">{option.label}</span>
                          </span>
                          <span className="text-xs font-medium tabular-nums">
                            {pesoFormatter.format(option.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`text-[10px] uppercase tracking-tight py-3 border rounded-sm transition-colors font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${
                            paymentMethod === method
                              ? "border-black bg-black text-white"
                              : "border-black/10 text-gray-500 hover:border-black/30"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {cart.length > 0 && checkoutStatus === "idle" && (
          <div className="p-8 bg-white border-t border-black/5 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-end mb-8">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Subtotal</span>
              <div className="text-right">
                {shipping > 0 && (
                  <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">
                    + {pesoFormatter.format(shipping)} Shipping
                  </p>
                )}
                <span className="text-2xl font-dm-sans font-medium tabular-nums">
                  {pesoFormatter.format(subtotal + shipping)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleActionClick}
              className={`w-full py-5 text-[10px] uppercase tracking-widest font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black ${
                checkoutStep === "cart" || isFormValid
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {checkoutStep === "cart"
                ? "Proceed to Checkout"
                : isFormValid
                  ? paymentMethod === "Cash on Delivery"
                    ? "Place Order"
                    : `Pay via ${paymentMethod}`
                  : "Complete Details"}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
