import { useState } from 'react';
import { ArrowRight, Calendar, Users, MapPin, CheckCircle2, Plus } from 'lucide-react';
import { StoredJourney } from '../../services/travelStorage';

interface CurrentJourneyCardProps {
  journey?: StoredJourney | null;
  onSelectJourney?: (id: string) => void;
  onPlanNew?: () => void;
  onContinueJourney?: () => void;
}

export const CurrentJourneyCard = ({
  journey,
  onSelectJourney,
  onPlanNew,
  onContinueJourney,
}: CurrentJourneyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // If no active journey exists, render an empty state
  if (!journey) {
    return (
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 mb-16">
        <div className="bg-white border border-dashed border-[#E7E5E2] rounded-[24px] p-10 sm:p-14 text-center max-w-4xl mx-auto shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F5] border border-[#E7E5E2] flex items-center justify-center mb-5">
            <MapPin className="w-5 h-5 text-[#6F6F6F]" />
          </div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            ACTIVE TRIP STUDIO
          </span>
          <h2 className="font-instrument text-3xl sm:text-4xl text-[#000000] mb-3">
            No active journey planned yet
          </h2>
          <p className="font-inter text-sm text-[#6F6F6F] max-w-md mx-auto mb-8 leading-relaxed">
            Create your first custom itinerary to start tracking reservations, dates, budgets, and daily routes.
          </p>
          {onPlanNew && (
            <button
              type="button"
              onClick={onPlanNew}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 bg-[#000000] text-white text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Plan a New Journey</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  const durationDays = journey.itinerary?.length || (journey.destinations?.length ? journey.destinations.length * 2 : 1);
  const citiesCount = journey.destinations?.length || 1;
  const activitiesCount = journey.itinerary?.reduce((acc, d) => acc + (d.activities?.length || 0), 0) || 0;
  const dateDisplay = journey.datesDecided
    ? 'DATES FLEXIBLE'
    : journey.startDate && journey.endDate
    ? `${journey.startDate} — ${journey.endDate}`
    : 'UPCOMING VOYAGE';

  const badgeLocation = journey.destinations?.[0]?.region
    ? `${journey.destinations[0].region}, ${journey.destinations[0].country}`
    : journey.destination;

  const handleAction = () => {
    if (onSelectJourney) {
      onSelectJourney(journey.id);
    } else if (onContinueJourney) {
      onContinueJourney();
    }
  };

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 mb-20 animate-fade-rise">
      {/* Editorial Section Label */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F]">
          YOUR CURRENT JOURNEY
        </span>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {journey.status || 'Active Planning'}
        </span>
      </div>

      {/* Main Cinematic Card */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-white border border-[#E7E5E2] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] card-hover-effect flex flex-col lg:flex-row group"
      >
        {/* Visual Cinematic Image Area */}
        <div className="relative w-full lg:w-[62%] h-[340px] sm:h-[420px] lg:h-[480px] overflow-hidden bg-neutral-900">
          <img
            src={journey.coverImage || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1600&auto=format&fit=crop'}
            alt={journey.destination}
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
              isHovered ? 'scale-[1.03]' : 'scale-100'
            }`}
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-black/60" />

          {/* Badge over image */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-medium text-[#000000] shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-neutral-800" />
            <span>{badgeLocation}</span>
          </div>

          {/* Overlay info on mobile/tablet */}
          <div className="absolute bottom-6 left-6 right-6 text-white lg:hidden">
            <h3 className="font-instrument text-3xl sm:text-4xl text-white mb-1">
              {journey.destination}
            </h3>
            <p className="text-xs text-white/80 font-inter">
              {dateDisplay} · {journey.travelers} {journey.travelers === 1 ? 'TRAVELER' : 'TRAVELERS'}
            </p>
          </div>
        </div>

        {/* Card Details Panel */}
        <div className="w-full lg:w-[38%] p-8 sm:p-10 flex flex-col justify-between bg-[#FAF8F5]/70 border-t lg:border-t-0 lg:border-l border-[#E7E5E2]">
          <div>
            {/* Top metadata */}
            <div className="hidden lg:flex items-center gap-3 text-xs font-mono uppercase tracking-wider text-[#6F6F6F] mb-3 flex-wrap">
              <span className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{dateDisplay}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5" /> {journey.travelers} {journey.travelers === 1 ? 'TRAVELER' : 'TRAVELERS'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/5 border border-black/10 text-[10px] text-black font-medium">
                {journey.travelType === 'family' ? '👨‍👩‍👧‍👦 Family' : journey.travelType === 'solo' ? '👤 Solo' : '👥 Friends'}
              </span>
            </div>

            {/* City Title */}
            <h2 className="hidden lg:block font-instrument text-4xl sm:text-5xl text-[#000000] leading-none mb-4">
              {journey.destination}
            </h2>

            <p className="text-sm text-[#6F6F6F] leading-relaxed mb-6 font-inter">
              {journey.style
                ? `A bespoke voyage exploring ${journey.style.toLowerCase()} and customized daily excursions.`
                : 'An editorial travel itinerary curated through Adhira private travel studio.'}
            </p>

            {/* Key Trip Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#E7E5E2] my-4">
              <div>
                <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Duration</span>
                <span className="font-instrument text-2xl text-[#000000]">{durationDays} Days</span>
                <span className="block text-[10px] text-[#6F6F6F]">{Math.max(0, durationDays - 1)} Nights</span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Destinations</span>
                <span className="font-instrument text-2xl text-[#000000]">{citiesCount} {citiesCount === 1 ? 'City' : 'Cities'}</span>
                <span className="block text-[10px] text-[#6F6F6F]">{activitiesCount} Activities</span>
              </div>
              <div>
                <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Budget</span>
                <span className="font-instrument text-2xl text-[#000000]">
                  {journey.budgetValue?.label || (journey.budget ? `₹${journey.budget.toLocaleString()}` : 'Flexible')}
                </span>
                <span className="block text-[10px] text-[#6F6F6F]">Estimated</span>
              </div>
            </div>
          </div>

          {/* CTA & Actions */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 rounded-full py-4 text-sm font-medium bg-[#000000] text-white hover:bg-neutral-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] shadow-sm cursor-pointer group"
            >
              <span>View Journey Details</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Trip Status & Minimal Progress */}
      <div className="mt-6 bg-white border border-[#E7E5E2] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F]">
              JOURNEY PROGRESS
            </span>
            <span className="text-xs font-medium text-[#000000] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {durationDays} OF {durationDays} DAYS STRUCTURED
            </span>
          </div>

          {/* Thin Progress Bar */}
          <div className="w-full h-1.5 bg-[#E7E5E2] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#000000] rounded-full transition-all duration-500 ease-out"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E5E2]">
          <div>
            <span className="block text-[11px] font-mono text-[#6F6F6F] uppercase">Status</span>
            <span className="font-instrument text-2xl text-[#000000]">Ready to Travel</span>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-neutral-100 text-[#6F6F6F] border border-[#E7E5E2]">
            Confirmed
          </span>
        </div>
      </div>
    </section>
  );
};
