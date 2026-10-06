import { useState } from 'react';

interface NavbarProps {
  onBeginJourney?: () => void;
}

const MENU_ITEMS = [
  { label: 'Home', href: '#home', active: true },
  { label: 'Studio', href: '#studio', active: false },
  { label: 'About', href: '#about', active: false },
  { label: 'Journal', href: '#journal', active: false },
  { label: 'Reach Us', href: '#reach-us', active: false },
];

export const Navbar = ({ onBeginJourney }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="font-instrument text-3xl tracking-tight text-[#000000] select-none hover:opacity-85 transition-opacity inline-flex items-baseline"
          aria-label="Aethera Home"
        >
          <span>Aethera</span>
          <sup className="text-xs font-sans ml-0.5 relative -top-3">®</sup>
        </a>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-9">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm transition-colors duration-200 ${
                item.active
                  ? 'text-[#000000] font-medium'
                  : 'text-[#6F6F6F] hover:text-[#000000]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden sm:flex items-center">
          <button
            type="button"
            onClick={onBeginJourney}
            className="rounded-full px-6 py-2.5 text-sm font-medium bg-[#000000] text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer"
          >
            Begin Journey
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#000000] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-8 pt-2 pb-6 bg-white/95 backdrop-blur-md border-b border-neutral-100 flex flex-col space-y-4">
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-base py-1 transition-colors ${
                item.active
                  ? 'text-[#000000] font-medium'
                  : 'text-[#6F6F6F] hover:text-[#000000]'
              }`}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onBeginJourney) onBeginJourney();
              }}
              className="w-full rounded-full px-6 py-2.5 text-sm font-medium bg-[#000000] text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              Begin Journey
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
