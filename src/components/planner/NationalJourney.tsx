import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  IndianRupee,
  Sparkles,
} from 'lucide-react';

interface NationalJourneyProps {
  onBackToDashboard: () => void;
  onCompleteJourney?: (journeyData: any) => void;
}

const VIDEOS = [
  {
    id: 0,
    title: 'GOLDEN HOUR',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  },
  {
    id: 1,
    title: 'STILL WATER',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  },
  {
    id: 2,
    title: 'DEEP WOODS',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  },
  {
    id: 3,
    title: 'QUIET DAWN',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
  },
];

const POPULAR_DESTINATIONS = [
  'Goa',
  'Kerala',
  'Rajasthan',
  'Kashmir',
  'Himachal Pradesh',
  'Tamil Nadu',
];

const JOURNEY_STYLES = [
  'Relaxed',
  'Adventure',
  'Cultural',
  'Food & Local Life',
  'Nature',
  'Luxury',
];

const TRAVELER_PRESETS = ['Solo', 'Couple', 'Friends', 'Family', 'Group'];
const BUDGET_TIERS = ['Budget', 'Comfort', 'Premium', 'Luxury'];

export const NationalJourney: React.FC<NationalJourneyProps> = ({
  onBackToDashboard,
  onCompleteJourney,
}) => {
  // Video switcher state
  const [activeVideo, setActiveVideo] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Planning Step State (1: Destination, 2: Preferences, 3: Review)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [destination, setDestination] = useState<string>('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Relaxed', 'Food & Local Life']);
  const [departureDate, setDepartureDate] = useState<string>('2026-06-12');
  const [returnDate, setReturnDate] = useState<string>('2026-06-21');
  const [isFlexibleDates, setIsFlexibleDates] = useState<boolean>(false);
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [budgetAmount, setBudgetAmount] = useState<string>('50000');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('Comfort');
  const [decideBudgetLater, setDecideBudgetLater] = useState<boolean>(false);

  // AI Generation Loading State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingStage, setGeneratingStage] = useState<string>('Designing your journey...');

  const handleVideoSwitch = (index: number) => {
    if (index === activeVideo || isTransitioning) return;
    setIsTransitioning(true);
    setActiveVideo(index);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      if (selectedStyles.length > 1) {
        setSelectedStyles(selectedStyles.filter((s) => s !== style));
      }
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleCreateJourney = () => {
    setIsGenerating(true);
    setGeneratingStage('Designing your journey...');

    setTimeout(() => {
      setGeneratingStage('Finding the right places in ' + (destination || 'Goa') + '...');
    }, 1200);

    setTimeout(() => {
      setGeneratingStage('Building your customized itinerary...');
    }, 2400);

    setTimeout(() => {
      setIsGenerating(false);
      if (onCompleteJourney) {
        onCompleteJourney({
          journeyType: 'national',
          destination: destination || 'Goa',
          dates: { start: departureDate, end: returnDate, flexible: isFlexibleDates },
          travelers: travelersCount,
          styles: selectedStyles,
          budget: decideBudgetLater ? 'Flexible' : budgetAmount,
        });
      } else {
        onBackToDashboard();
      }
    }, 3800);
  };

  // Dark mode text color for Video 3 ("Deep Woods", index 2)
  const isDeepWoods = activeVideo === 2;
  const textColorClass = isDeepWoods
    ? 'text-[#182C41] transition-colors duration-700'
    : 'text-white transition-colors duration-700';
  const subtextColorClass = isDeepWoods
    ? 'text-[#182C41]/80 transition-colors duration-700'
    : 'text-white/80 transition-colors duration-700';

  return (
    <section className="relative w-full min-h-screen h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black">
      {/* 1. Fullscreen Stack of 4 Looping Videos */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {VIDEOS.map((vid, idx) => (
          <video
            key={vid.id}
            src={vid.url}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] ease-in-out ${
              activeVideo === idx ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Transparent PNG Overlay with train-bob animation */}
        <img
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
          alt="Cinematic train overlay"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-[1] animate-train-bob opacity-90 mix-blend-screen"
        />

        {/* Subtle Dark/Light Gradient Overlay for perfect typography legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70 z-[1] pointer-events-none" />
      </div>

      {/* 2. Top Navigation Bar (z-10) */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 sm:py-8 flex items-center justify-between">
        {/* Back Arrow & Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-full liquid-glass text-white hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onBackToDashboard();
            }}
            className="font-instrument italic text-2xl sm:text-3xl text-white select-none inline-flex items-baseline"
          >
            <span>Aethera</span>
            <sup className="text-xs font-sans ml-0.5 relative -top-3">°</sup>
          </a>
        </div>

        {/* Right Side: Step Progress & Save Draft */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="hidden sm:inline-flex px-4 py-1.5 rounded-full liquid-glass text-xs font-mono uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            Save Draft
          </button>

          <div className="px-3.5 py-1.5 rounded-full liquid-glass font-mono text-xs text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-white font-bold">0{currentStep}</span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">03</span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline text-white/80">
              {currentStep === 1 ? 'Destination' : currentStep === 2 ? 'Preferences' : 'Review'}
            </span>
          </div>
        </div>
      </header>

      {/* 3. Main Center Content Container (z-10) */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 h-[calc(100vh-170px)] sm:h-[calc(100vh-180px)] flex flex-col justify-center items-center text-center overflow-y-auto no-scrollbar">
        {/* =========================================================================
            STAGE 1: DESTINATION SEARCH
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col items-center animate-fade-rise">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/90">
                NATIONAL JOURNEY
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`font-instrument text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-headline leading-none max-w-4xl select-none ${textColorClass}`}
              style={{ letterSpacing: '-2.46px', lineHeight: '0.98' }}
            >
              Where will you go next?
            </h1>

            <p
              className={`font-inter text-sm sm:text-base max-w-xl mt-4 leading-relaxed ${subtextColorClass}`}
            >
              Tell us what kind of journey you're imagining, and we'll help you shape every detail.
            </p>

            {/* Large Liquid Glass Destination Input */}
            <div className="w-full max-w-xl mt-8">
              <div className="relative flex items-center liquid-glass rounded-full px-6 h-16 shadow-2xl focus-within:ring-1 focus-within:ring-white/60 transition-all">
                <MapPin className="w-5 h-5 text-white/70 mr-3 shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && destination.trim()) {
                      setCurrentStep(2);
                    }
                  }}
                  placeholder="Search for a destination (e.g. Goa, Kerala, Rajasthan...)"
                  className="w-full bg-transparent text-white placeholder:text-white/40 font-inter text-base sm:text-lg focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (destination.trim()) setCurrentStep(2);
                  }}
                  disabled={!destination.trim()}
                  className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer shrink-0 ml-2"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Suggested Destinations Pills */}
            <div className="mt-6 flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-white/50 mb-3">
                POPULAR IN INDIA
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {POPULAR_DESTINATIONS.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => {
                      setDestination(place);
                      setCurrentStep(2);
                    }}
                    className="px-4 py-1.5 rounded-full liquid-glass text-xs font-inter text-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 2: PREFERENCES (STYLES, DATES, TRAVELERS, BUDGET)
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="w-full max-w-3xl flex flex-col items-center animate-fade-rise py-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass mb-3">
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/90">
                {destination.toUpperCase()} · STEP 02
              </span>
            </div>

            <h2
              className={`font-instrument text-3xl sm:text-5xl md:text-6xl tracking-headline leading-none mb-6 ${textColorClass}`}
            >
              How do you want to experience it?
            </h2>

            {/* 1. Journey Styles Selection */}
            <div className="w-full mb-6">
              <span className="block text-xs font-mono uppercase text-white/60 mb-2.5">
                JOURNEY STYLES (SELECT MULTIPLE)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {JOURNEY_STYLES.map((st) => {
                  const isSelected = selectedStyles.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleStyle(st)}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black shadow-lg scale-105'
                          : 'liquid-glass text-white/80 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dates, Travelers & Budget in 3-column Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8">
              {/* Dates */}
              <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between">
                <label className="text-[10px] font-mono uppercase text-white/60 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> WHEN ARE YOU GOING?
                </label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="text-white/60 font-mono">DEP:</span>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      disabled={isFlexibleDates}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="text-white/60 font-mono">RET:</span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      disabled={isFlexibleDates}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFlexibleDates(!isFlexibleDates)}
                  className={`mt-2 text-[11px] font-mono px-2 py-0.5 rounded text-center transition-colors ${
                    isFlexibleDates ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {isFlexibleDates ? '✓ Flexible Dates' : "I'm flexible with dates"}
                </button>
              </div>

              {/* Travelers */}
              <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between">
                <label className="text-[10px] font-mono uppercase text-white/60 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" /> WHO'S COMING?
                </label>
                <div className="flex items-center justify-between py-1">
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.max(1, travelersCount - 1))}
                    className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                  >
                    -
                  </button>
                  <span className="font-instrument text-2xl text-white">
                    {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelersCount(Math.min(20, travelersCount + 1))}
                    className="w-7 h-7 rounded-full liquid-glass flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center justify-between gap-1 mt-2 overflow-x-auto no-scrollbar">
                  {TRAVELER_PRESETS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (p === 'Solo') setTravelersCount(1);
                        if (p === 'Couple') setTravelersCount(2);
                        if (p === 'Friends' || p === 'Family') setTravelersCount(4);
                        if (p === 'Group') setTravelersCount(6);
                      }}
                      className="text-[10px] font-mono text-white/60 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="liquid-glass rounded-2xl p-4 flex flex-col justify-between">
                <label className="text-[10px] font-mono uppercase text-white/60 mb-1 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> ESTIMATED BUDGET
                </label>
                {!decideBudgetLater ? (
                  <div className="flex items-center gap-1 py-1">
                    <span className="font-mono text-sm text-white/60">₹</span>
                    <input
                      type="text"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="50,000"
                      className="w-full bg-transparent text-white font-instrument text-2xl focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="py-2 text-xs font-mono text-white/80">To be decided later</div>
                )}
                <div className="flex items-center justify-between gap-1 mt-2">
                  {BUDGET_TIERS.map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        setSelectedBudgetTier(tier);
                        setDecideBudgetLater(false);
                      }}
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                        selectedBudgetTier === tier && !decideBudgetLater
                          ? 'bg-white text-black'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-6 py-3 rounded-full liquid-glass text-xs font-medium text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                ← Edit Destination
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-9 py-3.5 rounded-full bg-white text-black text-sm font-medium hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <span>Review & Synthesize</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            STAGE 3: REVIEW & AI ITINERARY GENERATION
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-rise">
            {/* Loading Modal if Generating */}
            {isGenerating ? (
              <div className="liquid-glass rounded-3xl p-10 max-w-md w-full flex flex-col items-center text-center animate-fade-rise">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 relative">
                  <Sparkles className="w-8 h-8 text-white animate-spin" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                </div>
                <h3 className="font-instrument text-3xl text-white mb-2">{generatingStage}</h3>
                <p className="text-xs text-white/70 font-inter">
                  Synthesizing optimal stays, routes, and local insider stops for {destination || 'Goa'}.
                </p>
              </div>
            ) : (
              /* Review Dossier Card */
              <div className="w-full liquid-glass rounded-3xl p-8 sm:p-10 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                  <span className="text-xs font-mono uppercase tracking-widest text-white/60">
                    VOYAGE DOSSIER · READY TO BEGIN
                  </span>
                  <span className="text-xs font-mono bg-white text-black px-2.5 py-0.5 rounded-full">
                    NATIONAL
                  </span>
                </div>

                <h2 className="font-instrument text-4xl sm:text-5xl text-white leading-none mb-1">
                  {destination || 'Goa, India'}
                </h2>
                <p className="text-xs font-mono text-white/70 mb-6">
                  {isFlexibleDates ? 'Flexible Timing' : `${departureDate} — ${returnDate}`} · {travelersCount} TRAVELERS
                </p>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 mb-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-white/50 block">Experience Style</span>
                    <span className="text-sm font-inter text-white">{selectedStyles.join(' · ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-white/50 block">Target Budget</span>
                    <span className="font-instrument text-2xl text-white">
                      {decideBudgetLater ? 'Flexible' : `₹${Number(budgetAmount).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-mono text-white/70 hover:text-white underline cursor-pointer"
                  >
                    ← Edit Preferences
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateJourney}
                    className="rounded-full px-8 py-3.5 bg-white text-black text-sm font-medium hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Create My Journey</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. Bottom Video Switcher (z-10) */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          {VIDEOS.map((vid, idx) => (
            <button
              key={vid.id}
              type="button"
              onClick={() => handleVideoSwitch(idx)}
              className={`text-xs font-mono uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap pb-0.5 ${
                activeVideo === idx
                  ? 'text-white font-bold border-b-2 border-white opacity-100'
                  : 'text-white/50 hover:text-white/80 border-b-2 border-transparent'
              }`}
            >
              0{vid.id + 1} / {vid.title}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6 text-xs text-white/60 font-mono">
          <span>60+ Curated Havens</span>
          <span>•</span>
          <span>Aethera National Studio</span>
        </div>
      </footer>
    </section>
  );
};
