"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, Cloud, Sun, CloudRain, CloudLightning, CloudSnow, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type WeatherData = any;

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState("");

  const fetchWeather = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { getWeather } = await import("@/lib/open-meteo");
      const data = await getWeather(lat, lon);
      
      if (!data || data.error) {
        throw new Error("Failed to fetch weather data");
      }
      
      setWeather(data);
      setLocationName(name);

      // Save to database
      await fetch('/api/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: name,
          latitude: lat,
          longitude: lon,
          startDate: new Date(),
          endDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days later
          weatherData: data,
        })
      });

    } catch (err: any) {
      setError(err.message || "An error occurred while fetching weather.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const { searchLocation } = await import("@/lib/open-meteo");
      const results = await searchLocation(query);
      
      if (!results || results.length === 0) {
        setError("Location not found. Please try another search.");
        setLoading(false);
        return;
      }

      const bestMatch = results[0];
      const name = `${bestMatch.name}${bestMatch.admin1 ? ', ' + bestMatch.admin1 : ''}, ${bestMatch.country}`;
      await fetchWeather(bestMatch.latitude, bestMatch.longitude, name);

    } catch (err) {
      setError("Failed to geocode location.");
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeather(latitude, longitude, "Current Location");
      },
      (err) => {
        setError("Unable to retrieve your location. " + err.message);
        setLoading(false);
      }
    );
  };

  const getWeatherIcon = (code: number, isDay: number = 1) => {
    if (code <= 3) return isDay ? <Sun className="w-16 h-16 text-yellow-400" /> : <Cloud className="w-16 h-16 text-slate-300" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-16 h-16 text-blue-400" />;
    if (code >= 71 && code <= 86) return <CloudSnow className="w-16 h-16 text-white" />;
    if (code >= 95) return <CloudLightning className="w-16 h-16 text-purple-400" />;
    return <Cloud className="w-16 h-16 text-slate-400" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Discover the Weather
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          Enter a city, zip code, or landmark. Or simply use your current location to get real-time accurate forecasts.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-xl relative mt-8 flex group">
          <input
            type="text"
            placeholder="Search location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-l-2xl py-4 pl-6 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-sm"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-r-2xl transition-colors flex items-center justify-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </form>

        <button 
          onClick={useCurrentLocation}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mt-4 transition-colors"
        >
          <MapPin className="w-5 h-5" /> Use my current location
        </button>
      </div>

      {error && (
        <div className="max-w-xl mx-auto bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p>{error}</p>
        </div>
      )}

      {weather && !loading && (
        <div className="mt-12 space-y-8">
          {/* Current Weather Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                {getWeatherIcon(weather.current.weather_code, weather.current.is_day)}
                <div>
                  <h2 className="text-3xl font-bold">{locationName}</h2>
                  <p className="text-slate-400">Current Weather</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-6xl font-black">{Math.round(weather.current.temperature_2m)}°</p>
                <div className="flex gap-4 text-slate-400 mt-2">
                  <span>Humidity: {weather.current.relative_humidity_2m}%</span>
                  <span>Wind: {weather.current.wind_speed_10m} km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <h3 className="text-2xl font-semibold mt-12 mb-6">5-Day Forecast</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {weather.daily.time.slice(1, 6).map((time: string, index: number) => (
              <div key={time} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center hover:bg-slate-800/60 transition-colors backdrop-blur-sm">
                <span className="text-slate-400 font-medium">{format(new Date(time), 'EEE')}</span>
                <span className="text-sm text-slate-500 mb-4">{format(new Date(time), 'MMM d')}</span>
                {getWeatherIcon(weather.daily.weather_code[index + 1])}
                <div className="mt-4 flex gap-3 text-lg">
                  <span className="font-bold">{Math.round(weather.daily.temperature_2m_max[index + 1])}°</span>
                  <span className="text-slate-500">{Math.round(weather.daily.temperature_2m_min[index + 1])}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
