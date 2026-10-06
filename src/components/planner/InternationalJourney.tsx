import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Sparkles,
} from 'lucide-react';

interface InternationalJourneyProps {
  onBackToDashboard: () => void;
  onCompleteJourney?: (journeyData: any) => void;
}

const INTL_VIDEOS = [
  {
    id: 0,
    title: 'WATER WAVE',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4',
  },
  {
    id: 1,
    title: 'GRIDWAVE',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_032424_3c9c2a9d-807b-4482-80e6-dd6d9dfd4545.mp4',
  },
  {
    id: 2,
    title: 'LIGHT TUNNEL',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260627_094019_4214ea73-b963-46a4-8327-61489192de99.mp4',
  },
];

const GLOBAL_DESTINATIONS = [
  { name: 'Japan', tag: 'Tokyo & Kyoto Zen Temples', visa: 'e-Visa Required', currency: 'JPY ¥' },
  { name: 'Italy', tag: 'Amalfi Coast & Florence Renaissance', visa: 'Schengen Visa', currency: 'EUR €' },
  { name: 'Switzerland', tag: 'Alpine Glaciers & Zermatt Chalets', visa: 'Schengen Visa', currency: 'CHF Fr' },
  { name: 'Thailand', tag: 'Phuket Islands & Chiang Mai Mists', visa: 'Visa on Arrival', currency: 'THB ฿' },
  { name: 'Bali', tag: 'Uluwatu Cliffs & Ubud Sanctuaries', visa: 'e-VoA Active', currency: 'IDR Rp' },
  { name: 'Australia', tag: 'Sydney Harbour & Great Barrier Reef', visa: 'ETA Required', currency: 'AUD $' },
];

export const InternationalJourney: React.FC<InternationalJourneyProps> = ({
  onBackToDashboard,
  onCompleteJourney,
}) => {
  const [activeVideo, setActiveVideo] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>('Japan');
  const [travelers] = useState<number>(2);
  const [targetDuration] = useState<string>('12 Days');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Live 24h Clock
  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentTime(formatter.format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateInternational = () => {
    if (onCompleteJourney) {
      onCompleteJourney({
        journeyType: 'international',
        destination: selectedCountry,
        travelers,
        duration: targetDuration,
      });
    } else {
      onBackToDashboard();
    }
  };

  const isSlide1 = activeVideo === 0;
  const accentColor = isSlide1 ? '#F598F2' : '#FFFFFF';

  return (
    <section className="relative w-full min-h-screen h-screen overflow-hidden bg-black text-white selection:bg-[#F598F2] selection:text-black">
      {/* 1. Fullscreen Stack of 3 Looping Videos */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {INTL_VIDEOS.map((vid, idx) => (
          <video
            key={vid.id}
            src={vid.url}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
              activeVideo === idx ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        {/* Subtle Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none" />
      </div>

      {/* 2. Top Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer"
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
            className="font-instrument italic text-2xl sm:text-3xl text-white inline-flex items-baseline"
          >
            <span>Aethera</span>
            <sup className="text-xs font-sans ml-0.5 relative -top-3">°</sup>
            <span className="text-xs font-mono uppercase tracking-widest text-white/60 ml-3">
              / INTERNATIONAL
            </span>
          </a>
        </div>

        {/* Right Info: Live 24h Clock & Pulse Indicator */}
        <div className="flex items-center gap-6 text-xs font-mono text-white/80">
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-dot-pulse"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
            <span className="uppercase">GLOBAL DESK READY</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
            <span>CUP {currentTime || '12:00:00'}</span>
          </div>
        </div>
      </header>

      {/* 3. Main Center Content Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 h-[calc(100vh-170px)] flex flex-col justify-center items-center text-center overflow-y-auto no-scrollbar">
        <div className="w-full max-w-4xl flex flex-col items-center animate-fade-rise py-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-4">
            <Globe className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/90">
              CROSS-BORDER EXPEDITIONS
            </span>
          </div>

          <h1
            className="font-instrument text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-headline leading-none select-none mb-4 text-white"
            style={{ letterSpacing: '-2.46px', lineHeight: '0.96' }}
          >
            Where in the world will you go<span style={{ color: accentColor }}>.</span>
          </h1>

          <p className="font-inter text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed mb-8">
            Curated journeys across continents with automatic visa briefings, passport validity checks,
            and luxury global stays.
          </p>

          {/* Destination Selection Cards Grid */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {GLOBAL_DESTINATIONS.map((dest) => {
              const isSelected = selectedCountry === dest.name;
              return (
                <button
                  key={dest.name}
                  type="button"
                  onClick={() => setSelectedCountry(dest.name)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 backdrop-blur-md cursor-pointer flex flex-col justify-between h-[120px] ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-2xl scale-105'
                      : 'bg-white/10 text-white border-white/20 hover:border-white/60 hover:bg-white/15'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase opacity-70 block mb-1">
                      {dest.currency}
                    </span>
                    <h4 className="font-instrument text-2xl leading-none">{dest.name}</h4>
                  </div>
                  <span className="text-[10px] font-mono font-medium opacity-80 truncate block">
                    {dest.visa}
                  </span>
                </button>
              );
            })}
          </div>

          {/* International Dossier & Readiness Strip */}
          <div className="w-full max-w-3xl bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-5 mb-8 text-left grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5" style={{ color: accentColor }} />
              <div>
                <span className="text-[10px] font-mono uppercase text-white/60 block">Passport Check</span>
                <span className="text-xs font-inter text-white">6+ Months Validity Verified</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" style={{ color: accentColor }} />
              <div>
                <span className="text-[10px] font-mono uppercase text-white/60 block">Global Currency</span>
                <span className="text-xs font-inter text-white">Multi-Currency Card Enabled</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" style={{ color: accentColor }} />
              <div>
                <span className="text-[10px] font-mono uppercase text-white/60 block">Travel Protection</span>
                <span className="text-xs font-inter text-white">Emergency Medical Cover</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCreateInternational}
              className="rounded-full px-12 py-4 bg-white text-black text-sm font-medium hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-2 cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4" />
              <span>Synthesize {selectedCountry} Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* 4. Bottom Video Switcher (3 Videos) */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
          {INTL_VIDEOS.map((vid, idx) => (
            <button
              key={vid.id}
              type="button"
              onClick={() => setActiveVideo(idx)}
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
          <span>Global Expedition Studio</span>
          <span>•</span>
          <span>Aethera Worldwide</span>
        </div>
      </footer>
    </section>
  );
};
