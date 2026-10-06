import { useMemo, useState } from 'react';
import { CalendarHeart, Check, Plus } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { getFestivalsForTrip, type FestivalMatch, type FestivalType } from '../../services/festivals';

const TYPE_LABEL: Record<FestivalType, string> = {
  religious: 'Religious',
  cultural: 'Cultural',
  music: 'Music',
  food: 'Food',
  seasonal: 'Seasonal',
  art: 'Art',
};

export const FestivalRecommendations = () => {
  const { activeTrip, addActivity } = useTrip();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const festivals = useMemo<FestivalMatch[]>(() => {
    if (!activeTrip) return [];
    return getFestivalsForTrip(activeTrip.cities, activeTrip.startDate, activeTrip.endDate);
  }, [activeTrip]);

  if (!activeTrip || festivals.length === 0) return null;

  const handleAdd = async (f: FestivalMatch) => {
    // Prefer a day in a city the festival belongs to; else the first day.
    const target =
      activeTrip.days.find((d) =>
        f.cities.some((c) => c.toLowerCase() === d.city.toLowerCase()),
      ) ?? activeTrip.days[0];
    if (!target) return;
    await addActivity(target.id, {
      title: `${f.emoji} ${f.name}`,
      type: 'activity',
      notes: `${f.approxDates} · ${f.description}`,
    });
    setAdded((prev) => ({ ...prev, [f.id]: true }));
  };

  return (
    <section
      id="festivals"
      className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]"
    >
      <div className="mb-12">
        <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
          03 / WHAT'S ON
        </span>
        <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
          Time it with the locals.
        </h2>
        <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-lg">
          Festivals and events across {activeTrip.cities.join(', ')} — the ones during your dates
          come first.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {festivals.map((f) => {
          const isAdded = added[f.id];
          return (
            <article
              key={f.id}
              className="group relative flex flex-col rounded-3xl border border-[#E7E5E2] bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl leading-none" aria-hidden>
                  {f.emoji}
                </span>
                {f.relevance === 'during' && (
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'rgba(245,152,242,0.16)', color: '#000' }}
                  >
                    During your trip
                  </span>
                )}
              </div>

              <h3 className="font-instrument text-2xl text-[#000000] leading-tight">{f.name}</h3>

              <div className="flex items-center gap-2 mt-2 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                  {f.approxDates}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#E7E5E2]" />
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#6F6F6F]">
                  {TYPE_LABEL[f.type]}
                </span>
              </div>

              <p className="font-inter text-sm text-[#6F6F6F] leading-relaxed flex-1">
                {f.description}
              </p>

              <button
                type="button"
                onClick={() => handleAdd(f)}
                disabled={isAdded}
                className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium transition-all ${
                  isAdded
                    ? 'bg-neutral-100 text-[#6F6F6F] cursor-default'
                    : 'bg-[#000000] text-white hover:bg-neutral-800 hover:scale-[1.02]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added to itinerary
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Add to itinerary
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-2 text-[#6F6F6F]">
        <CalendarHeart className="w-4 h-4" />
        <span className="font-inter text-xs">
          Dates are approximate — many follow lunar calendars. Confirm locally before planning
          around them.
        </span>
      </div>
    </section>
  );
};
