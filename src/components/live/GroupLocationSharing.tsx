import { useState } from 'react';
import { MapPin, Share2, Check } from 'lucide-react';

const COMPANIONS = [
  { name: 'You (Aravind S.)', status: 'Panaji Waterfront', distance: 'Current Location', active: true, initials: 'AS' },
  { name: 'Rahul M.', status: 'Fontainhas Heritage Bakery', distance: '300m north', active: true, initials: 'RM' },
  { name: 'Priya K.', status: 'Kala Academy Gallery', distance: '450m west', active: true, initials: 'PK' },
  { name: 'Arjun D.', status: 'With you at Promenade', distance: '0m', active: true, initials: 'AD' },
];

export const GroupLocationSharing = () => {
  const [isSharing, setIsSharing] = useState<boolean>(true);
  const [showStatusSuccess, setShowStatusSuccess] = useState<boolean>(false);

  const toggleShare = () => {
    setIsSharing(!isSharing);
    setShowStatusSuccess(true);
    setTimeout(() => setShowStatusSuccess(false), 3000);
  };

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-[#E7E5E2]">
      <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] p-8 sm:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-[#E7E5E2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F]">
                COMPANION TELEMETRY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h3 className="font-instrument text-3xl sm:text-4xl text-[#000000] tracking-headline leading-none">
              Traveling Together · 4 Live Companions
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-2 max-w-xl">
              Real-time proximity and safety check-ins with your travel cohort. Explicitly permissioned.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShare}
              className={`rounded-full px-6 py-3 text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                isSharing
                  ? 'bg-[#000000] text-white hover:bg-neutral-800'
                  : 'bg-white border border-[#E7E5E2] text-[#000000] hover:border-black'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isSharing ? 'Stop Sharing My Location' : 'Share My Live Location'}</span>
            </button>
          </div>
        </div>

        {showStatusSuccess && (
          <div className="mt-4 p-3 bg-white border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-rise">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{isSharing ? 'Location broadcast enabled for your group.' : 'Location broadcast stopped.'}</span>
          </div>
        )}

        {/* Companion Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {COMPANIONS.map((comp, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E7E5E2] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-xs">
                  {comp.initials}
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Synced
                </span>
              </div>

              <div>
                <h4 className="font-inter text-sm font-semibold text-[#000000] mb-0.5">
                  {comp.name}
                </h4>
                <p className="text-xs text-[#6F6F6F] font-inter flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>{comp.status}</span>
                </p>
                <span className="text-[11px] font-mono text-neutral-500 block mt-2">
                  Proximity: {comp.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
