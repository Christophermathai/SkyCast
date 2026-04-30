"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Clock } from "lucide-react";
import { TemperatureUnitProvider } from "@/context/TemperatureUnitContext";
import { TemperatureToggle } from "@/components/ui/TemperatureToggle";

/**
 * Sidebar extracted and memoized so temperature-unit state changes
 * never cause it to re-render (which was resetting CSS transitions).
 */
const Sidebar = memo(function Sidebar() {
  return (
    <aside
      className="group/sidebar w-16 hover:w-56 border-r border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 h-screen flex flex-col py-8 px-2 z-50 overflow-hidden shrink-0 transition-[width] duration-300 ease-out will-change-[width]"
    >
      <Link href="/" className="flex items-center w-full mb-10 overflow-hidden">
        <div className="w-12 h-12 shrink-0 flex items-center justify-center">
          <div>
            <Image
              src="/Logo.png"
              alt="logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </div>
        <span
          style={{ fontFamily: 'var(--font-thunder)' }}
          className="text-3xl top-[5px] leading-none tracking-wide uppercase opacity-0 max-w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:max-w-[200px] group-hover/sidebar:ml-3 transition-[opacity,max-width,margin] duration-300 ease-out overflow-hidden"
        >
          SkyCast
        </span>
      </Link>

      <nav className="flex flex-col gap-2 w-full">
        <Link href="/" className="flex items-center w-full text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-[color,background-color] duration-200 group overflow-hidden">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span
            style={{ fontFamily: 'var(--font-thunder)' }}
            className="leading-none tracking-wider uppercase opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-3 transition-[opacity,width,margin] duration-300 ease-out font-medium text-lg whitespace-nowrap overflow-hidden"
          >
            Dashboard
          </span>
        </Link>
        <Link href="/history" className="flex items-center w-full text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-[color,background-color] duration-200 group overflow-hidden">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <Clock className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span
            style={{ fontFamily: 'var(--font-thunder)' }}
            className="leading-none tracking-wider uppercase opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-3 transition-[opacity,width,margin] duration-300 ease-out font-medium text-lg whitespace-nowrap overflow-hidden"
          >
            History
          </span>
        </Link>
      </nav>

      {/* Temperature Unit Toggle — pinned to bottom */}
      <div className="mt-auto flex items-center w-full overflow-hidden">
        <TemperatureToggle />
        <span
          style={{ fontFamily: 'var(--font-thunder)' }}
          className="leading-none tracking-wider uppercase opacity-0 w-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-1 transition-[opacity,width,margin] duration-300 ease-out font-medium text-sm whitespace-nowrap overflow-hidden text-slate-400"
        >
          °C / °F
        </span>
      </div>
    </aside>
  );
});

export function ClientBody({ children }: { children: React.ReactNode }) {
  return (
    <TemperatureUnitProvider>
      {/* Looping Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-70"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      {/* Global Glass Overlay */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[-1]" />

      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <main className="max-w-7xl mx-auto px-4 md:px-12 py-8 w-full min-h-screen">
          {children}
        </main>
      </div>
    </TemperatureUnitProvider>
  );
}
