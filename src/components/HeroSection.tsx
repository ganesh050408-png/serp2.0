import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onBeginJourney?: () => void;
}

export const HeroSection = ({ onBeginJourney }: HeroSectionProps) => {
  return (
    <section className="relative z-10 w-full flex-1 flex flex-col items-center justify-center text-center px-6 py-8">
      {/* Headline */}
      <h1
        className="font-instrument font-normal text-5xl sm:text-7xl md:text-8xl max-w-7xl text-[#000000] animate-fade-rise select-none"
        style={{
          lineHeight: '0.95',
          letterSpacing: '-2.46px',
        }}
      >
        Plan every <span className="italic text-[#6F6F6F]">journey,</span> explore{' '}
        <span className="italic text-[#6F6F6F]">every destination.</span>
      </h1>

      {/* Description */}
      <p className="font-inter text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F] animate-fade-rise-delay">
        Adhira brings destination discovery, day-by-day itineraries, and transit planning together in one clear space.
        Organize your routes, schedule daily activities, and travel with confidence.
      </p>

      {/* Hero CTA Button */}
      <div className="mt-12 animate-fade-rise-delay-2">
        <button
          type="button"
          onClick={onBeginJourney}
          className="group relative inline-flex items-center gap-3 rounded-full px-12 sm:px-14 py-4 sm:py-5 text-base font-medium bg-neutral-950 hover:bg-black text-white shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer overflow-hidden border border-neutral-800"
        >
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform ease-out pointer-events-none" />
          <span>Begin Journey</span>
          <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
        </button>
      </div>
    </section>
  );
};
