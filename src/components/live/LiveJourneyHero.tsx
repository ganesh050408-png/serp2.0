import React from 'react';
import { MapPin, Navigation, Clock, Sun, Sparkles, ArrowRight } from 'lucide-react';
import type { StoredJourney } from '../../services/travelStorage';

interface LiveJourneyHeroProps {
  journey: StoredJourney | null;
  journeys?: StoredJourney[];
  onSelectJourney?: (id: string) => void;
  onOpenMap: () => void;
  onOpenAI: () => void;
}

export const LiveJourneyHero: React.FC<LiveJourneyHeroProps> = ({
  journey,
  journeys = [],
  onSelectJourney,
  onOpenMap,
  onOpenAI,
}) => {
  // Extract dynamic details from current active journey
  const journeyTitle =
    journey?.destination ||
    journey?.destinations?.map((d) => d.name || d.city).filter(Boolean).join(' · ') ||
    'Your Active Journey';

  const currentCity =
    journey?.destinations?.[0]?.city ||
    journey?.destinations?.[0]?.name ||
    journey?.city ||
    journey?.destination ||
    'Current Destination';

  const regionStyle = journey?.style
    ? journey.style.toUpperCase()
    : journey?.destinations?.[0]?.country
    ? `${journey.destinations[0].country.toUpperCase()} SANCTUARY`
    : 'BESPOKE TRAVEL CORRIDOR';

  const totalDays = journey?.itinerary?.length || 5;

  // Extract real next checkpoint from current journey's activities or attractions
  const firstDay = journey?.itinerary?.[0];
  const firstAct = firstDay?.activities?.[0];
  const nextCheckpoint =
    (typeof firstAct === 'string'
      ? firstAct
      : firstAct?.name) ||
    journey?.destinations?.[0]?.attractions?.[0] ||
    `Arrival & check-in at ${currentCity} haven`;

  return (
    <section className="relative z-10 w-full pt-8 sm:pt-12 pb-12 sm:pb-16 px-6 sm:px-8 max-w-7xl mx-auto">
      {/* Top Active Status & Journey Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-mono text-emerald-900 animate-fade-rise">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">LIVE JOURNEY</span>
            <span className="text-emerald-300">•</span>
            <span>DAY 1 OF {totalDays}</span>
          </div>

          {/* Quick Journey Switcher if multiple journeys exist */}
          {journeys.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white border border-[#E7E5E2] rounded-full px-3 py-1 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F6F6F]">Trip:</span>
              <select
                value={journey?.id || ''}
                onChange={(e) => onSelectJourney?.(e.target.value)}
                className="bg-transparent text-xs font-mono font-medium text-black focus:outline-none cursor-pointer"
              >
                {journeys.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.destination || 'Journey'} ({j.itinerary?.length || 5}d)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Live Weather & Local Time */}
        <div className="flex items-center gap-4 text-xs font-mono text-[#6F6F6F]">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            28°C · Balmy & Clear
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            14:15 Local Time
          </span>
        </div>
      </div>

      {/* Main Editorial Headline */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[#E7E5E2]">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            ACTIVE REGION · {regionStyle}
          </span>
          <h1
            className="font-instrument font-normal text-5xl sm:text-7xl md:text-8xl text-[#000000] tracking-headline leading-headline select-none animate-fade-rise"
            style={{ letterSpacing: '-2.46px', lineHeight: '0.95' }}
          >
            {journeyTitle}
          </h1>
          <p className="font-inter text-base sm:text-lg text-[#6F6F6F] mt-4 leading-relaxed max-w-2xl animate-fade-rise-delay">
            You're currently exploring <strong className="text-[#000000] font-medium">{currentCity}</strong>.
            Here is your live day itinerary, nearby health & transit services, and real-time guidance.
          </p>
        </div>

        {/* Quick Assistant Callout */}
        <div className="flex items-center gap-3 animate-fade-rise-delay-2">
          <button
            type="button"
            onClick={onOpenAI}
            className="flex items-center gap-2 rounded-full px-6 py-3.5 bg-[#000000] text-white text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Travel Companion</span>
          </button>
        </div>
      </div>

      {/* Next Up Checkpoint Banner */}
      <div className="mt-8 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-rise-delay">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] uppercase">
              <span>Next Checkpoint</span>
              <span>•</span>
              <span className="text-[#000000] font-semibold">Today's Highlight</span>
            </div>
            <h3 className="font-instrument text-2xl sm:text-3xl text-[#000000] mt-0.5">
              {nextCheckpoint}
            </h3>
            <p className="text-xs text-[#6F6F6F] font-inter mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" /> {currentCity}
              </span>
              <span>•</span>
              <span>In-destination route</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              const query = encodeURIComponent(`${nextCheckpoint}, ${currentCity}`);
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
            }}
            className="flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-medium transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Get Directions</span>
          </button>

          <button
            type="button"
            onClick={onOpenMap}
            className="flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-white border border-[#E7E5E2] hover:border-black text-xs font-medium text-[#000000] transition-colors cursor-pointer"
          >
            <span>View on Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
