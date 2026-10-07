import { useState } from 'react';
import { Calendar, Users, MapPin, Plus } from 'lucide-react';
import { StoredJourney } from '../../services/travelStorage';

interface MyJourneysSectionProps {
  journeys?: StoredJourney[];
  onSelectJourney?: (id: string) => void;
  onPlanNew?: () => void;
}

export const MyJourneysSection = ({
  journeys = [],
  onSelectJourney,
  onPlanNew,
}: MyJourneysSectionProps) => {
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Planning' | 'Completed'>('All');

  const filteredJourneys = filter === 'All' 
    ? journeys 
    : journeys.filter((j) => (j.status || 'Planning') === filter);

  return (
    <section id="journeys" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-[#E7E5E2]">
      {/* Header with Title and Filter tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            COLLECTION & ARCHIVE
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline">
            Your Journeys
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] max-w-xl mt-3">
            Your personal travel collection. All bespoke itineraries and routes you've created.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick filter tabs */}
          {journeys.length > 0 && (
            <div className="flex items-center bg-neutral-100 p-1 rounded-full text-xs text-[#6F6F6F]">
              {(['All', 'Upcoming', 'Planning'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                    filter === tab
                      ? 'bg-white text-[#000000] shadow-xs font-medium'
                      : 'hover:text-[#000000]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {onPlanNew && (
            <button
              type="button"
              onClick={onPlanNew}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Plan Journey</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State when user has no journeys */}
      {journeys.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E7E5E2] rounded-3xl p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] border border-[#E7E5E2] flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5 text-[#6F6F6F]" />
          </div>
          <h3 className="font-instrument text-2xl sm:text-3xl text-black mb-2">
            No journeys in your archive
          </h3>
          <p className="text-xs sm:text-sm text-[#6F6F6F] max-w-sm mx-auto mb-6">
            All journeys you create in the planner will be saved here automatically.
          </p>
          {onPlanNew && (
            <button
              type="button"
              onClick={onPlanNew}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Journey</span>
            </button>
          )}
        </div>
      ) : filteredJourneys.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E7E5E2] rounded-3xl p-10 text-center text-xs text-[#6F6F6F] font-mono">
          No journeys found matching filter "{filter}".
        </div>
      ) : (
        /* Grid of Real Dynamic Journey Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredJourneys.map((journey) => {
            const citiesCount = journey.destinations?.length || 1;
            const dateStr = journey.datesDecided
              ? 'Flexible Dates'
              : journey.startDate && journey.endDate
              ? `${journey.startDate} — ${journey.endDate}`
              : 'Planned Itinerary';

            return (
              <div
                key={journey.id}
                onClick={() => onSelectJourney && onSelectJourney(journey.id)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-[#E7E5E2] hover:border-black card-hover-effect flex flex-col justify-between cursor-pointer transition-all shadow-xs hover:shadow-md"
              >
                {/* Image Container with Editorial Aspect Ratio */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
                  <img
                    src={journey.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'}
                    alt={journey.destination}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  {/* Soft Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Status & Travel Type Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#000000] px-2.5 py-1 rounded-full shadow-xs">
                      {journey.status || 'Planning'}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-full shadow-xs">
                      {journey.travelType === 'family' ? '👨‍👩‍👧‍👦 Family' : journey.travelType === 'solo' ? '👤 Solo' : '👥 Friends'}
                    </span>
                  </div>

                  {/* Editorial Typography Over Image */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 block mb-1">
                      DESTINATION
                    </span>
                    <h3 className="font-instrument text-2xl sm:text-3xl text-white tracking-wide leading-tight mb-1 line-clamp-2">
                      {journey.destination}
                    </h3>
                    <p className="text-[11px] text-neutral-300 line-clamp-2 font-inter leading-snug">
                      {journey.style || `${citiesCount} destinations tailored journey`}
                    </p>
                  </div>
                </div>

                {/* Bottom Metadata bar */}
                <div className="p-4 bg-[#FAF8F5]/80 border-t border-[#E7E5E2] flex items-center justify-between text-xs text-[#6F6F6F]">
                  <div className="flex items-center gap-1.5 font-mono truncate mr-2">
                    <Calendar className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span className="truncate">{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-mono shrink-0">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {citiesCount}C
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {journey.travelers}T
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
