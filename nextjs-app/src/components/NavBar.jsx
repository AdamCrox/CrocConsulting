"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function CrocLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="croc-grad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#7C8FF5" />
          <stop offset="100%" stopColor="#9C5CF5" />
        </linearGradient>
      </defs>
      <path d="M58 8 C30 8,6 28,6 50 C6 72,30 92,58 92 L44 74 C28 72,20 62,20 50 C20 38,28 28,44 26Z" fill="url(#croc-grad)" />
      <path d="M52 30 C38 32,32 40,32 50 C32 60,38 68,52 70 L44 60 C40 58,38 54,38 50 C38 46,40 42,44 40Z" fill="white" fillOpacity="0.93" />
    </svg>
  );
}

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-14 transition-all duration-300 ${
        scrolled
          ? "nav-glass border-b border-apple-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <CrocLogo size={28} />
          <span className="text-[17px] font-bold text-apple-text-primary tracking-tight">CROC</span>
          <span className="text-[17px] font-normal text-apple-text-secondary tracking-tight">CONSULTING</span>
        </Link>

        <div className="flex items-center gap-1">
          {["Services", "How it works", "About"].map((label) => (
            <button
              key={label}
              onClick={() => scrollTo(label.toLowerCase().replace(/ /g, "-"))}
              className="px-3 py-2 text-[13px] font-medium text-apple-text-secondary hover:text-apple-text-primary transition-colors bg-transparent border-none cursor-pointer"
            >
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-apple-border mx-2" />
          <Link
            href="/portal"
            className="px-4 py-2 text-[13px] font-medium text-apple-text-secondary hover:text-apple-text-primary transition-colors no-underline"
          >
            Track my quote
          </Link>
          <Link
            href="/quote"
            className="btn-primary !px-5 !py-2 !text-[13px] !min-h-0"
          >
            Get a quote
          </Link>
        </div>
      </div>
    </nav>
  );
}
