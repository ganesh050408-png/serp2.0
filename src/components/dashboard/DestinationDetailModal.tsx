import React, { useEffect } from 'react';
import { X, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { DestinationInfo, getOrCreateDestination } from '../../services/destinations';

interface DestinationDetailModalProps {
  destinationName: string | null;
  onClose: () => void;
  onPlanTrip: (cityName: string) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destinationName,
  onClose,
  onPlanTrip,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (destinationName) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [destinationName, onClose]);

  if (!destinationName) return null;

  const dest: DestinationInfo = getOrCreateDestination(destinationName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-fade-rise">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Cover Image & Top Actions */}
        <div className="relative h-[260px] sm:h-[320px] bg-neutral-900 shrink-0">
          <img
            src={dest.image}
            alt={dest.city}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-mono uppercase text-black font-semibold">
              {dest.region}, {dest.country}
            </span>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
              aria-label="Close destination details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title on image */}
          <div className="absolute bottom-6 left-6 right-6 text-white z-10">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 block mb-1">
              CURATED DESTINATION
            </span>
            <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-white leading-none">
              {dest.city}
            </h2>
          </div>
        </div>

        {/* Scrollable Details */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Recommended Stay</span>
              <span className="font-instrument text-2xl text-black font-semibold">{dest.recommendedDuration} Days</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Budget Tier</span>
              <span className="font-instrument text-2xl text-black font-semibold">{dest.budgetLevel}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Styles</span>
              <span className="font-inter text-xs text-black font-medium capitalize truncate block mt-1">
                {dest.styles.slice(0, 2).join(' · ')}
              </span>
            </div>
          </div>

          {/* Key Attractions */}
          <div>
            <span className="text-xs font-mono uppercase text-[#6F6F6F] block mb-3">
              ICONIC LANDMARKS & SANCTUARIES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {dest.attractions.map((att, i) => (
                <div
                  key={i}
                  className="p-3 bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl flex items-center gap-2 text-xs text-black font-inter"
                >
                  <MapPin className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                  <span>{att}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curated Activities */}
          <div>
            <span className="text-xs font-mono uppercase text-[#6F6F6F] block mb-3">
              SIGNATURE EXPERIENCES
            </span>
            <div className="space-y-2">
              {dest.activities.map((act, i) => (
                <div
                  key={i}
                  className="p-3.5 border border-[#E7E5E2] rounded-xl flex items-center justify-between text-xs text-black"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-800 shrink-0" />
                    <span className="font-medium font-inter">{act.name}</span>
                  </div>
                  <div className="flex gap-1">
                    {act.styles.map((st) => (
                      <span key={st} className="text-[10px] font-mono uppercase px-2 py-0.5 bg-neutral-100 rounded text-neutral-600">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-[#FAF8F5] border-t border-[#E7E5E2] flex items-center justify-between">
          <span className="text-xs font-mono text-[#6F6F6F]">
            Coordinates: {dest.lat.toFixed(4)}° N, {dest.lng.toFixed(4)}° E
          </span>

          <button
            type="button"
            onClick={() => {
              onClose();
              onPlanTrip(dest.city);
            }}
            className="rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Plan Journey to {dest.city}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
