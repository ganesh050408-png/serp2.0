import { useState } from 'react';
import { ArrowRight, Calendar, Users, MapPin, CheckCircle2 } from 'lucide-react';

interface CurrentJourneyCardProps {
  onContinueJourney?: () => void;
}

export const CurrentJourneyCard = ({ onContinueJourney }: CurrentJourneyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 mb-20">
      {/* Editorial Section Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F]">
          YOUR CURRENT JOURNEY
        </span>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active Planning
        </span>
      </div>

      {/* Main Cinematic Card */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-white border border-[#E7E5E2] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] card-hover-effect flex flex-col lg:flex-row group"
      >
        {/* Visual Cinematic Image Area (55-65% of Card) */}
        <div className="relative w-full lg:w-[62%] h-[340px] sm:h-[420px] lg:h-[480px] overflow-hidden bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop"
            alt="Goa and coastal India sunset"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isHovered ? 'scale-[1.03]' : 'scale-100'
            }`}
          />
          {/* Subtle soft white & dark editorial gradients for perfect legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/60" />
          
          {/* Badge over image */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-[#000000] shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-neutral-800" />
            <span>Western Coast & Capital Circuit</span>
          </div>

          {/* Quick overlay info on mobile/tablet */}
          <div className="absolute bottom-6 left-6 right-6 text-white lg:hidden">
            <h3 className="font-instrument text-3xl sm:text-4xl text-white mb-1">
              Goa · Mumbai · Delhi
            </h3>
            <p className="text-xs text-white/80 font-inter">12 JUN — 21 JUN 2026 · 4 TRAVELERS</p>
          </div>
        </div>

        {/* Card Details Panel */}
        <div className="w-full lg:w-[38%] p-8 sm:p-10 flex flex-col justify-between bg-[#FAF8F5]/70 border-t lg:border-t-0 lg:border-l border-[#E7E5E2]">
          <div>
            {/* Top metadata */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-[#6F6F6F] mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> 12 JUN — 21 JUN 2026
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 4 TRAVELERS
              </span>
            </div>

            {/* City Title */}
            <h2 className="hidden lg:block font-instrument text-4xl sm:text-5xl text-[#000000] leading-none mb-4">
              Goa · Mumbai · Delhi
            </h2>

            <p className="text-sm text-[#6F6F6F] leading-relaxed mb-6 font-inter">
              An architectural and coastal voyage transitioning from serene Arabian Sea shores to
              vibrant urban art districts and Mughal heritage.
            </p>

            {/* Key Trip Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#E7E5E2] my-4">
              <div>
                <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Duration</span>
                <span className="font-instrument text-2xl text-[#000000]">10 Days</span>
                <span className="block text-[10px] text-[#6F6F6F]">9 Nights</span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Destinations</span>
                <span className="font-instrument text-2xl text-[#000000]">3 Cities</span>
                <span className="block text-[10px] text-[#6F6F6F]">12 Activities</span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Budget</span>
                <span className="font-instrument text-2xl text-[#000000]">₹54,800</span>
                <span className="block text-[10px] text-[#6F6F6F]">of ₹60,000</span>
              </div>
            </div>
          </div>

          {/* CTA & Next Stop */}
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs text-[#6F6F6F] mb-3">
              <span>Next Checkpoint: <strong className="text-[#000000] font-medium">Baga Beach Sunset</strong></span>
              <span className="text-neutral-400">Day 3</span>
            </div>

            <button
              type="button"
              onClick={onContinueJourney}
              className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-medium bg-[#000000] text-white hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] shadow-sm cursor-pointer group"
            >
              <span>Continue Journey</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 7: Trip Status & Minimal Progress */}
      <div className="mt-6 bg-white border border-[#E7E5E2] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F]">
              JOURNEY PROGRESS
            </span>
            <span className="text-xs font-medium text-[#000000] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              8 OF 10 DAYS PLANNED
            </span>
          </div>

          {/* Thin Progress Bar */}
          <div className="w-full h-1.5 bg-[#E7E5E2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#000000] rounded-full transition-all duration-500 ease-out"
              style={{ width: '80%' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E5E2]">
          <div>
            <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Remaining Budget</span>
            <span className="font-instrument text-2xl text-[#000000]">₹5,200</span>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 text-[#6F6F6F] border border-[#E7E5E2]">
            Within Budget
          </span>
        </div>
      </div>
    </section>
  );
};
