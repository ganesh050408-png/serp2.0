import { getOrCreateDestination } from './destinations';

// ============================================================================
// Weather (feature G) — Open-Meteo, no API key required.
//
// getWeather() fetches current conditions + a 7-day forecast for a lat/lng and
// caches it briefly. deriveAlerts() turns that forecast into human travel
// warnings (heavy rain, thunderstorms, extreme heat, snow) for the banner.
// ============================================================================

export interface DayForecast {
  date: string; // ISO yyyy-mm-dd
  code: number;
  tMax: number;
  tMin: number;
  precipProb: number; // %
}

export interface CurrentWeather {
  temp: number;
  code: number;
  wind: number;
}

export interface WeatherData {
  current: CurrentWeather;
  daily: DayForecast[];
  fetchedAt: number;
}

export type AlertSeverity = 'info' | 'watch' | 'warning';

export interface WeatherAlert {
  severity: AlertSeverity;
  title: string;
  detail: string;
  date?: string;
}

// WMO weather interpretation codes → label + emoji.
const WMO: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Clear sky', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Rime fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌦️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  66: { label: 'Freezing rain', emoji: '🌧️' },
  67: { label: 'Freezing rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '❄️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  77: { label: 'Snow grains', emoji: '🌨️' },
  80: { label: 'Rain showers', emoji: '🌦️' },
  81: { label: 'Rain showers', emoji: '🌧️' },
  82: { label: 'Violent rain showers', emoji: '⛈️' },
  85: { label: 'Snow showers', emoji: '🌨️' },
  86: { label: 'Heavy snow showers', emoji: '❄️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm w/ hail', emoji: '⛈️' },
  99: { label: 'Severe thunderstorm', emoji: '⛈️' },
};

export function describeWeather(code: number): { label: string; emoji: string } {
  return WMO[code] ?? { label: 'Unknown', emoji: '🌡️' };
}

// Short-lived in-memory cache keyed by rounded coordinates.
const CACHE = new Map<string, WeatherData>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getWeather(lat: number, lng: number): Promise<WeatherData | null> {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cached = CACHE.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached;

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto&forecast_days=7`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.daily ?? {};
    const times: string[] = d.time ?? [];
    const daily: DayForecast[] = times.map((date, i) => ({
      date,
      code: d.weather_code?.[i] ?? 0,
      tMax: Math.round(d.temperature_2m_max?.[i] ?? 0),
      tMin: Math.round(d.temperature_2m_min?.[i] ?? 0),
      precipProb: d.precipitation_probability_max?.[i] ?? 0,
    }));
    const data: WeatherData = {
      current: {
        temp: Math.round(json.current?.temperature_2m ?? 0),
        code: json.current?.weather_code ?? 0,
        wind: Math.round(json.current?.wind_speed_10m ?? 0),
      },
      daily,
      fetchedAt: Date.now(),
    };
    CACHE.set(key, data);
    return data;
  } catch {
    return null;
  }
}

/** Convenience: resolve a city name to coordinates (via destinations) and fetch. */
export async function getWeatherForCity(city: string): Promise<WeatherData | null> {
  const dest = getOrCreateDestination(city);
  return getWeather(dest.lat, dest.lng);
}

const THUNDER = new Set([95, 96, 99, 82]);
const SNOW = new Set([71, 73, 75, 77, 85, 86]);

/**
 * Turn a forecast into actionable travel alerts. Looks at the next `horizon`
 * days (default 3) so travellers get a lead time without alarm fatigue.
 */
export function deriveAlerts(data: WeatherData, horizon = 3): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const window = data.daily.slice(0, horizon);

  for (const day of window) {
    const when = new Date(day.date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    if (THUNDER.has(day.code)) {
      alerts.push({
        severity: 'warning',
        title: 'Thunderstorms expected',
        detail: `${describeWeather(day.code).label} · plan indoor activities and keep travel flexible.`,
        date: when,
      });
    } else if (day.precipProb >= 70 || day.code === 65 || day.code === 81) {
      alerts.push({
        severity: 'warning',
        title: 'Heavy rain likely',
        detail: `${day.precipProb}% chance of rain · pack waterproofs and allow extra transit time.`,
        date: when,
      });
    } else if (day.precipProb >= 45) {
      alerts.push({
        severity: 'watch',
        title: 'Showers possible',
        detail: `${day.precipProb}% chance of rain · carry an umbrella.`,
        date: when,
      });
    }

    if (day.tMax >= 38) {
      alerts.push({
        severity: 'warning',
        title: 'Extreme heat',
        detail: `Highs near ${day.tMax}°C · hydrate and avoid midday sun.`,
        date: when,
      });
    } else if (day.tMax >= 34) {
      alerts.push({
        severity: 'watch',
        title: 'Hot afternoon',
        detail: `Highs around ${day.tMax}°C · schedule outdoor plans for morning or evening.`,
        date: when,
      });
    }

    if (SNOW.has(day.code)) {
      alerts.push({
        severity: 'watch',
        title: 'Snowfall expected',
        detail: `${describeWeather(day.code).label} · roads may be affected, check transfers.`,
        date: when,
      });
    } else if (day.tMin <= 2) {
      alerts.push({
        severity: 'info',
        title: 'Near-freezing nights',
        detail: `Lows around ${day.tMin}°C · pack warm layers.`,
        date: when,
      });
    }
  }

  const rank: Record<AlertSeverity, number> = { warning: 0, watch: 1, info: 2 };
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
