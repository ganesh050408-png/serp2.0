import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';

interface DashboardHeroProps {
  onPlanNew: () => void;
  onExplore: () => void;
  onOpenTrain?: () => void;
}

export const DashboardHero = ({ onPlanNew, onExplore, onOpenTrain }: DashboardHeroProps) => {
  // Key state to reset and trigger exactly one train journey animation on every mouse enter
  const [trainKey, setTrainKey] = useState<number | null>(null);

  const handleMouseEnter = () => {
    setTrainKey(Date.now());
  };

  const handleMouseLeave = () => {
    // Keep clean state
  };

  return (
    <section id="hero" className="relative z-10 w-full pt-8 sm:pt-14 pb-16 sm:pb-20 text-center px-6">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        {/* Subtle greeting tag + Train Experience Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 animate-fade-rise">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100/90 text-xs text-[#6F6F6F] font-inter">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Good morning, Aravind</span>
            <span className="text-neutral-300">•</span>
            <span>Your next journey awaits</span>
          </div>

          {onOpenTrain && (
            <button
              type="button"
              onClick={onOpenTrain}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-xs"
            >
              <span>✦ Lumora Scenic Train Window</span>
            </button>
          )}
        </div>

        {/* Headline */}
        <h1
          className="font-instrument font-normal text-5xl sm:text-7xl md:text-8xl text-[#000000] tracking-headline leading-headline max-w-4xl select-none animate-fade-rise"
          style={{ letterSpacing: '-2.46px', lineHeight: '0.95' }}
        >
          Where will your next journey take you?
        </h1>

        {/* Supporting description */}
        <p className="font-inter text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F] animate-fade-rise-delay">
          Plan unforgettable journeys, organize every detail, and experience the freedom
          of having everything in one place.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-fade-rise-delay-2">
          {/* Plan a New Journey CTA with Cinematic Train Hover Animation */}
          <button
            type="button"
            onClick={onPlanNew}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="group relative overflow-hidden flex items-center justify-center rounded-full px-9 sm:px-12 py-4 sm:py-4.5 text-sm sm:text-base font-medium bg-[#000000] text-white shadow-md shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            {/* Cinematic Train Animation Layer */}
            {trainKey !== null && (
              <div
                key={trainKey}
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-[2]"
              >
                {/* Train Vehicle + Motion Trail Container */}
                <div className="absolute top-1/2 -translate-y-1/2 flex items-center animate-train-pass">
                  {/* Subtle horizontal motion trail */}
                  <div className="w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-white/20 to-white/70 mr-1.5 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />

                  {/* Elegant luxury locomotive SVG silhouette */}
                  <div className="relative flex items-center justify-center text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
                    <svg
                      className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Streamlined train chassis */}
                      <path d="M4 15h13a3 3 0 0 0 3-3V9a2 2 0 0 0-2-2H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1Z" />
                      <path d="M4 11h14" />
                      <circle cx="7.5" cy="15" r="1" />
                      <circle cx="13.5" cy="15" r="1" />
                      {/* Subtle headlight ray */}
                      <path d="M20 10l3 1v1l-3 1" strokeWidth="1.2" opacity="0.8" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Stable Content Layer */}
            <span className="relative z-[3] flex items-center justify-center gap-2">
              <Plus className="w-4 h-4 text-white" />
              <span>Plan a New Journey</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onExplore}
            className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-[#000000] hover:text-[#6F6F6F] px-4 py-2 transition-colors cursor-pointer group"
          >
            <span>Explore Destinations</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
