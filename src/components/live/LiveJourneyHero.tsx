import { MapPin, Navigation, Clock, Sun, Sparkles, ArrowRight } from 'lucide-react';

interface LiveJourneyHeroProps {
  onOpenMap: () => void;
  onOpenAI: () => void;
}

export const LiveJourneyHero = ({ onOpenMap, onOpenAI }: LiveJourneyHeroProps) => {
  return (
    <section className="relative z-10 w-full pt-8 sm:pt-12 pb-12 sm:pb-16 px-6 sm:px-8 max-w-7xl mx-auto">
      {/* Top Active Status & Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-mono text-emerald-900 animate-fade-rise">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">LIVE JOURNEY</span>
          <span className="text-emerald-300">•</span>
          <span>DAY 4 OF 10</span>
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
            ACTIVE REGION · WESTERN COAST
          </span>
          <h1
            className="font-instrument font-normal text-5xl sm:text-7xl md:text-8xl text-[#000000] tracking-headline leading-headline select-none animate-fade-rise"
            style={{ letterSpacing: '-2.46px', lineHeight: '0.95' }}
          >
            Goa · Mumbai · Delhi
          </h1>
          <p className="font-inter text-base sm:text-lg text-[#6F6F6F] mt-4 leading-relaxed max-w-2xl animate-fade-rise-delay">
            You're currently in <strong className="text-[#000000] font-medium">Panaji, Goa</strong>.
            Here is your live itinerary, nearby health & transit services, and real-time guidance.
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
              <span className="text-[#000000] font-semibold">15:30 (In 1 hr 15 min)</span>
            </div>
            <h3 className="font-instrument text-2xl sm:text-3xl text-[#000000] mt-0.5">
              Fort Aguada & Lighthouse Promontory
            </h3>
            <p className="text-xs text-[#6F6F6F] font-inter mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-neutral-400" /> 4.2 km from your position
              </span>
              <span>•</span>
              <span>14 min by car</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              const query = encodeURIComponent('Fort Aguada, Candolim, Goa, India');
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
