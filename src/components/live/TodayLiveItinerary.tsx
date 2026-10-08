import { useState, useEffect } from 'react';
import { Navigation, Car, MapPin, CheckCircle2 } from 'lucide-react';
import type { StoredJourney, ActivityType } from '../../services/travelStorage';

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

const DEFAULT_SCHEDULE: LiveItineraryItem[] = [
  {
    id: '1',
    time: '10:30',
    title: 'Arrival & Scenic Sanctuary Check-in',
    category: 'Stay & Check-in',
    location: 'Coastal haven corridor',
    distance: '3.8 km',
    driveTime: '12 min',
    status: 'completed',
    notes: 'Welcome refreshments and itinerary briefing.',
  },
  {
    id: '2',
    time: '13:00',
    title: 'Heritage Quarter Walk & Local Cuisine',
    category: 'Dining Experience',
    location: 'Artisanal waterfront district',
    distance: '1.2 km',
    driveTime: '5 min',
    status: 'active',
    notes: 'Traditional regional delicacies & local market walk.',
  },
  {
    id: '3',
    time: '16:30',
    title: 'Signature Architectural Excursion',
    category: 'Cultural Activity',
    location: 'Historic bastion & viewpoint',
    distance: '4.2 km',
    driveTime: '14 min',
    status: 'upcoming',
    notes: 'Sunset architectural stroll with local guide.',
  },
  {
    id: '4',
    time: '19:30',
    title: 'Evening Waterside Dining & Leisure',
    category: 'Dining Experience',
    location: 'Promontory dining terrace',
    distance: '5.1 km',
    driveTime: '18 min',
    status: 'upcoming',
    notes: 'Live acoustic performance & curated seasonal dinner.',
  },
];

interface TodayLiveItineraryProps {
  journey?: StoredJourney | null;
  onNavigate?: (destination: string) => void;
  onGetRide?: (destination: string) => void;
}

export const TodayLiveItinerary = ({ journey, onNavigate, onGetRide }: TodayLiveItineraryProps) => {
  const currentCity =
    journey?.destinations?.[0]?.city ||
    journey?.destinations?.[0]?.name ||
    journey?.city ||
    journey?.destination ||
    'Destination';

  const [schedule, setSchedule] = useState<LiveItineraryItem[]>(DEFAULT_SCHEDULE);

  useEffect(() => {
    const firstDay = journey?.itinerary?.[0];
    if (firstDay && Array.isArray(firstDay.activities) && firstDay.activities.length > 0) {
      const times = ['09:30', '12:30', '15:30', '18:30', '20:30'];
      const categories = ['Stay & Check-in', 'Artisan Discovery', 'Cultural Landmark', 'Sunset Experience', 'Signature Dining'];
      const mapped: LiveItineraryItem[] = firstDay.activities.map((act: ActivityType, i: number) => {
        const title = typeof act === 'string' ? act : act.name || 'Scheduled Activity';
        const actObj = typeof act === 'object' ? act : null;
        return {
          id: `act_${i}`,
          time: actObj?.startTime || times[i % times.length],
          title,
          category: categories[i % categories.length],
          location: actObj?.location || `${currentCity} Sanctuary Waypoint ${i + 1}`,
          distance: `${(1.2 + i * 2.3).toFixed(1)} km`,
          driveTime: `${6 + i * 7} min`,
          status: i === 0 ? 'completed' : i === 1 ? 'active' : 'upcoming',
          notes: actObj?.description || `Live waypoint for ${currentCity} itinerary stage.`,
        };
      });
      setSchedule(mapped);
    } else {
      setSchedule(DEFAULT_SCHEDULE);
    }
  }, [journey, currentCity]);

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
            ACTIVE TIMELINE · {currentCity.toUpperCase()}
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-headline leading-none">
            Today’s Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-2">
            Chronological live stops with real-time transit estimates for {currentCity}.
          </p>
        </div>

        <span className="text-xs font-mono text-[#6F6F6F]">
          {journey?.startDate ? `COMMENCED ${journey.startDate}` : 'DAY 1 OF ACTIVE JOURNEY'}
        </span>
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
                      ? 'bg-black border-black text-white'
                      : 'border-neutral-300 hover:border-black text-transparent'
                  }`}
                  aria-label={item.status === 'completed' ? 'Mark uncompleted' : 'Mark completed'}
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </button>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-black">{item.time}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-100 text-[#6F6F6F]">
                      {item.category}
                    </span>
                    {item.status === 'active' && (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-950 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                        NEXT UP
                      </span>
                    )}
                  </div>

                  <h3 className="font-instrument text-2xl sm:text-3xl text-black mt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#6F6F6F] font-inter mt-1 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" /> {item.location}
                    </span>
                    <span>•</span>
                    <span>{item.distance} away</span>
                    <span>•</span>
                    <span>{item.driveTime} by car</span>
                  </p>

                  <p className="text-xs text-neutral-500 font-inter mt-2 italic">
                    "{item.notes}"
                  </p>
                </div>
              </div>

              {/* Right Transit Action Buttons */}
              <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate(item.title);
                    } else {
                      const query = encodeURIComponent(`${item.title}, ${currentCity}`);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E7E5E2] hover:border-black bg-white text-xs font-medium text-black transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Navigate</span>
                </button>

                {onGetRide && (
                  <button
                    type="button"
                    onClick={() => onGetRide(item.title)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Get Ride</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
