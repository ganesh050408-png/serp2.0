import React, { useEffect } from 'react';
import { X, ArrowRight, Compass, Globe, Sparkles } from 'lucide-react';

interface CreateJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'national' | 'international' | 'custom_builder') => void;
}

export const CreateJourneyModal: React.FC<CreateJourneyModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-fade-rise">
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Main Modal Window */}
      <div className="relative w-full max-w-2xl bg-white border border-[#E7E5E2] rounded-[32px] p-6 sm:p-10 shadow-2xl overflow-hidden my-auto">
        {/* Top Close / ESC Button */}
        <div className="flex items-center justify-between pb-5 border-b border-[#E7E5E2] mb-6">
          <div className="flex items-center gap-2">
            <span className="font-instrument text-2xl tracking-tight text-[#000000]">Aethera</span>
            <sup className="text-xs font-sans ml-0.5 relative -top-2">°</sup>
            <span className="text-xs font-mono text-[#6F6F6F] ml-2">/ PLAN A NEW JOURNEY</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-[#6F6F6F] hover:text-[#000000] bg-neutral-100 border border-[#E7E5E2] hover:border-black transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <span>ESC</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Heading */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-[#6F6F6F] block mb-2">
            INITIATE VOYAGE
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-headline leading-none">
            Where are you going?
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-3">
            Choose how you would like to design your upcoming journey.
          </p>
        </div>

        {/* Two Large Minimal Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* NATIONAL OPTION */}
          <button
            type="button"
            onClick={() => onSelectType('national')}
            className="group relative bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black rounded-3xl p-6 sm:p-7 text-left transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg flex flex-col justify-between h-[210px] cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-white border border-[#E7E5E2] group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-colors mb-3">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] block mb-0.5">
                DOMESTIC · INDIA
              </span>
              <h3 className="font-instrument text-3xl text-[#000000] leading-none">
                NATIONAL
              </h3>
            </div>

            <div className="flex items-end justify-between pt-3 border-t border-[#E7E5E2]">
              <p className="text-xs text-[#6F6F6F] font-inter max-w-[170px] leading-relaxed">
                Coastal corridors, heritage havelis & slow hill sanctuaries.
              </p>
              <div className="w-8 h-8 rounded-full bg-white border border-[#E7E5E2] group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-all group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>

          {/* INTERNATIONAL OPTION */}
          <button
            type="button"
            onClick={() => onSelectType('international')}
            className="group relative bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black rounded-3xl p-6 sm:p-7 text-left transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-lg flex flex-col justify-between h-[210px] cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-white border border-[#E7E5E2] group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-colors mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] block mb-0.5">
                GLOBAL · WORLDWIDE
              </span>
              <h3 className="font-instrument text-3xl text-[#000000] leading-none">
                INTERNATIONAL
              </h3>
            </div>

            <div className="flex items-end justify-between pt-3 border-t border-[#E7E5E2]">
              <p className="text-xs text-[#6F6F6F] font-inter max-w-[170px] leading-relaxed">
                Cross borders, international timezones & alpine retreats.
              </p>
              <div className="w-8 h-8 rounded-full bg-white border border-[#E7E5E2] group-hover:bg-black group-hover:text-white flex items-center justify-center text-black transition-all group-hover:translate-x-1">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        {/* 3rd Option: Direct Multi-City Route Planner */}
        <button
          type="button"
          onClick={() => onSelectType('custom_builder')}
          className="w-full p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-[#E7E5E2] hover:border-black text-left flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-inter text-xs font-semibold text-black block">
                Custom Multi-City Route Builder
              </span>
              <span className="text-[11px] font-mono text-[#6F6F6F]">
                Drag-and-drop days, custom budgets, companions & day-by-day stops
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6F6F6F]" />
        </button>
      </div>
    </div>
  );
};
