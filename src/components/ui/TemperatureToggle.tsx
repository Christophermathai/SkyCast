"use client";

import { useTemperatureUnit } from "@/context/TemperatureUnitContext";
import { useState } from "react";

export function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperatureUnit();
  const [bouncing, setBouncing] = useState(false);

  const handleToggle = () => {
    toggleUnit();
    setBouncing(true);
    setTimeout(() => setBouncing(false), 600);
  };

  const isFahrenheit = unit === "F";

  return (
    <button
      onClick={handleToggle}
      className="relative flex items-center w-12 h-12 shrink-0 justify-center cursor-pointer group/toggle"
      title={`Switch to ${isFahrenheit ? "Celsius" : "Fahrenheit"}`}
      aria-label={`Temperature unit: ${unit}. Click to switch.`}
    >
      {/* Pill track */}
      <div
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-300 ${
          isFahrenheit
            ? "bg-gradient-to-r from-orange-500/30 to-amber-500/30 border-orange-500/40"
            : "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-500/40"
        } border`}
      >
        {/* Thumb */}
        <div
          className={`absolute top-[2px] w-4 h-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-[8px] font-black tracking-tight leading-none
            ${bouncing ? "animate-elastic-bounce" : ""}
            ${isFahrenheit
              ? "left-[22px] bg-gradient-to-br from-orange-400 to-amber-500 text-orange-950"
              : "left-[2px] bg-gradient-to-br from-blue-400 to-cyan-500 text-blue-950"
            }`}
        >
          {unit}
        </div>
      </div>
    </button>
  );
}
