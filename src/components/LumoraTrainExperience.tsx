import { useState, useRef, useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface LumoraTrainExperienceProps {
  onContinueToPlanner?: () => void;
  onClose?: () => void;
  onEnterDashboard?: () => void;
  onNavigate?: (path: string) => void;
}

const VIDEOS = [
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
    label: 'Golden Hour',
  },
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
    label: 'Still Water',
  },
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
    label: 'Deep Woods',
  },
  {
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
    label: 'Quiet Dawn',
  },
];

const NAV_LINKS = ['How It Works', 'Features', 'Pricing', 'Community'];

export const LumoraTrainExperience = ({
  onContinueToPlanner,
  onClose,
  onEnterDashboard,
  onNavigate,
}: LumoraTrainExperienceProps) => {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const cooldownTimerRef = useRef<number | null>(null);

  const isDeepWoods = activeVideo === 2;

  const handleVideoSwitch = (index: number) => {
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);

    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  // Main primary CTA action -> Continue to existing Journey Planner
  const handleProceedToPlanner = () => {
    if (onContinueToPlanner) {
      onContinueToPlanner();
    } else if (onNavigate) {
      onNavigate('/planner/new');
    }
  };

  // Close / Return to Aethera Home
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onEnterDashboard) {
      onEnterDashboard();
    } else if (onNavigate) {
      onNavigate('/');
    }
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    handleProceedToPlanner();
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black select-none">
      {/* 1. Background Video Layer (Stacked absolutely with 1000ms crossfade) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {VIDEOS.map((v, idx) => (
          <video
            key={v.url}
            src={v.url}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              activeVideo === idx ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* 2. Transparent PNG Overlay with continuous train-bob animation (z-index 1) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[1] flex items-center justify-center overflow-hidden">
        <img
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
          alt="Cinematic Scenic Train Carriage Window Overlay"
          className="w-full h-full object-cover animate-train-bob"
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* 3. Content Layer (z-index 2) */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 sm:py-8 font-serif">
        {/* Navigation Bar (Top) - Clean & Minimal */}
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={handleClose}
            className="text-white italic text-2xl sm:text-3xl tracking-tight hover:opacity-80 transition-opacity font-instrument cursor-pointer"
          >
            Lumora
          </button>

          {/* Minimal Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="liquid-glass rounded-full p-2.5 sm:px-4 sm:py-2 text-white/80 hover:text-white text-xs font-mono transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            aria-label="Close and return to home"
            title="Return to Home"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col justify-between p-8 md:hidden animate-fade-rise">
            <div className="flex items-center justify-between">
              <span className="text-white italic text-3xl font-instrument">Lumora</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="liquid-glass p-2.5 rounded-full text-white cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-6 my-auto text-left">
              {NAV_LINKS.map((link, idx) => (
                <button
                  key={link}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProceedToPlanner();
                  }}
                  className="text-white text-3xl font-instrument hover:text-neutral-300 text-left transition-all duration-500 transform translate-y-0 cursor-pointer"
                  style={{
                    transitionDelay: `${(idx + 1) * 50}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {link}
                </button>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleProceedToPlanner();
                }}
                className="w-full bg-white text-black font-sans font-semibold py-4 rounded-full text-sm hover:bg-neutral-200 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleClose();
                }}
                className="w-full liquid-glass text-white/80 py-3 rounded-full text-xs font-mono text-center cursor-pointer"
              >
                Return to Aethera Home
              </button>
            </div>
          </div>
        )}

        {/* Centered Hero Content */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center my-auto pt-6 pb-2">
          {/* Badge */}
          <div
            className={`liquid-glass rounded-full px-5 py-2 mb-6 text-xs sm:text-sm font-sans transition-colors duration-700 ${
              isDeepWoods ? 'text-[#182C41]' : 'text-white'
            }`}
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Over 10,000 minds already finding their clarity
            </span>
          </div>

          {/* Heading */}
          <h1
            className={`font-instrument text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.08] transition-colors duration-700 ${
              isDeepWoods ? 'text-[#182C41]' : 'text-white'
            }`}
          >
            Clarity in an Endlessly <br /> Noisy Universe
          </h1>

          {/* Subtext */}
          <p
            className={`mt-6 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed font-sans transition-colors duration-700 ${
              isDeepWoods ? 'text-[#182C41]/80' : 'text-white/80'
            }`}
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover
            how to protect your presence and create with intention.
          </p>

          {/* Plan Your Journey CTA Pill */}
          <form
            onSubmit={handleSubmitEmail}
            className="mt-8 liquid-glass rounded-full p-1.5 flex items-center max-w-[340px] sm:max-w-md w-full shadow-lg transition-all"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Best Email"
              className={`bg-transparent px-4 py-2 text-xs sm:text-sm flex-1 outline-none font-sans ${
                isDeepWoods
                  ? 'text-[#182C41] placeholder:text-[#182C41]/50'
                  : 'text-white placeholder:text-white/60'
              }`}
              style={{ fontFamily: 'system-ui, sans-serif' }}
            />
            <button
              type="submit"
              className="bg-white text-black font-sans font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full hover:bg-neutral-200 transition-all hover:scale-[1.03] cursor-pointer shrink-0 shadow-md flex items-center gap-2"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              <span>Plan Your Journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Video Switcher */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {VIDEOS.map((v, idx) => {
              const isActive = activeVideo === idx;
              return (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => handleVideoSwitch(idx)}
                  disabled={isTransitioning}
                  className={`pb-1 text-xs sm:text-sm font-sans transition-all duration-700 cursor-pointer ${
                    isActive
                      ? isDeepWoods
                        ? 'text-[#182C41] font-semibold border-b-2 border-[#182C41]'
                        : 'text-white font-semibold border-b-2 border-white'
                      : isDeepWoods
                      ? 'text-[#182C41]/50 border-b-2 border-transparent hover:text-[#182C41]/80'
                      : 'text-white/50 border-b-2 border-transparent hover:text-white/80'
                  }`}
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Stats (pushed to bottom) */}
        <footer className="w-full max-w-7xl mx-auto pt-4 flex flex-col sm:flex-row items-center justify-between text-white/70 text-xs sm:text-sm font-sans gap-3 border-t border-white/10">
          <div
            className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4"
            style={{ fontFamily: 'system-ui, sans-serif' }}
          >
            <span>60+ Deep Sessions</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>12,000+ Creators</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>4.8 User Satisfaction</span>
            <span className="hidden sm:inline text-white/30">|</span>
            <span>Intentional-First Design</span>
          </div>

          <div>
            <button
              onClick={handleProceedToPlanner}
              className="text-white hover:text-white/80 underline underline-offset-4 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Continue to Plan Your Journey</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
};
