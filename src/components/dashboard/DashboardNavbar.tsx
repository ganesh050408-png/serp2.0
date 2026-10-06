import { useState, useEffect } from 'react';
import { Sparkles, User, Menu, X, ArrowLeft } from 'lucide-react';

interface DashboardNavbarProps {
  onOpenAI: () => void;
  onOpenProfile?: () => void;
  onOpenJournal?: () => void;
  onGoToLanding?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  tripMode: 'planning' | 'live';
  onToggleTripMode: (mode: 'planning' | 'live') => void;
}

export const DashboardNavbar = ({
  onOpenAI,
  onOpenProfile,
  onOpenJournal,
  onGoToLanding,
  onNavigateSection,
  tripMode,
  onToggleTripMode,
}: DashboardNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const planningNavItems = [
    { label: 'Home', section: 'hero' },
    { label: 'Explore', section: 'discovery' },
    { label: 'My Journeys', section: 'journeys' },
    { label: 'Bikes & Rail', section: 'transit-rentals' },
    { label: 'AI Planner', section: 'ai-planner' },
    { label: 'Journal', section: 'journal_action' },
  ];

  const liveNavItems = [
    { label: 'Live Map', section: 'live-map' },
    { label: 'Near You', section: 'near-you' },
    { label: 'Today’s Plan', section: 'today-schedule' },
    { label: 'Companions', section: 'travel-together' },
    { label: 'Budget', section: 'budget' },
  ];

  const currentNavItems = tripMode === 'live' ? liveNavItems : planningNavItems;

  const handleItemClick = (label: string, section: string) => {
    setActiveItem(label);
    setMobileMenuOpen(false);

    if (section === 'journal_action') {
      if (onOpenJournal) {
        onOpenJournal();
      } else if (onNavigateSection) {
        onNavigateSection('itinerary');
      }
      return;
    }

    if (onNavigateSection) {
      onNavigateSection(section);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-[#E7E5E2]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
        {/* Left Brand Logo & Mode Badge */}
        <div className="flex items-center gap-4">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="text-[#6F6F6F] hover:text-[#000000] p-1.5 -ml-2 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Return to Main Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(tripMode === 'live' ? 'Live Map' : 'Home', tripMode === 'live' ? 'live-map' : 'hero');
            }}
            className="font-instrument text-2xl sm:text-3xl tracking-tight text-[#000000] select-none hover:opacity-80 transition-opacity inline-flex items-baseline"
          >
            <span>Aethera</span>
            <sup className="text-xs font-sans ml-0.5 relative -top-3">°</sup>
          </a>

          {/* Mode Switcher Pill */}
          <button
            type="button"
            onClick={() => onToggleTripMode(tripMode === 'live' ? 'planning' : 'live')}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
              tripMode === 'live'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs hover:bg-emerald-100'
                : 'bg-neutral-100 text-[#6F6F6F] hover:text-black border border-[#E7E5E2] hover:bg-neutral-200'
            }`}
            title="Click to toggle between Planning Mode and Live Journey Companion Mode"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                tripMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span className="font-semibold uppercase tracking-wider">
              {tripMode === 'live' ? 'LIVE JOURNEY' : 'PLANNING MODE'}
            </span>
          </button>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-7">
          {currentNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.label, item.section)}
              className={`text-sm tracking-wide transition-colors duration-200 cursor-pointer ${
                activeItem === item.label
                  ? 'text-[#000000] font-medium'
                  : 'text-[#6F6F6F] hover:text-[#000000]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions: AI Assistant Pill + Profile */}
        <div className="hidden sm:flex items-center space-x-3">
          <button
            type="button"
            onClick={onOpenAI}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium bg-neutral-100 hover:bg-neutral-200 text-[#000000] border border-[#E7E5E2] transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#000000]" />
            <span>{tripMode === 'live' ? '✦ Travel Companion' : '✦ AI Assistant'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 text-xs sm:text-sm font-medium bg-[#000000] text-white hover:opacity-90 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] text-white uppercase font-serif">
              A
            </div>
            <span className="hidden lg:inline font-sans text-xs">Aravind S.</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleTripMode(tripMode === 'live' ? 'planning' : 'live')}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase flex items-center gap-1 border ${
              tripMode === 'live'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tripMode === 'live' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
            <span>{tripMode === 'live' ? 'LIVE' : 'PLAN'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAI}
            className="p-2 rounded-full bg-neutral-100 text-[#000000] border border-[#E7E5E2]"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#000000]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-8 pt-2 pb-6 bg-white/95 backdrop-blur-md border-b border-[#E7E5E2] flex flex-col space-y-4">
          <div className="pb-2 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#6F6F6F]">Switch Workspace Mode:</span>
            <button
              onClick={() => {
                onToggleTripMode(tripMode === 'live' ? 'planning' : 'live');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-mono font-bold text-black underline"
            >
              {tripMode === 'live' ? 'Go to Planning Mode →' : 'Enter Live Journey →'}
            </button>
          </div>

          {currentNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item.label, item.section)}
              className={`text-left text-base py-1 transition-colors ${
                activeItem === item.label ? 'text-[#000000] font-medium' : 'text-[#6F6F6F]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenProfile) onOpenProfile();
              }}
              className="flex items-center gap-2 text-sm text-[#000000] hover:underline"
            >
              <User className="w-4 h-4 text-[#6F6F6F]" />
              <span>Aravind S. (View Profile)</span>
            </button>
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                className="text-xs text-[#6F6F6F] underline"
              >
                Landing
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
