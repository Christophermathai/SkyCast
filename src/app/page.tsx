"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, Cloud, Sun, CloudRain, CloudLightning, CloudSnow, AlertCircle, Wind, Droplets, Thermometer, Eye, Gauge, Activity } from "lucide-react";
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
      <div className="flex flex-col items-center text-center">
        <h1 className="text-6xl md:text-7xl font-display font-extrabold tracking-tighter mb-2 flex items-baseline justify-center">
          Discover the <em className="italic font-normal tracking-normal text-7xl md:text-8xl ml-3 text-slate-200" style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>Weather.</em>
        </h1>
        <p className="text-slate-300 font-serif text-xl mb-4 leading-relaxed" style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
          Enter a city, zip code, or landmark. Or simply use your current location to get real-time accurate forecasts.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-xl relative flex group mb-2 h-20">
          <input
            type="text"
            placeholder="Search location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-l-2xl h-full leading-[80px] pl-6 pr-12 text-3xl tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-[2px] serif-placeholder placeholder:text-xl placeholder:text-slate-500 text-center"
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            className="bg-slate-800/80 border-y border-slate-700 px-5 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all border-l border-slate-700 group/loc"
            title="Use current location"
          >
            <MapPin className="w-6 h-6 group-hover/loc:scale-110 transition-transform" />
          </button>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-6 rounded-r-2xl transition-all flex items-center justify-center border-y border-r border-blue-600">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </form>
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
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:shadow-blue-500/10 transition-shadow duration-500">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:animate-shimmer pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                {getWeatherIcon(weather.current.weather_code, weather.current.is_day)}
                <div>
                  <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tighter">{locationName}</h2>
                  <p className="text-slate-400 font-medium">Current Weather</p>
                </div>
              </div>
              <div className="text-center md:text-right relative z-10">
                <p className="text-8xl font-display font-black tracking-tighter drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">{Math.round(weather.current.temperature_2m)}°</p>
                <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1 text-slate-400 mt-3 text-xs font-medium uppercase tracking-wider">
                  <span>Feels like: <span className="font-display text-lg tracking-normal">{Math.round(weather.current.apparent_temperature)}°</span></span>
                  <span>Humidity: <span className="font-display text-lg tracking-normal">{weather.current.relative_humidity_2m}%</span></span>
                  <span>Wind: <span className="font-display text-lg tracking-normal">{weather.current.wind_speed_10m}</span> km/h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-green-500/10">
              <Activity className="w-8 h-8 text-green-400 mb-2" />
              <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">AQI (US)</span>
              <span className="text-4xl font-display tracking-tight font-bold">{weather.current.us_aqi ?? 'N/A'}</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10">
              <Sun className="w-8 h-8 text-yellow-500 mb-2" />
              <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">UV INDEX</span>
              <span className="text-4xl font-display tracking-tight font-bold">{weather.daily?.uv_index_max?.[0] ?? 'N/A'}</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
              <Gauge className="w-8 h-8 text-purple-400 mb-2" />
              <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">PRESSURE</span>
              <span className="text-4xl font-display tracking-tight font-bold">{weather.current.surface_pressure} <span className="text-base text-slate-400">hPa</span></span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
              <Eye className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">VISIBILITY</span>
              <span className="text-4xl font-display tracking-tight font-bold">{(weather.current.visibility / 1000).toFixed(1)} <span className="text-base text-slate-400">km</span></span>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <h3 className="text-5xl font-display font-bold tracking-tight mt-12 mb-6">5-Day Forecast</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {weather.daily.time.slice(1, 6).map((time: string, index: number) => (
              <div key={time} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center hover:bg-slate-800/60 transition-colors backdrop-blur-sm">
                <span className="text-slate-300 font-display text-3xl tracking-tight mt-2">{format(new Date(time), 'EEE')}</span>
                <span className="text-sm font-medium text-slate-500 mb-4">{format(new Date(time), 'MMM d')}</span>
                {getWeatherIcon(weather.daily.weather_code[index + 1])}
                <div className="mt-4 flex gap-3 font-display tracking-tight items-baseline">
                  <span className="font-bold text-white text-2xl">{Math.round(weather.daily.temperature_2m_max[index + 1])}°</span>
                  <span className="text-slate-500 text-xl">{Math.round(weather.daily.temperature_2m_min[index + 1])}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
