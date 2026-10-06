import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X, Sparkles, AlertCircle, Lock, Mail, User as UserIcon } from 'lucide-react';
import { travelStorage } from '../../services/travelStorage';

interface ScenicTrainAuthProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

const SCENES = [
  {
    id: 'golden-hour',
    title: 'GOLDEN HOUR',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4',
  },
  {
    id: 'still-water',
    title: 'STILL WATER',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4',
  },
  {
    id: 'deep-woods',
    title: 'DEEP WOODS',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4',
  },
  {
    id: 'quiet-dawn',
    title: 'QUIET DAWN',
    url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4',
  },
];

export const ScenicTrainAuth: React.FC<ScenicTrainAuthProps> = ({ onAuthSuccess, onBack }) => {
  const [activeVideo, setActiveVideo] = useState<number>(() => Math.floor(Math.random() * SCENES.length));
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnteringJourney, setIsEnteringJourney] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const scheduleNextTransition = () => {
      // Random delay between 5000ms and 6000ms (5–6 seconds)
      const delay = Math.floor(Math.random() * 1000) + 5000;

      timeoutId = window.setTimeout(() => {
        setActiveVideo((current) => {
          // Exclude the current active scene so we never select the same background twice in a row
          const candidates = SCENES
            .map((_, idx) => idx)
            .filter((idx) => idx !== current);
          const nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
          return nextIndex;
        });

        // After each background change, schedule next transition with a new random delay
        scheduleNextTransition();
      }, delay);
    };

    scheduleNextTransition();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const validateForm = (): boolean => {
    setError(null);
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return false;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    return true;
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    // Simulate authenticating against existing user session and local storage
    setTimeout(() => {
      try {
        const sessionPayload = {
          token: 'aethera_jwt_' + Math.random().toString(36).substring(2, 15),
          user: {
            name: mode === 'signup' ? name.trim() : (name.trim() || 'Aravind S.'),
            email: email.trim(),
            avatar: 'A',
          },
          authenticatedAt: new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          window.localStorage.setItem('aethera.auth_token', sessionPayload.token);
          window.localStorage.setItem('aethera.session', JSON.stringify(sessionPayload));
        }

        // Save profile if signup
        if (mode === 'signup' && name.trim()) {
          const currentProfile = travelStorage.getProfile();
          travelStorage.saveProfile({
            ...currentProfile,
            name: name.trim(),
            email: email.trim(),
          });
        }

        // Trigger cinematic departure transition
        setIsSubmitting(false);
        setIsEnteringJourney(true);

        setTimeout(() => {
          onAuthSuccess();
        }, 1200);
      } catch {
        setIsSubmitting(false);
        setError('Authentication encounter an issue. Please try again.');
      }
    }, 900);
  };

  // Quick Demo Guest Fill
  const handleQuickDemo = () => {
    setEmail('aravind.s@aethera.travel');
    setPassword('secret123');
    setName('Aravind S.');
    setMode('signin');
    setError(null);
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black select-none font-sans text-white">
      {/* 1. Background Scenic Video Layer (Multi-video with crossfade) */}
      <div 
        className={`absolute inset-0 w-full h-full pointer-events-none z-0 transition-all duration-1200 ${
          isEnteringJourney ? 'scale-105 brightness-110' : 'scale-100'
        }`}
      >
        {SCENES.map((scene, idx) => (
          <video
            key={scene.id}
            src={scene.url}
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

      {/* Atmospheric Vignette & Dusk Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-[1]" />

      {/* 2. Transparent Cinematic Scenic Train Window Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] flex items-center justify-center overflow-hidden">
        <img
          src="https://soft-zoom-63098134.figma.site/_assets/v11/0b4a435b2df2747593c43d7a1c9b4578f7d8d90c.png"
          alt="Cinematic Scenic Train Carriage Window Overlay"
          className={`w-full h-full object-cover animate-train-bob transition-opacity duration-700 ${
            isEnteringJourney ? 'opacity-30' : 'opacity-100'
          }`}
          style={{ transformOrigin: 'center center' }}
        />
      </div>

      {/* 3. Interactive Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 sm:py-8">
        
        {/* Top Header with Back / Return */}
        <header className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="liquid-glass rounded-full p-2.5 sm:px-4 sm:py-2 text-white/90 hover:text-white text-xs font-mono transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Return to Landing Page"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <span className="font-instrument text-2xl sm:text-3xl tracking-tight text-white select-none inline-flex items-baseline ml-2">
              <span>Aethera</span>
              <sup className="text-xs font-sans ml-0.5 relative -top-3">®</sup>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="hidden sm:inline-flex liquid-glass rounded-full px-4 py-1.5 text-xs font-mono text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer items-center gap-1.5 border border-white/20"
              title="Auto-fill demo credentials"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Fill Demo Account</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="liquid-glass rounded-full p-2.5 text-white/80 hover:text-white transition-all cursor-pointer hover:scale-105"
              aria-label="Close"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Center: Cinematic Scenic Authentication Card */}
        <main className="max-w-md w-full mx-auto my-auto flex flex-col items-center justify-center">
          {isEnteringJourney ? (
            /* Cinematic Transition View */
            <div className="text-center animate-fade-rise flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/30 relative">
                <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                <div className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </div>
              <h2 className="font-instrument text-4xl sm:text-5xl text-white tracking-tight leading-tight mb-2">
                Entering Journey
              </h2>
              <p className="font-inter text-sm text-white/70 tracking-wide">
                Preparing your private luxury travel studio...
              </p>
            </div>
          ) : (
            /* Glassmorphic Auth Form */
            <div className="w-full liquid-glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/25 bg-black/40 backdrop-blur-xl animate-fade-rise text-white">
              
              {/* Brand Title */}
              <div className="text-center mb-8">
                <span className="font-instrument text-4xl sm:text-5xl tracking-tight text-white block mb-2 leading-none">
                  Aethera
                </span>
                <h3 className="font-instrument text-2xl text-white/95 font-normal">
                  Welcome to Aethera
                </h3>
                <p className="text-xs font-inter text-white/70 mt-1">
                  Begin your journey with us.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-full bg-white/10 p-1 mb-6 border border-white/15">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-full transition-all duration-200 cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-full transition-all duration-200 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-black font-semibold shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 px-3.5 py-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 backdrop-blur-md flex items-center gap-2.5 text-xs text-red-200 animate-fade-rise">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aravind S."
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                      />
                      <UserIcon className="w-4 h-4 text-white/40 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aravind@aethera.travel"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                    />
                    <Mail className="w-4 h-4 text-white/40 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                    />
                    <Lock className="w-4 h-4 text-white/40 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Continue CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full py-3.5 px-6 bg-white text-black font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-neutral-100 shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Entering journey...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Mode Switcher Footer */}
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                {mode === 'signin' ? (
                  <p className="text-xs text-white/70 font-inter">
                    New to Aethera?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="text-white font-medium underline underline-offset-4 hover:text-neutral-200 cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-white/70 font-inter">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError(null);
                      }}
                      className="text-white font-medium underline underline-offset-4 hover:text-neutral-200 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Bottom Ambient Footer */}
        <footer className="relative z-10 w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 text-xs text-white/60 font-mono">
            <span>Scenic Railway Voyage</span>
            <span>•</span>
            <span>Aethera Authentication Engine</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
            <span>Autonomous Ambient Journey</span>
          </div>
        </footer>
      </div>
    </section>
  );
};
