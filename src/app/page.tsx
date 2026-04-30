"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, Cloud, Sun, CloudRain, CloudLightning, CloudSnow, AlertCircle, Wind, Droplets, Thermometer, Eye, Gauge, Activity } from "lucide-react";
import { format } from "date-fns";

type WeatherData = any;

import { SplitText } from "@/components/ui/SplitText";
import { CountUp } from "@/components/ui/CountUp";

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

  const hasWeather = !!weather;

  return (
    <div className={`w-full relative flex flex-col justify-center min-h-[calc(100vh-4rem)]`}>

      {/* Left Column: Hero & Search */}
      <div
        className={`w-full z-20 flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]
          lg:absolute lg:top-1/2 lg:-translate-y-1/2
          ${hasWeather
            ? 'lg:left-0 lg:translate-x-0 lg:w-[320px] xl:w-[380px] items-center lg:items-start text-center lg:text-left'
            : 'lg:left-1/2 lg:-translate-x-1/2 lg:w-[600px] max-w-2xl mx-auto lg:mx-0 items-center text-center'
          }`}
      >
        <div className={`transition-all duration-1000 flex flex-col w-full ${hasWeather ? 'items-center lg:items-start text-center lg:text-left' : 'items-center text-center'}`}>
          <h1 className={`font-display font-extrabold tracking-tighter mb-1 transition-all duration-1000 ${hasWeather ? 'text-5xl lg:text-left' : 'text-6xl md:text-7xl text-center'}`}>
            <span className="inline-block">
              <SplitText text="Discover the" delay={30} />
            </span>
            <em className={`italic font-normal tracking-normal text-slate-200 transition-all duration-1000 inline-block ${hasWeather ? 'block text-6xl mt-1' : 'text-7xl md:text-8xl ml-3'}`} style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
              <SplitText text="Weather." delay={10} delayOffset={60} />
            </em>
          </h1>
          <p className={`text-slate-300 font-serif leading-relaxed transition-all duration-1000 ${hasWeather ? 'text-lg mb-6' : 'text-xl mb-8'}`} style={{ fontFamily: 'var(--font-instrument-serif), serif' }}>
            <SplitText
              text="Enter a city, zip code, or landmark. Or simply use your current location to get real-time accurate forecasts."
              delay={15}
              delayOffset={200}
            />
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className={`w-full relative flex group transition-all duration-1000 animate-in fade-in slide-in-from-bottom-8 ${hasWeather ? 'h-16' : 'h-20 mb-1 max-w-xl'}`}
          style={{ animationDuration: '800ms', animationDelay: '300ms', animationFillMode: 'both' }}
        >
          <input
            type="text"

            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full bg-slate-800/50 border border-slate-700 rounded-l-2xl h-full pl-6 pr-12 tracking-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-[2px] serif-placeholder placeholder:text-slate-500 ${hasWeather ? 'text-xl leading-[64px] lg:text-left' : 'text-3xl leading-[80px] text-center placeholder:text-xl'}`}
          />
          <button
            type="button"
            onClick={useCurrentLocation}
            className="bg-slate-800/80 border-y border-slate-700 px-5 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all border-l border-slate-700 group/loc"
            title="Use current location"
          >
            <MapPin className={`transition-transform group-hover/loc:scale-110 ${hasWeather ? 'w-5 h-5' : 'w-6 h-6'}`} />
          </button>
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-6 rounded-r-2xl transition-all flex items-center justify-center border-y border-r border-blue-600">
            {loading ? <Loader2 className={`animate-spin ${hasWeather ? 'w-5 h-5' : 'w-6 h-6'}`} /> : <Search className={`${hasWeather ? 'w-5 h-5' : 'w-6 h-6'}`} />}
          </button>
        </form>

        {error && (
          <div className="w-full max-w-xl bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div
        className={`w-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]
          lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-0
          ${hasWeather
            ? 'lg:w-[calc(100%-350px)] xl:w-[calc(100%-420px)] opacity-100 mt-8 lg:mt-0'
            : 'lg:w-[calc(100%-350px)] xl:w-[calc(100%-420px)] opacity-0 pointer-events-none hidden lg:block'
          }`}
      >
        {weather && (
          <div
            className="w-full animate-in fade-in duration-700 space-y-6"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:shadow-blue-500/10 transition-shadow duration-500">
              <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:animate-shimmer pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  {getWeatherIcon(weather.current.weather_code, weather.current.is_day)}
                  <div>
                    <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter">{locationName}</h2>
                    <p className="text-slate-400 font-medium">Current Weather</p>
                  </div>
                </div>
                <div className="text-center md:text-right relative z-10">
                  <p className="text-7xl font-display font-black tracking-tighter drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                    <CountUp to={Math.round(weather.current.temperature_2m)} delay={0.4} duration={1.5} />°
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1 text-slate-400 mt-2 text-xs font-medium uppercase tracking-wider">
                    <span>Feels like: <span className="font-display text-lg tracking-normal">{Math.round(weather.current.apparent_temperature)}°</span></span>
                    <span>Humidity: <span className="font-display text-lg tracking-normal">{weather.current.relative_humidity_2m}%</span></span>
                    <span>Wind: <span className="font-display text-lg tracking-normal">{weather.current.wind_speed_10m}</span> km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-green-500/10">
                <Activity className="w-6 h-6 text-green-400 mb-1" />
                <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">AQI (US)</span>
                <span className="text-3xl font-display tracking-tight font-bold">{weather.current.us_aqi ?? 'N/A'}</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-yellow-500/10">
                <Sun className="w-6 h-6 text-yellow-500 mb-1" />
                <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">UV INDEX</span>
                <span className="text-3xl font-display tracking-tight font-bold">{weather.daily?.uv_index_max?.[0] ?? 'N/A'}</span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-purple-500/10">
                <Gauge className="w-6 h-6 text-purple-400 mb-1" />
                <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">PRESSURE</span>
                <span className="text-3xl font-display tracking-tight font-bold">{weather.current.surface_pressure} <span className="text-base text-slate-400">hPa</span></span>
              </div>
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-800/60 transition-all duration-300 shadow-lg hover:shadow-blue-500/10">
                <Eye className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-slate-400 text-sm tracking-wider text-xs font-semibold mb-1">VISIBILITY</span>
                <span className="text-3xl font-display tracking-tight font-bold">{(weather.current.visibility / 1000).toFixed(1)} <span className="text-base text-slate-400">km</span></span>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <h3 className="text-3xl font-display font-bold tracking-tight mb-2">5-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {weather.daily.time.slice(1, 6).map((time: string, index: number) => (
                <div key={time} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col items-center hover:bg-slate-800/60 transition-colors backdrop-blur-sm">
                  <span className="text-slate-300 font-display text-2xl tracking-tight mt-1">{format(new Date(time), 'EEE')}</span>
                  <span className="text-sm font-medium text-slate-500 mb-2">{format(new Date(time), 'MMM d')}</span>
                  <div className="scale-75 -mt-2 -mb-2">
                    {getWeatherIcon(weather.daily.weather_code[index + 1])}
                  </div>
                  <div className="mt-2 flex gap-3 font-display tracking-tight items-baseline">
                    <span className="font-bold text-white text-xl">{Math.round(weather.daily.temperature_2m_max[index + 1])}°</span>
                    <span className="text-slate-500 text-lg">{Math.round(weather.daily.temperature_2m_min[index + 1])}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
