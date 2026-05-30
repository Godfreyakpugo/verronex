// src/components/sections/PromoBanner.jsx
import { Link } from "react-router-dom";
import GlassCard from "../ui/GlassCard";

export default function PromoBanner() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Decorative Glow behind the banner */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <GlassCard className="relative p-8 md:p-16 border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/20 to-black/40 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden text-left">
        {/* Abstract Background Elements */}
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 border border-fuchsia-500/10 rounded-full pointer-events-none"></div>
        <div className="absolute right-[-5%] top-[-10%] w-96 h-96 border border-fuchsia-500/5 rounded-full pointer-events-none"></div>

        <div className="relative z-10 w-full lg:max-w-2xl">
          <span className="inline-block px-4 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold tracking-widest uppercase mb-6">
            Limited Stock Available
          </span>

          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
            Upgrade Your Hustle with <br />
            <span className="text-fuchsia-500 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-fuchsia-600">
              Premium Performance
            </span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
            Get up to 20% off on our hand-picked collection of clean UK used
            laptops, premium smartphones, and accessories. Click below to
            explore unmatched performance values today.
          </p>

          <Link
            to="/deals"
            className="inline-block bg-white text-black hover:bg-fuchsia-500 hover:text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl"
          >
            Claim Offer Now
          </Link>
        </div>

        {/* Visual Element (Right Side) */}
        <div className="relative z-10 hidden lg:block">
          <div className="relative group">
            {/* A "floating" glass tag — Aligned to exactly 20% off */}
            <div className="absolute -top-4 -left-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl animate-bounce duration-[3000ms]">
              <p className="text-fuchsia-400 font-bold">Up to 20% off!</p>
            </div>

            {/* Subtle light streak and tech emblem */}
            <div className="w-[300px] h-[300px] rounded-full border-2 border-fuchsia-500/20 flex items-center justify-center">
              <div className="w-[200px] h-[200px] rounded-full bg-fuchsia-500/10 blur-3xl"></div>
              <svg
                className="absolute w-48 h-48 text-fuchsia-500/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={0.5}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
