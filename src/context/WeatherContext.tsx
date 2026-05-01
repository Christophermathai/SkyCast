"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type WeatherContextType = {
  weatherCode: number | null;
  temperature: number | null;
  setWeatherData: (code: number | null, temp: number | null) => void;
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [temperature, setTemperature] = useState<number | null>(null);

  const setWeatherData = (code: number | null, temp: number | null) => {
    setWeatherCode(code);
    setTemperature(temp);
  };

  return (
    <WeatherContext.Provider value={{ weatherCode, temperature, setWeatherData }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
