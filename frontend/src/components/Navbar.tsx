"use client";

import Link from "next/link";

function Logo() {
  return (
    <svg width="38" height="28" viewBox="0 0 38 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Archivé Logo">
      <path
        d="M4 24 C4 24, 10 4, 19 4 C28 4, 34 24, 34 24"
        stroke="#111110" strokeWidth="1.2" strokeLinecap="round" fill="none"
      />
      <path
        d="M9 24 C9 24, 13 12, 19 12 C25 12, 29 24, 29 24"
        stroke="#111110" strokeWidth="1.2" strokeLinecap="round" fill="none"
      />
      <line x1="4" y1="24" x2="34" y2="24" stroke="#111110" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

export default function Navbar({ onCartOpen, cartCount }: { onCartOpen: () => void; cartCount: number }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-warm-white/90 backdrop-blur-xl border-b border-[#E0DED8] flex items-center justify-between px-12 h-16">
      <div className="flex items-center gap-2.5">
        <Logo />
        <span className="font-playfair text-[18px] font-light tracking-[0.22em] uppercase">
          Archivé
        </span>
      </div>

      <div className="flex gap-9">
        {["Collections", "Lookbook", "About"].map((item) => (
          <span key={item} className="font-dm-sans text-[11px] font-normal tracking-[0.18em] uppercase text-muted-gray cursor-pointer transition-colors hover:text-charcoal">
            {item}
          </span>
        ))}
      </div>

      <button onClick={onCartOpen} className="flex items-center gap-2 font-dm-sans text-[11px] tracking-[0.18em] text-charcoal uppercase hover:opacity-70 transition-opacity">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cartCount > 0 && (
          <span className="bg-charcoal text-warm-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-medium">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
}
