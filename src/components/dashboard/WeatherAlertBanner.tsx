import { useEffect, useState } from 'react';
import { AlertTriangle, CloudSun, Wind } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import {
  getWeatherForCity,
  deriveAlerts,
  describeWeather,
  type WeatherData,
  type WeatherAlert,
} from '../../services/weather';

interface WeatherAlertBannerProps {
  /** City to report on. Defaults to the active trip's first city. */
  city?: string;
  className?: string;
}

const severityBar: Record<WeatherAlert['severity'], string> = {
  warning: 'bg-[#F598F2]',
  watch: 'bg-neutral-400',
  info: 'bg-neutral-200',
};

const dayLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short' });

export const WeatherAlertBanner = ({ city, className = '' }: WeatherAlertBannerProps) => {
  const { activeTrip } = useTrip();
  const resolvedCity = city ?? activeTrip?.cities[0] ?? '';

  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resolvedCity) return;
    let alive = true;
    setLoading(true);
    getWeatherForCity(resolvedCity).then((d) => {
      if (!alive) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [resolvedCity]);

  if (!resolvedCity) return null;

  if (loading) {
    return (
      <section className={`w-full max-w-7xl mx-auto px-6 sm:px-8 ${className}`}>
        <div className="rounded-3xl border border-[#E7E5E2] bg-white px-6 py-5 animate-pulse">
          <span className="font-mono text-xs uppercase tracking-widest text-[#6F6F6F]">
            Checking the skies over {resolvedCity}…
          </span>
        </div>
      </section>
    );
  }

  if (!data) return null; // network unavailable — fail quietly

  const alerts = deriveAlerts(data);
  const current = describeWeather(data.current.code);

  return (
    <section className={`w-full max-w-7xl mx-auto px-6 sm:px-8 ${className}`}>
      <div className="rounded-3xl border border-[#E7E5E2] bg-white shadow-sm overflow-hidden">
        {/* Current + forecast strip */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 p-6 sm:p-7">
          <div className="flex items-center gap-4 shrink-0">
            <span className="text-4xl leading-none" aria-hidden>
              {current.emoji}
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-instrument text-4xl text-[#000000] leading-none">
                  {data.current.temp}°
                </span>
                <span className="font-inter text-sm text-[#6F6F6F]">{current.label}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                  {resolvedCity}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#6F6F6F]">
                  <Wind className="w-3 h-3" /> {data.current.wind} km/h
                </span>
              </div>
            </div>
          </div>

          {/* 7-day strip */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 min-w-max lg:justify-end">
              {data.daily.map((d) => {
                const info = describeWeather(d.code);
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center gap-1 rounded-2xl border border-[#E7E5E2] bg-[#FAF8F5] px-3 py-2 min-w-[58px]"
                    title={info.label}
                  >
                    <span className="font-mono text-[10px] uppercase text-[#6F6F6F]">
                      {dayLabel(d.date)}
                    </span>
                    <span className="text-lg leading-none" aria-hidden>
                      {info.emoji}
                    </span>
                    <span className="font-mono text-[11px] text-[#000000]">{d.tMax}°</span>
                    <span className="font-mono text-[10px] text-[#6F6F6F]">{d.tMin}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts / all-clear */}
        <div className="border-t border-[#E7E5E2] px-6 sm:px-7 py-4">
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-[#6F6F6F]">
              <CloudSun className="w-4 h-4" />
              <span className="font-inter text-sm">
                No weather advisories — clear conditions for the next few days.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-stretch gap-3">
                  <span className={`w-1 rounded-full shrink-0 ${severityBar[a.severity]}`} />
                  <div className="flex items-start gap-2 py-0.5">
                    {a.severity === 'warning' && (
                      <AlertTriangle className="w-4 h-4 mt-0.5 text-[#000000] shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-inter text-sm font-medium text-[#000000]">
                          {a.title}
                        </span>
                        {a.date && (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#6F6F6F]">
                            {a.date}
                          </span>
                        )}
                      </div>
                      <span className="font-inter text-xs text-[#6F6F6F]">{a.detail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
