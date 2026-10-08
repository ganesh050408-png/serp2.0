import { useState, useEffect } from 'react';
import { Sparkles, User, Menu, X, ArrowLeft, Hospital, Bell } from 'lucide-react';
import { travelStorage } from '../../services/travelStorage';

interface DashboardNavbarProps {
  onOpenAI: () => void;
  onOpenProfile?: () => void;
  onOpenJournal?: () => void;
  onOpenHospitals?: () => void;
  onOpenNotifications?: () => void;
  onGoToLanding?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  tripMode: 'planning' | 'live';
  onToggleTripMode: (mode: 'planning' | 'live') => void;
}

export const DashboardNavbar = ({
  onOpenAI,
  onOpenProfile,
  onOpenJournal,
  onOpenHospitals,
  onOpenNotifications,
  onGoToLanding,
  onNavigateSection,
  tripMode,
  onToggleTripMode,
}: DashboardNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('Home');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = travelStorage.getNotifications().filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1. Primary planning progression: Home -> Explore -> My Journeys -> AI Planner -> Bikes & Rail -> Journal -> Hospitals
  const planningNavItems = [
    { label: 'Home', section: 'hero' },
    { label: 'Explore', section: 'discovery' },
    { label: 'My Journeys', section: 'journeys' },
    { label: 'AI Planner', section: 'ai-planner' },
    { label: 'Bikes & Rail', section: 'transit-rentals' },
    { label: 'Journal', section: 'journal_action' },
    { label: 'Hospitals', section: 'hospitals_action', icon: Hospital, ariaLabel: 'Hospitals directory' },
  ];

  // Live journey tracking sequence
  const liveNavItems = [
    { label: 'Live Map', section: 'live-map' },
    { label: 'Near You', section: 'near-you' },
    { label: 'Today’s Plan', section: 'today-schedule' },
    { label: 'Companions', section: 'travel-together' },
    { label: 'Budget', section: 'budget' },
    { label: 'Hospitals', section: 'hospitals_action', icon: Hospital, ariaLabel: 'Hospitals near me' },
  ];

  const currentNavItems = tripMode === 'live' ? liveNavItems : planningNavItems;

  // ScrollSpy to automatically reflect active section in sequence
  useEffect(() => {
    const handleSectionScroll = () => {
      if (window.scrollY < 120) {
        setActiveItem(tripMode === 'live' ? 'Live Map' : 'Home');
        return;
      }

      const scrollPos = window.scrollY + 200;

      if (tripMode === 'planning') {
        const sections = [
          { id: 'transit-rentals', label: 'Bikes & Rail' },
          { id: 'ai-planner', label: 'AI Planner' },
          { id: 'journeys', label: 'My Journeys' },
          { id: 'discovery', label: 'Explore' },
          { id: 'hero', label: 'Home' },
        ];
        for (const sec of sections) {
          const el = document.getElementById(sec.id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveItem(sec.label);
            break;
          }
        }
      } else {
        const sections = [
          { id: 'budget', label: 'Budget' },
          { id: 'travel-together', label: 'Companions' },
          { id: 'today-schedule', label: 'Today’s Plan' },
          { id: 'near-you', label: 'Near You' },
          { id: 'live-map', label: 'Live Map' },
        ];
        for (const sec of sections) {
          const el = document.getElementById(sec.id);
          if (el && el.offsetTop <= scrollPos) {
            setActiveItem(sec.label);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleSectionScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleSectionScroll);
  }, [tripMode]);

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

    if (section === 'hospitals_action') {
      if (onOpenHospitals) {
        onOpenHospitals();
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
          ? 'bg-white/90 backdrop-blur-md border-b border-[#E7E5E2]/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
          : 'bg-white/70 backdrop-blur-xs border-b border-[#E7E5E2]/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* =========================================================================
            ZONE 1: BRAND IDENTITY + WORKSPACE MODE CONTEXT
        ========================================================================= */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="text-[#6F6F6F] hover:text-[#000000] p-1.5 -ml-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
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
            className="font-instrument text-2xl sm:text-[28px] tracking-tight text-[#000000] select-none hover:opacity-80 transition-opacity inline-flex items-baseline"
          >
            <span>Aethera</span>
            <sup className="text-xs font-sans ml-0.5 relative -top-3">°</sup>
          </a>

          {/* Subtle separator between brand and mode status */}
          <div className="hidden sm:block h-4 w-px bg-neutral-200/90 mx-0.5" />

          {/* Mode Switcher Pill (Secondary context indicator) */}
          <button
            type="button"
            onClick={() => onToggleTripMode(tripMode === 'live' ? 'planning' : 'live')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 border cursor-pointer ${
              tripMode === 'live'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs hover:bg-emerald-100'
                : 'bg-[#FAF8F5] text-neutral-600 border-[#E7E5E2] shadow-2xs hover:text-black hover:border-neutral-400'
            }`}
            title="Click to toggle between Planning Mode and Live Journey Mode"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                tripMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span className="font-semibold uppercase">
              {tripMode === 'live' ? 'LIVE JOURNEY' : 'PLANNING MODE'}
            </span>
          </button>
        </div>

        {/* =========================================================================
            ZONE 2: PRIMARY TRAVEL-PLANNING PROGRESSION (Centered Navigation Bar)
        ========================================================================= */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-neutral-100/70 p-1 rounded-full border border-neutral-200/60 shadow-2xs shrink-0">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item.label, item.section)}
                aria-label={item.ariaLabel || item.label}
                className={`whitespace-nowrap shrink-0 text-xs xl:text-[13px] tracking-normal transition-all duration-200 cursor-pointer flex items-center gap-1.5 py-1.5 px-2.5 xl:px-3 rounded-full select-none ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-xs border border-neutral-200/80'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-black' : 'text-neutral-400'}`} />}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* =========================================================================
            ZONE 3: SECONDARY / UTILITY CONTROLS (Right cluster)
        ========================================================================= */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Subtle separator from primary nav */}
          <div className="hidden lg:block h-4 w-px bg-neutral-200/90 mr-0.5" />

          {/* AI Assistant Quick Tool (Distinct utility styling with sparkle) */}
          <button
            type="button"
            onClick={onOpenAI}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-neutral-100 hover:bg-neutral-200/80 text-black border border-[#E7E5E2] transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-2xs"
            title={tripMode === 'live' ? 'Open Travel Companion' : 'Open AI Assistant'}
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
            <span className="font-sans">
              {tripMode === 'live' ? 'Companion' : 'AI Assistant'}
            </span>
          </button>

          {/* Notifications */}
          {onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-neutral-100 text-neutral-700 hover:text-black border border-transparent hover:border-[#E7E5E2] transition-colors cursor-pointer"
              title="View trip alerts and notifications"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              )}
            </button>
          )}

          {/* User Profile */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 rounded-full p-1 xl:pr-3 text-xs font-medium hover:bg-neutral-100 border border-transparent hover:border-[#E7E5E2] transition-all duration-200 cursor-pointer"
            aria-label="User profile"
          >
            <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-sans font-semibold">
              A
            </div>
            <span className="hidden xl:inline font-sans text-xs text-neutral-800">Aravind S.</span>
          </button>
        </div>

        {/* =========================================================================
            MOBILE / COMPACT CONTROLS
        ========================================================================= */}
        <div className="flex lg:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleTripMode(tripMode === 'live' ? 'planning' : 'live')}
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase flex items-center gap-1 border ${
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
            className="p-1.5 rounded-full bg-neutral-100 text-[#000000] border border-[#E7E5E2]"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#000000] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Clean planning flow sequence) */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 pt-3 pb-6 bg-white/98 backdrop-blur-md border-b border-[#E7E5E2] flex flex-col space-y-3 animate-fade-in shadow-lg">
          <div className="pb-2 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#6F6F6F]">Workspace Mode:</span>
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

          <div className="flex flex-col space-y-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => handleItemClick(item.label, item.section)}
                  aria-label={item.ariaLabel || item.label}
                  className={`text-left text-sm py-2 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${
                    isActive ? 'bg-neutral-100 text-black font-semibold' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className="w-4 h-4 opacity-70" />}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenProfile) onOpenProfile();
              }}
              className="flex items-center gap-2 text-xs text-[#000000] hover:underline"
            >
              <User className="w-4 h-4 text-[#6F6F6F]" />
              <span>Aravind S. (Profile & Settings)</span>
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
