import { ArrowRight } from 'lucide-react';

interface NavbarProps {
  onBeginJourney?: () => void;
}

export const Navbar = ({ onBeginJourney }: NavbarProps) => {
  return (
    <header className="relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="font-instrument text-3xl sm:text-4xl tracking-tight text-[#000000] select-none hover:opacity-85 transition-opacity inline-flex items-baseline"
          aria-label="Adhira Home"
        >
          <span>Adhira</span>
        </a>

        {/* CTA Button */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBeginJourney}
            className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-neutral-950 hover:bg-black text-white text-sm font-medium tracking-wide shadow-sm hover:shadow-xl hover:shadow-black/15 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer overflow-hidden border border-neutral-800"
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform ease-out pointer-events-none" />
            <span>Begin Journey</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
