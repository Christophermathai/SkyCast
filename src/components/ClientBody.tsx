"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Home, Clock } from "lucide-react";
import { TemperatureUnitProvider } from "@/context/TemperatureUnitContext";
import { TemperatureToggle } from "@/components/ui/TemperatureToggle";
import { useWeather } from "@/context/WeatherContext";
import { useRef, useEffect, useCallback } from "react";

/**
 * Maps WMO weather codes to background videos.
 * Weather code is the PRIMARY selector. Temperature is only used
 * as a secondary hint for extreme cold with non-precipitation codes.
 */
function getVideoForWeather(code: number | null, temp: number | null): string {
  if (code === null) return "/Sunny.mp4";

  // --- Precipitation / severe codes ALWAYS take priority ---

  // Thunderstorm (95, 96, 99)
  if (code >= 95) return "/Thunderstrome.mp4";

  // Heavy snow from weather code (75, 86)
  if (code === 75 || code === 86) return "/Heavy Snow.mp4";

  // Light/moderate snow from weather code (71-73, 77, 85)
  if ((code >= 71 && code <= 73) || code === 77 || code === 85) return "/Ligth Snow.mp4";

  // Freezing rain / heavy rain (65-67, 82)
  if ((code >= 65 && code <= 67) || code === 82) return "/Heavy Rain.mp4";

  // Drizzle / light-moderate rain / showers (51-63, 80-81)
  if ((code >= 51 && code <= 63) || code === 80 || code === 81) return "/Light Rain.mp4";

  // --- Non-precipitation codes below ---
  // For these, extreme cold temperature overrides the visual
  // (e.g. Antarctica: code 3 "overcast" at -30°C → show snow)
  if (temp !== null && temp <= -15) return "/Heavy Snow.mp4";
  if (temp !== null && temp <= -5) return "/Ligth Snow.mp4";

  // Fog (45, 48)
  if (code === 45 || code === 48) return "/Foggy.mp4";

  // Overcast (3) / Partly cloudy (2)
  if (code === 2 || code === 3) return "/Overcast.mp4";

  // Clear / mainly clear (0, 1)
  return "/Sunny.mp4";
}

/**
 * Sidebar — memoized so temperature-unit toggles never re-render it.
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

/**
 * Single-video fade-out → swap → fade-in approach.
 * Only ONE video element is ever decoding at a time → no GPU contention.
 * Uses imperative DOM manipulation for the opacity transition to avoid
 * React re-renders triggering layout thrash on the video element.
 */
export function ClientBody({ children }: { children: React.ReactNode }) {
  const { weatherCode, temperature } = useWeather();
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentSrcRef = useRef("/Sunny.mp4");
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  // Set initial src once on mount — never via JSX so React can't stomp it
  useEffect(() => {
    if (videoRef.current && !mountedRef.current) {
      mountedRef.current = true;
      const initialSrc = getVideoForWeather(weatherCode, temperature);
      videoRef.current.src = initialSrc;
      currentSrcRef.current = initialSrc;
    }
  }, []);

  const swapVideo = useCallback((nextSrc: string) => {
    const video = videoRef.current;
    if (!video) return;
    if (nextSrc === currentSrcRef.current) return;

    // Cancel any in-progress transition so the latest search always wins
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);

    // Phase 1: Fade out (500ms)
    video.style.opacity = "0";

    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;

      // Phase 2: Swap src
      video.src = nextSrc;
      currentSrcRef.current = nextSrc;

      const onReady = () => {
        video.removeEventListener("canplay", onReady);
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
        // Phase 3: Fade in (500ms)
        video.style.opacity = "0.6";
      };

      // If the video is already cached / ready
      if (video.readyState >= 3) {
        onReady();
      } else {
        video.addEventListener("canplay", onReady);
        // Safety timeout in case canplay never fires
        safetyTimerRef.current = setTimeout(() => {
          video.removeEventListener("canplay", onReady);
          video.style.opacity = "0.6";
          safetyTimerRef.current = null;
        }, 4000);
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return; // skip on first render (handled by mount effect)
    const nextSrc = getVideoForWeather(weatherCode, temperature);
    swapVideo(nextSrc);
  }, [weatherCode, temperature, swapVideo]);

  return (
    <TemperatureUnitProvider>
      {/* Single Background Video — src managed entirely by refs, never by JSX */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-2]"
        style={{
          opacity: 0.6,
          transition: "opacity 600ms ease-in-out",
          pointerEvents: "none",
          willChange: "opacity",
        }}
      />

      {/* Global Glass Overlay */}
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px] z-[-1]" />

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
