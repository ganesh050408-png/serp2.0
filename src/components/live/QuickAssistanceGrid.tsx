import { HeartHandshake, ShieldAlert, ArrowRight, Stethoscope, Car, Utensils, Hotel, Pill, Bike, Train } from 'lucide-react';

export type ServiceCategory =
  | 'hospitals'
  | 'pharmacies'
  | 'rides'
  | 'bikes'
  | 'trains'
  | 'restaurants'
  | 'hotels'
  | 'atms'
  | 'fuel'
  | 'emergency'
  | 'unwell';

interface QuickAssistanceGridProps {
  onSelectCategory: (category: ServiceCategory) => void;
}

const CATEGORIES = [
  {
    id: 'bikes' as ServiceCategory,
    title: 'Bike Rentals',
    count: 'Royal Enfield & Vespas',
    icon: Bike,
    badge: 'From ₹550/day',
  },
  {
    id: 'trains' as ServiceCategory,
    title: 'Scenic Trains',
    count: 'Vande Bharat / VistaDome',
    icon: Train,
    badge: 'Live Rail Timings',
  },
  {
    id: 'rides' as ServiceCategory,
    title: 'Rides & Taxi',
    count: 'Available in 3–5 min',
    icon: Car,
    badge: 'Uber / Ola / Local',
  },
  {
    id: 'hospitals' as ServiceCategory,
    title: 'Hospitals',
    count: '3 nearby',
    icon: Stethoscope,
    badge: 'Emergency 24/7',
  },
  {
    id: 'pharmacies' as ServiceCategory,
    title: 'Pharmacies',
    count: '7 nearby',
    icon: Pill,
    badge: 'Open Now',
  },
  {
    id: 'restaurants' as ServiceCategory,
    title: 'Restaurants',
    count: '14 curated dining',
    icon: Utensils,
    badge: 'Goan Coastal',
  },
  {
    id: 'hotels' as ServiceCategory,
    title: 'Hotels & Stays',
    count: '4 boutique estates',
    icon: Hotel,
    badge: 'Within 3 km',
  },
  {
    id: 'emergency' as ServiceCategory,
    title: 'Emergency SOS',
    count: 'Direct 112 / 108',
    icon: ShieldAlert,
    badge: 'Immediate Priority',
    isEmergency: true,
  },
];

export const QuickAssistanceGrid = ({ onSelectCategory }: QuickAssistanceGridProps) => {
  return (
    <section id="near-you" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-[#E7E5E2]">
      {/* Calm "I'm Not Feeling Well" Banner */}
      <div className="mb-14 bg-amber-50/50 border border-amber-200/60 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white border border-amber-200 flex items-center justify-center text-amber-900 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-900 font-semibold block mb-0.5">
              HEALTH & WELLNESS SUPPORT
            </span>
            <h3 className="font-instrument text-2xl sm:text-3xl text-[#000000] leading-none">
              Need medical attention or feeling unwell?
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-1.5 max-w-xl">
              Quickly find verified nearby hospitals, 24/7 pharmacies, doctors on call, or arrange immediate transportation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory('unwell')}
          className="rounded-full px-8 py-3.5 bg-[#000000] text-white text-xs sm:text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-sm cursor-pointer whitespace-nowrap"
        >
          I'm not feeling well
        </button>
      </div>

      {/* Main Near You Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-1">
            LOCAL INTELLIGENCE & TRANSIT
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-headline leading-none">
            Near You
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-2">
            Transit rentals, scenic trains, health facilities, and local services.
          </p>
        </div>

        <span className="text-xs font-mono text-[#6F6F6F]">RADIUS: 5.0 KM OF PANAJI</span>
      </div>

      {/* Compact Editorial Action Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-[150px] sm:h-[160px] group ${
                cat.isEmergency
                  ? 'bg-neutral-900 text-white border-neutral-800 hover:bg-black shadow-md'
                  : 'bg-white text-[#000000] border-[#E7E5E2] hover:border-black shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    cat.isEmergency ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    cat.isEmergency
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-neutral-100 text-[#6F6F6F]'
                  }`}
                >
                  {cat.badge}
                </span>
              </div>

              <div>
                <h4 className="font-instrument text-2xl leading-none mb-1 flex items-center justify-between">
                  <span>{cat.title}</span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                      cat.isEmergency ? 'text-white' : 'text-[#6F6F6F]'
                    }`}
                  />
                </h4>
                <p
                  className={`text-[11px] font-mono ${
                    cat.isEmergency ? 'text-neutral-300' : 'text-[#6F6F6F]'
                  }`}
                >
                  {cat.count}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
