import { ArrowUp } from 'lucide-react';

interface DashboardFooterProps {
  onBackToTop: () => void;
  onGoToLanding?: () => void;
}

export const DashboardFooter = ({ onBackToTop, onGoToLanding }: DashboardFooterProps) => {
  return (
    <footer className="relative z-10 w-full border-t border-[#E7E5E2] bg-white py-16 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Brand Statement */}
        <div className="text-center md:text-left">
          <div className="font-instrument text-3xl tracking-tight text-[#000000] inline-flex items-baseline mb-2">
            <span>Aethera</span>
            <sup className="text-xs font-sans ml-0.5 relative -top-3">°</sup>
          </div>
          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter">
            Aethera — Design your journey. The personal travel studio.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#6F6F6F]">
          <a href="#hero" className="hover:text-[#000000] transition-colors">
            Workspace
          </a>
          <a href="#journeys" className="hover:text-[#000000] transition-colors">
            Journeys
          </a>
          <a href="#ai-planner" className="hover:text-[#000000] transition-colors">
            AI Studio
          </a>
          <a href="#budget" className="hover:text-[#000000] transition-colors">
            Budget
          </a>
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="hover:text-[#000000] transition-colors underline cursor-pointer"
            >
              Landing Page
            </button>
          )}
        </div>

        {/* Back to top */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToTop}
            className="flex items-center gap-1.5 text-xs text-[#6F6F6F] hover:text-[#000000] transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 gap-4">
        <span>© 2026 Aethera Global Travel Studio. All rights reserved.</span>
        <span>Curated with Instrument Serif & Inter.</span>
      </div>
    </footer>
  );
};
