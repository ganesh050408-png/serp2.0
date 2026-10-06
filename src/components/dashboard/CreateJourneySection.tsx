import { useState } from 'react';
import { Search, Users, IndianRupee, Sparkles, ArrowRight, Check } from 'lucide-react';

interface CreateJourneySectionProps {
  onCreateTrip?: (tripDetails: { destination: string; budget: string; travelers: string; style: string }) => void;
}

const POPULAR_SUGGESTIONS = ['Goa', 'Ladakh', 'Rajasthan', 'Kerala', 'Mumbai', 'Kyoto'];

export const CreateJourneySection = ({ onCreateTrip }: CreateJourneySectionProps) => {
  const [destination, setDestination] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [budget, setBudget] = useState('₹50,000');
  const [travelStyle, setTravelStyle] = useState('Coastal & Heritage');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDestination = destination.trim() || 'Goa';

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      if (onCreateTrip) {
        onCreateTrip({
          destination: finalDestination,
          budget,
          travelers,
          style: travelStyle,
        });
      }
      setTimeout(() => setShowSuccess(false), 3000);
    }, 400);
  };

  return (
    <section id="create-journey" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20">
      <div className="relative bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] overflow-hidden p-8 sm:p-14 lg:p-16">
        {/* Decorative subtle gradient backdrop */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-neutral-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-3">
            BESPOKE ITINERARY BUILDER
          </span>
          <h2 className="font-instrument text-4xl sm:text-6xl md:text-7xl text-[#000000] tracking-headline leading-none">
            Dream somewhere new.
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 mb-10 max-w-xl mx-auto leading-relaxed">
            Tell Aethera where you want to go. We'll help you turn the idea into a crafted journey.
          </p>

          {/* Interactive Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Large Pill Input for Destination */}
            <div className="relative">
              <div className="flex items-center bg-white border border-[#E7E5E2] rounded-full px-6 py-4 shadow-sm focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <Search className="w-5 h-5 text-[#6F6F6F] mr-3 shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where do you want to go? (e.g. Goa, Ladakh, Rajasthan...)"
                  className="w-full bg-transparent text-[#000000] placeholder:text-neutral-400 font-inter text-base sm:text-lg focus:outline-none"
                />
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <span className="text-[11px] font-mono text-[#6F6F6F]">Suggestions:</span>
                {POPULAR_SUGGESTIONS.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      destination.toLowerCase() === city.toLowerCase()
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-[#6F6F6F] border-[#E7E5E2] hover:border-black hover:text-black'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Parameter Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Travelers */}
              <div className="bg-white border border-[#E7E5E2] rounded-2xl p-4">
                <label className="text-[11px] font-mono text-[#6F6F6F] uppercase mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Travelers
                </label>
                <select
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#000000] focus:outline-none cursor-pointer"
                >
                  <option value="1">1 Solo Traveler</option>
                  <option value="2">2 Travelers (Couple/Duo)</option>
                  <option value="3">3 Travelers (Small Group)</option>
                  <option value="4">4 Travelers (Quartet)</option>
                  <option value="6">6+ Travelers (Family/Group)</option>
                </select>
              </div>

              {/* Target Budget */}
              <div className="bg-white border border-[#E7E5E2] rounded-2xl p-4">
                <label className="text-[11px] font-mono text-[#6F6F6F] uppercase mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5" /> Budget Estimate
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#000000] focus:outline-none cursor-pointer"
                >
                  <option value="₹30,000">₹30,000 (Minimalist)</option>
                  <option value="₹50,000">₹50,000 (Balanced)</option>
                  <option value="₹80,000">₹80,000 (Premium)</option>
                  <option value="₹1,50,000">₹1,50,000+ (Luxury Estate)</option>
                </select>
              </div>

              {/* Travel Style */}
              <div className="bg-white border border-[#E7E5E2] rounded-2xl p-4">
                <label className="text-[11px] font-mono text-[#6F6F6F] uppercase mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-[#000000] focus:outline-none cursor-pointer"
                >
                  <option value="Coastal & Heritage">Coastal & Heritage</option>
                  <option value="Architectural & Art">Architectural & Art</option>
                  <option value="Slow Mountain Sanctuary">Slow Mountain Sanctuary</option>
                  <option value="Gastronomy & Culinary">Gastronomy & Culinary</option>
                </select>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex flex-col items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-full px-12 py-4 text-base font-medium bg-[#000000] text-white hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Synthesizing Journey...</span>
                  </>
                ) : (
                  <>
                    <span>Create Journey</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {showSuccess && (
                <div className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-full flex items-center gap-1.5 animate-fade-rise">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Journey synthesized! Loading your customized itinerary workspace...</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
