import { useState } from 'react';
import { ArrowUpRight, Calendar, Users, MapPin } from 'lucide-react';

interface JourneyItem {
  id: string;
  destination: string;
  dates: string;
  citiesCount: number;
  travelersCount: number;
  status: 'Upcoming' | 'Planning' | 'Completed';
  image: string;
  tagline: string;
}

interface MyJourneysSectionProps {
  additionalJourneys?: JourneyItem[];
  onSelectJourney?: (id: string) => void;
}

const JOURNEYS: JourneyItem[] = [
  {
    id: '1',
    destination: 'GOA',
    dates: '12 JUN — 21 JUN',
    citiesCount: 3,
    travelersCount: 4,
    status: 'Upcoming',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    tagline: 'Coastal Portuguese architecture & sunset tides',
  },
  {
    id: '2',
    destination: 'RAJASTHAN',
    dates: '02 AUG — 11 AUG',
    citiesCount: 5,
    travelersCount: 3,
    status: 'Planning',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
    tagline: 'Fortresses, royal havelis & desert starscapes',
  },
  {
    id: '3',
    destination: 'KERALA',
    dates: '18 SEP — 25 SEP',
    citiesCount: 4,
    travelersCount: 2,
    status: 'Planning',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    tagline: 'Backwater houseboats & misted tea hills',
  },
  {
    id: '4',
    destination: 'LADAKH',
    dates: '05 OCT — 14 OCT',
    citiesCount: 2,
    travelersCount: 2,
    status: 'Planning',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop',
    tagline: 'High-altitude monasteries & glacial valleys',
  },
];

export const MyJourneysSection = ({ additionalJourneys = [], onSelectJourney }: MyJourneysSectionProps) => {
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Planning'>('All');
  const journeys = [...additionalJourneys, ...JOURNEYS];

  const filteredJourneys = filter === 'All' 
    ? journeys 
    : journeys.filter(j => j.status === filter);

  return (
    <section id="journeys" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-[#E7E5E2]">
      {/* Header with Title and View All link */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            COLLECTION & ARCHIVE
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline">
            Your Journeys
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] max-w-xl mt-3">
            Places you've planned, places you've been, and places still waiting to be discovered.
          </p>
        </div>

        <div className="flex items-center gap-6">
          {/* Quick filter tabs */}
          <div className="hidden sm:flex items-center bg-neutral-100 p-1 rounded-full text-xs text-[#6F6F6F]">
            {(['All', 'Upcoming', 'Planning'] as const).map((tab) => (
              <button
                key={tab}
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

          <a
            href="#discovery"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#000000] hover:text-[#6F6F6F] transition-colors group cursor-pointer"
          >
            <span>View all</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* Grid of Editorial Magazine Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredJourneys.map((journey) => (
          <div
            key={journey.id}
            onClick={() => onSelectJourney && onSelectJourney(journey.id)}
            className="group relative bg-white rounded-2xl overflow-hidden border border-[#E7E5E2] card-hover-effect flex flex-col justify-between cursor-pointer"
          >
            {/* Image Container with Editorial Aspect Ratio */}
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
              <img
                src={journey.image}
                alt={journey.destination}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              {/* Soft Gradient Overlay for Typography */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className="text-[11px] font-mono uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#000000] px-2.5 py-1 rounded-full">
                  {journey.status}
                </span>
              </div>

              {/* Editorial Magazine Typography Over Image */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 block mb-1">
                  DESTINATION
                </span>
                <h3 className="font-instrument text-3xl text-white tracking-wide leading-none mb-2">
                  {journey.destination}
                </h3>
                <p className="text-[11px] text-neutral-300 line-clamp-2 font-inter leading-snug">
                  {journey.tagline}
                </p>
              </div>
            </div>

            {/* Bottom Metadata bar */}
            <div className="p-4 bg-[#FAF8F5]/80 border-t border-[#E7E5E2] flex items-center justify-between text-xs text-[#6F6F6F]">
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3 h-3 text-neutral-500" />
                <span>{journey.dates}</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {journey.citiesCount} C
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {journey.travelersCount} T
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
