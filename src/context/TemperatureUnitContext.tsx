"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Unit = "C" | "F";

type TemperatureUnitContextType = {
  unit: Unit;
  toggleUnit: () => void;
  convert: (celsius: number) => number;
  label: string;
};

const TemperatureUnitContext = createContext<TemperatureUnitContextType | undefined>(undefined);

export function TemperatureUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<Unit>("C");

  const toggleUnit = useCallback(() => {
    setUnit((prev) => (prev === "C" ? "F" : "C"));
  }, []);

  const convert = useCallback(
    (celsius: number) => {
      if (unit === "F") return Math.round(celsius * 9 / 5 + 32);
      return Math.round(celsius);
    },
    [unit]
  );

  const label = unit === "C" ? "°C" : "°F";

  return (
    <TemperatureUnitContext.Provider value={{ unit, toggleUnit, convert, label }}>
      {children}
    </TemperatureUnitContext.Provider>
  );
}

export function useTemperatureUnit() {
  const context = useContext(TemperatureUnitContext);
  if (!context) {
    throw new Error("useTemperatureUnit must be used within a TemperatureUnitProvider");
  }
  return context;
}
