const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear Sky", icon: "sunny-outline" },
  1: { label: "Mainly Clear", icon: "sunny-outline" },
  2: { label: "Partly Cloudy", icon: "partly-sunny-outline" },
  3: { label: "Overcast", icon: "cloud-outline" },
  45: { label: "Foggy", icon: "cloud-outline" },
  48: { label: "Depositing Rime Fog", icon: "cloud-outline" },
  51: { label: "Light Drizzle", icon: "rainy-outline" },
  53: { label: "Moderate Drizzle", icon: "rainy-outline" },
  55: { label: "Dense Drizzle", icon: "rainy-outline" },
  56: { label: "Light Freezing Drizzle", icon: "snow-outline" },
  57: { label: "Dense Freezing Drizzle", icon: "snow-outline" },
  61: { label: "Slight Rain", icon: "rainy-outline" },
  63: { label: "Moderate Rain", icon: "rainy-outline" },
  65: { label: "Heavy Rain", icon: "rainy-outline" },
  66: { label: "Light Freezing Rain", icon: "snow-outline" },
  67: { label: "Heavy Freezing Rain", icon: "snow-outline" },
  71: { label: "Slight Snow", icon: "snow-outline" },
  73: { label: "Moderate Snow", icon: "snow-outline" },
  75: { label: "Heavy Snow", icon: "snow-outline" },
  77: { label: "Snow Grains", icon: "snow-outline" },
  80: { label: "Slight Rain Showers", icon: "rainy-outline" },
  81: { label: "Moderate Rain Showers", icon: "rainy-outline" },
  82: { label: "Violent Rain Showers", icon: "rainy-outline" },
  85: { label: "Slight Snow Showers", icon: "snow-outline" },
  86: { label: "Heavy Snow Showers", icon: "snow-outline" },
  95: { label: "Thunderstorm", icon: "thunderstorm-outline" },
  96: { label: "Thunderstorm with Slight Hail", icon: "thunderstorm-outline" },
  99: { label: "Thunderstorm with Heavy Hail", icon: "thunderstorm-outline" },
};

function getSuitability(code: number, temp: number): string {
  if (code >= 95) return "Thunderstorms — best to stay indoors";
  if (code >= 71) return "Snowy — bundle up!";
  if (code >= 61) return "Rainy — bring an umbrella";
  if (code >= 51) return "Light rain — still ok to explore";
  if (code >= 45) return "Foggy — visibility may be low";
  if (temp > 30) return "Very hot — stay hydrated!";
  if (temp > 25) return "Warm — perfect for outdoor activities";
  if (temp > 18) return "Pleasant — great for exploring";
  if (temp > 10) return "Cool — light jacket recommended";
  return "Cold — dress warmly";
}

export interface WeatherData {
  temp: number;
  condition: string;
  feelsLike: number;
  wind: number;
  humidity: number;
  activitySuitability: string;
  icon: string;
}

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto",
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params}`);
  if (!res.ok) throw new Error("Weather fetch failed");

  const json = await res.json();
  const current = json.current;

  const code = current.weather_code as number;
  const wmo = WMO_CODES[code] ?? { label: "Unknown", icon: "cloud-outline" };
  const temp = Math.round(current.temperature_2m);
  const feelsLike = Math.round(current.apparent_temperature);

  return {
    temp,
    condition: wmo.label,
    feelsLike,
    wind: Math.round(current.wind_speed_10m),
    humidity: current.relative_humidity_2m,
    activitySuitability: getSuitability(code, temp),
    icon: wmo.icon,
  };
}
