import { useState } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';

interface StopDetail {
  city: string;
  code: string;
  journeyId?: string;
  days: string;
  activities: number;
  cost: string;
  highlights: string;
  xPercent: number;
  yPercent: number;
}

interface JourneyMapProps {
  onSelectCity?: (city: string, journeyId?: string) => void;
  onOpenLiveMap?: () => void;
}

const ROUTE_STOPS: StopDetail[] = [
  {
    city: 'Chennai',
    code: 'MAA',
    journeyId: 'chennai',
    days: 'Departure Point',
    activities: 1,
    cost: '₹7,000',
    highlights: 'Origin departure & coastal rail connection',
    xPercent: 65,
    yPercent: 82,
  },
  {
    city: 'Goa',
    code: 'GOI',
    journeyId: '1',
    days: '3 Days',
    activities: 6,
    cost: '₹12,500',
    highlights: 'Fontainhas heritage architecture, catamaran & beach coves',
    xPercent: 32,
    yPercent: 68,
  },
  {
    city: 'Mumbai',
    code: 'BOM',
    journeyId: 'mumbai',
    days: '3 Days',
    activities: 4,
    cost: '₹16,800',
    highlights: 'Art Deco precinct, Kala Ghoda galleries & coastal promenade',
    xPercent: 28,
    yPercent: 48,
  },
  {
    city: 'Delhi',
    code: 'DEL',
    journeyId: 'delhi',
    days: '4 Days',
    activities: 5,
    cost: '₹18,500',
    highlights: 'Humayun’s Tomb, Mughal gardens & Lodhi art district',
    xPercent: 42,
    yPercent: 20,
  },
];

export const JourneyMap = ({ onSelectCity, onOpenLiveMap }: JourneyMapProps) => {
  const [selectedStop, setSelectedStop] = useState<StopDetail>(ROUTE_STOPS[1]); // Goa default

  const handleExplore = () => {
    if (onSelectCity) {
      onSelectCity(selectedStop.city, selectedStop.journeyId);
    } else if (onOpenLiveMap) {
      onOpenLiveMap();
    }
  };

  return (
    <section id="map-section" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            GEOGRAPHIC TRAJECTORY
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
            Follow the journey.
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-md">
            The spatial narrative mapping your route across the Indian subcontinent.
          </p>
        </div>

        {/* Route breadcrumbs */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#6F6F6F] overflow-x-auto pb-2">
          {ROUTE_STOPS.map((s, idx) => (
            <div key={s.code} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStop(s)}
                className={`transition-colors cursor-pointer ${
                  selectedStop.code === s.code
                    ? 'text-[#000000] font-bold underline underline-offset-4'
                    : 'hover:text-[#000000]'
                }`}
              >
                {s.city.toUpperCase()}
              </button>
              {idx < ROUTE_STOPS.length - 1 && <span className="text-neutral-300">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Abstract Map Canvas Container */}
      <div className="relative bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] overflow-hidden p-6 sm:p-12 shadow-sm min-h-[460px] flex flex-col lg:flex-row gap-8 items-center justify-between">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000000 0.75px, transparent 0.75px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Left / Top Abstract Route Canvas */}
        <div className="relative w-full lg:w-3/5 h-[340px] sm:h-[400px] flex items-center justify-center">
          {/* Subtle topography contour lines svg */}
          <svg
            className="absolute inset-0 w-full h-full text-neutral-300/70 pointer-events-none"
            viewBox="0 0 500 400"
            fill="none"
          >
            {/* Route Path connecting the 4 stops */}
            <path
              d="M 325 328 Q 230 300 160 272 Q 130 220 140 192 Q 170 120 210 80"
              stroke="#000000"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
            {/* Soft background topographic loops */}
            <circle cx="210" cy="80" r="45" stroke="#E7E5E2" strokeWidth="1" />
            <circle cx="140" cy="192" r="60" stroke="#E7E5E2" strokeWidth="1" />
            <circle cx="160" cy="272" r="50" stroke="#E7E5E2" strokeWidth="1" />
            <circle cx="325" cy="328" r="40" stroke="#E7E5E2" strokeWidth="1" />
          </svg>

          {/* Interactive Route Markers */}
          {ROUTE_STOPS.map((stop) => {
            const isSelected = selectedStop.code === stop.code;
            return (
              <div
                key={stop.code}
                style={{
                  top: `${stop.yPercent}%`,
                  left: `${stop.xPercent}%`,
                }}
                onClick={() => setSelectedStop(stop)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#000000] text-white scale-125 shadow-lg'
                      : 'bg-white text-[#000000] border border-[#E7E5E2] hover:scale-110 hover:border-black'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-1.5 font-mono text-[11px] whitespace-nowrap px-2 py-0.5 rounded-full backdrop-blur-md transition-colors ${
                    isSelected
                      ? 'bg-[#000000] text-white font-medium'
                      : 'bg-white/90 text-[#6F6F6F] group-hover:text-black'
                  }`}
                >
                  {stop.city}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Info Box for Selected Marker */}
        <div className="relative z-10 w-full lg:w-2/5 bg-white border border-[#E7E5E2] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#6F6F6F]">
              LOCATION DOSSIER
            </span>
            <span className="text-xs font-mono bg-neutral-100 text-[#000000] px-2.5 py-1 rounded">
              {selectedStop.code}
            </span>
          </div>

          <h3 className="font-instrument text-4xl text-[#000000] leading-none mb-1">
            {selectedStop.city}
          </h3>
          <span className="text-xs font-mono text-neutral-500 block mb-4">
            {selectedStop.days} · {selectedStop.activities} Curated Stops
          </span>

          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter leading-relaxed mb-6">
            {selectedStop.highlights}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
            <div>
              <span className="block text-[10px] font-mono text-[#6F6F6F] uppercase">Allocated Budget</span>
              <span className="font-instrument text-2xl text-[#000000]">{selectedStop.cost}</span>
            </div>

            <button
              type="button"
              onClick={handleExplore}
              className="flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
            >
              <span>Explore {selectedStop.city}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
