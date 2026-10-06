import { useState } from 'react';
import { FileDown, Check, AlertCircle } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { exportTripToPDF } from '../../services/pdfExport';

interface TripPDFExportProps {
  /** 'button' = compact inline pill; 'banner' = full-width editorial CTA. */
  variant?: 'button' | 'banner';
  className?: string;
}

export const TripPDFExport = ({ variant = 'button', className = '' }: TripPDFExportProps) => {
  const { activeTrip } = useTrip();
  const [state, setState] = useState<'idle' | 'done' | 'blocked'>('idle');

  if (!activeTrip) return null;

  const handleExport = () => {
    const ok = exportTripToPDF(activeTrip);
    setState(ok ? 'done' : 'blocked');
    if (ok) setTimeout(() => setState('idle'), 3000);
  };

  const Button = (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium bg-[#000000] hover:bg-neutral-800 text-white transition-all cursor-pointer hover:scale-[1.02]"
    >
      {state === 'done' ? <Check className="w-3.5 h-3.5" /> : <FileDown className="w-3.5 h-3.5" />}
      <span>{state === 'done' ? 'Print dialog opened' : 'Download PDF'}</span>
    </button>
  );

  if (variant === 'banner') {
    return (
      <section
        className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-14 border-t border-[#E7E5E2] ${className}`}
      >
        <div className="rounded-3xl border border-[#E7E5E2] bg-[#FAF8F5] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
              04 / TAKE IT WITH YOU
            </span>
            <h2 className="font-instrument text-3xl sm:text-4xl text-[#000000] tracking-headline leading-none">
              A pocket copy of the plan.
            </h2>
            <p className="font-inter text-sm text-[#6F6F6F] mt-3 max-w-md">
              Export the full itinerary, budget and settle-up summary as a clean, printable PDF.
            </p>
          </div>
          <div className="shrink-0">
            {Button}
            {state === 'blocked' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-inter">
                <AlertCircle className="w-3.5 h-3.5" />
                Allow pop-ups for this site, then try again.
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={className}>
      {Button}
      {state === 'blocked' && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-inter">
          <AlertCircle className="w-3.5 h-3.5" />
          Allow pop-ups, then try again.
        </p>
      )}
    </div>
  );
};
