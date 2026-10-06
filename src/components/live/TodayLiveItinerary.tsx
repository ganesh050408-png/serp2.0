import { useState } from 'react';
import { Navigation, Car, MapPin, CheckCircle2 } from 'lucide-react';

interface LiveItineraryItem {
  id: string;
  time: string;
  title: string;
  category: string;
  location: string;
  distance: string;
  driveTime: string;
  status: 'completed' | 'active' | 'upcoming';
  notes: string;
}

const TODAY_SCHEDULE: LiveItineraryItem[] = [
  {
    id: '1',
    time: '10:30',
    title: 'Baga Beach Coastal Catamaran',
    category: 'Activity',
    location: 'North Baga Shoreline, Jetty 4',
    distance: '3.8 km',
    driveTime: '12 min',
    status: 'completed',
    notes: 'Completed morning sail along the reef.',
  },
  {
    id: '2',
    time: '13:00',
    title: 'Lunch at Fisherman’s Wharf',
    category: 'Dining',
    location: 'Sal River waterfront, Panaji',
    distance: '0.8 km',
    driveTime: '3 min',
    status: 'completed',
    notes: 'Traditional coastal curry & sol kadhi.',
  },
  {
    id: '3',
    time: '15:30',
    title: 'Fort Aguada & 17th-Century Lighthouse',
    category: 'Heritage',
    location: 'Sinquerim Promontory, Candolim',
    distance: '4.2 km',
    driveTime: '14 min',
    status: 'active',
    notes: 'Architectural walk through the Portuguese bastion.',
  },
  {
    id: '4',
    time: '18:30',
    title: 'Anjuna Sunset & Cliffside Jazz',
    category: 'Leisure',
    location: 'Sunset Point, South Anjuna',
    distance: '7.8 km',
    driveTime: '22 min',
    status: 'upcoming',
    notes: 'Optimal golden hour lighting from 18:15.',
  },
];

interface TodayLiveItineraryProps {
  onNavigate?: (destination: string) => void;
  onGetRide?: (destination: string) => void;
}

export const TodayLiveItinerary = ({ onNavigate, onGetRide }: TodayLiveItineraryProps) => {
  const [schedule, setSchedule] = useState(TODAY_SCHEDULE);

  const toggleComplete = (id: string) => {
    setSchedule(
      schedule.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'completed' ? 'upcoming' : 'completed',
            }
          : item
      )
    );
  };

  return (
    <section id="today-schedule" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-[#E7E5E2]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-1">
            ACTIVE TIMELINE
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-headline leading-none">
            Today’s Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-2">
            Chronological live stops with real-time transit estimates from your current position.
          </p>
        </div>

        <span className="text-xs font-mono text-[#6F6F6F]">SUNDAY · 14 JUNE 2026</span>
      </div>

      <div className="space-y-6">
        {schedule.map((item) => (
          <div
            key={item.id}
            className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
              item.status === 'active'
                ? 'bg-[#FAF8F5] border-[#000000] shadow-md ring-1 ring-black'
                : item.status === 'completed'
                ? 'bg-white/80 border-[#E7E5E2] opacity-75'
                : 'bg-white border-[#E7E5E2] hover:border-neutral-400 shadow-xs'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Details */}
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => toggleComplete(item.id)}
                  className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                    item.status === 'completed'
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'border-neutral-400 hover:border-black bg-white'
                  }`}
                  title="Toggle stop completion"
                >
                  {item.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-[#000000]">
                      {item.time}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-[11px] font-mono uppercase text-[#6F6F6F] bg-neutral-100 px-2.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.status === 'active' && (
                      <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Next Up
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-instrument text-2xl sm:text-3xl text-[#000000] leading-tight ${
                      item.status === 'completed' ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {item.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#6F6F6F] font-inter mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {item.location}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[#000000]">
                      {item.distance} from you ({item.driveTime} by car)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-3 self-start lg:self-auto pt-2 lg:pt-0">
                <button
                  type="button"
                  onClick={() => onGetRide && onGetRide(item.title)}
                  className="flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-[#000000] transition-colors cursor-pointer"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Get Ride</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(item.title);
                    }
                    const query = encodeURIComponent(`${item.location}, Goa, India`);
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
                  }}
                  className="flex items-center gap-1.5 rounded-full px-6 py-2.5 bg-[#000000] hover:bg-neutral-800 text-white text-xs font-medium transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
