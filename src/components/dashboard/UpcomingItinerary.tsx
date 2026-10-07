import { useState, useMemo } from 'react';
import { ArrowRight, MapPin, CheckCircle, Plus } from 'lucide-react';
import { AddItineraryStopModal } from './AddItineraryStopModal';
import { StoredJourney } from '../../services/travelStorage';

interface ItineraryEvent {
  time: string;
  title: string;
  location: string;
  category: string;
  completed?: boolean;
  notes?: string;
}

interface UpcomingItineraryProps {
  journey?: StoredJourney | null;
  onOpenJourney?: (id: string) => void;
}

export const UpcomingItinerary = ({ journey, onOpenJourney }: UpcomingItineraryProps) => {
  if (!journey || !journey.itinerary || journey.itinerary.length === 0) {
    return null;
  }

  const daysList = useMemo(() => {
    return journey.itinerary?.map((d) => d.date) || [];
  }, [journey]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [customStops, setCustomStops] = useState<Record<number, ItineraryEvent[]>>({});
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [isAddStopOpen, setIsAddStopOpen] = useState(false);

  const currentDayData = journey.itinerary[selectedDayIndex] || journey.itinerary[0];

  // Convert day's activities string list into structured timeline events
  const defaultEvents: ItineraryEvent[] = useMemo(() => {
    if (!currentDayData) return [];
    return (currentDayData.activities || []).map((act, idx) => {
      const actStr = typeof act === 'string' ? act : act.name || 'Scheduled Activity';
      const times = ['09:00', '11:30', '14:00', '17:30', '20:00'];
      const categories = ['Arrival', 'Culture', 'Dining', 'Heritage', 'Leisure'];
      return {
        time: times[idx % times.length],
        title: actStr,
        location: currentDayData.city,
        category: categories[idx % categories.length],
        completed: false,
      };
    });
  }, [currentDayData]);

  const dayCustomStops = customStops[selectedDayIndex] || [];
  const allEvents = [...defaultEvents, ...dayCustomStops];

  const toggleEvent = (eventKey: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [eventKey]: !prev[eventKey],
    }));
  };

  const handleAddStop = (newEvent: { time: string; title: string; location: string; category: string; notes?: string }) => {
    setCustomStops((prev) => ({
      ...prev,
      [selectedDayIndex]: [...(prev[selectedDayIndex] || []), { ...newEvent, completed: false }],
    }));
  };

  return (
    <section id="itinerary" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2] animate-fade-rise">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Heading & Date Picker */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
              DAY-BY-DAY TIMELINE
            </span>
            <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
              What's next
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 leading-relaxed max-w-md">
              A chronological flow of your day in <strong>{currentDayData?.city}</strong>. Designed for unhurried exploration and spontaneous detours.
            </p>

            {/* Date Segment Selector */}
            {daysList.length > 0 && (
              <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2">
                {daysList.map((day, idx) => (
                  <button
                    key={day + idx}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap ${
                      selectedDayIndex === idx
                        ? 'bg-[#000000] text-white shadow-xs'
                        : 'bg-neutral-100 text-[#6F6F6F] hover:text-[#000000]'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {/* Day Overview Badge */}
            <div className="mt-8 p-6 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl">
              <span className="text-[11px] font-mono uppercase text-[#6F6F6F] block">
                Day {selectedDayIndex + 1} of {daysList.length}
              </span>
              <h3 className="font-instrument text-3xl text-[#000000] mt-1">
                {currentDayData?.city} · {journey.style || 'Custom Exploration'}
              </h3>
              <p className="text-xs text-[#6F6F6F] mt-2 font-inter">
                {allEvents.length} scheduled moments · Personalized itinerary
              </p>
            </div>
          </div>

          <div className="pt-8">
            <button
              type="button"
              onClick={() => onOpenJourney && onOpenJourney(journey.id)}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#000000] hover:text-[#6F6F6F] transition-colors group cursor-pointer"
            >
              <span>Open full {daysList.length}-day itinerary</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right Column: Clean Editorial Vertical Timeline */}
        <div className="lg:col-span-7">
          <div className="relative pl-6 sm:pl-8 border-l border-[#E7E5E2] space-y-10">
            {allEvents.map((event, idx) => {
              const eventKey = `${selectedDayIndex}_${idx}_${event.title}`;
              const isCompleted = !!completedItems[eventKey];

              return (
                <div key={eventKey} className="relative group">
                  {/* Timeline node dot */}
                  <button
                    type="button"
                    onClick={() => toggleEvent(eventKey)}
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${
                      isCompleted
                        ? 'bg-[#000000] border-[#000000] text-white'
                        : 'bg-white border-neutral-400 group-hover:border-black'
                    }`}
                    title="Click to toggle completed status"
                  >
                    {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                  </button>

                  {/* Event Header: Time and Category */}
                  <div className="flex items-center justify-between gap-4 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold tracking-wider text-[#000000]">
                        {event.time}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-[11px] font-mono uppercase text-[#6F6F6F] bg-neutral-100 px-2 py-0.5 rounded">
                        {event.category}
                      </span>
                    </div>
                    {isCompleted && (
                      <span className="text-[11px] text-emerald-700 font-mono">Done</span>
                    )}
                  </div>

                  {/* Event Details */}
                  <h4
                    className={`font-instrument text-2xl text-[#000000] transition-opacity ${
                      isCompleted ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    {event.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-[#6F6F6F] mt-1 font-inter">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span>{event.location}</span>
                  </div>

                  {event.notes && (
                    <p className="text-xs text-[#6F6F6F] mt-2 italic font-inter pl-3 border-l border-neutral-200">
                      "{event.notes}"
                    </p>
                  )}
                </div>
              );
            })}

            {/* Quick Add Moment */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddStopOpen(true)}
                className="flex items-center gap-2 text-xs font-medium text-[#6F6F6F] hover:text-[#000000] px-3 py-2 rounded-full border border-dashed border-[#E7E5E2] hover:border-black transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add custom stop to {daysList[selectedDayIndex] || 'selected day'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Stop Modal */}
      <AddItineraryStopModal
        isOpen={isAddStopOpen}
        onClose={() => setIsAddStopOpen(false)}
        dayLabel={daysList[selectedDayIndex] || 'Day 1'}
        onAddEvent={handleAddStop}
      />
    </section>
  );
};
