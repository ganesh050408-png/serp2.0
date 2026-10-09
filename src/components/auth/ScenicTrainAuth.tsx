import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, X, Sparkles, AlertCircle, Lock, Mail, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const { signIn, signUp } = useAuth();
  const [activeVideo, setActiveVideo] = useState<number>(() => Math.floor(Math.random() * SCENES.length));
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnteringJourney, setIsEnteringJourney] = useState(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    const scheduleNextTransition = () => {
      // Transition video background every 5–6 seconds
      const delay = Math.floor(Math.random() * 1000) + 5000;

      timeoutId = window.setTimeout(() => {
        setActiveVideo((current) => {
          const candidates = SCENES
            .map((_, idx) => idx)
            .filter((idx) => idx !== current);
          const nextIndex = candidates[Math.floor(Math.random() * candidates.length)];
          return nextIndex;
        });
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

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return false;
    }

    if (mode === 'signup') {
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername || cleanUsername.length < 3) {
        setError('Username must be at least 3 characters.');
        return false;
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
        setError('Username may only contain letters, numbers, underscores, hyphens, and dots.');
        return false;
      }

      // Confirm password validation only (never stored)
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return false;
      }
    }

    return true;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const result = await signUp(username.trim(), email.trim(), password);
        if (!result.success) {
          setIsSubmitting(false);
          setError(result.error || 'Registration encountered an issue. Please try again.');
          return;
        }

        if (result.requiresEmailConfirmation) {
          setIsSubmitting(false);
          setEmailConfirmationRequired(true);
          return;
        }

        // Auto logged-in upon sign-up
        setIsSubmitting(false);
        setIsEnteringJourney(true);
        setTimeout(() => {
          onAuthSuccess();
        }, 1200);
      } else {
        // Sign-in flow
        const result = await signIn(email.trim(), password);
        if (!result.success) {
          setIsSubmitting(false);
          setError(result.error || 'Invalid credentials. Please verify your email and password.');
          return;
        }

        setIsSubmitting(false);
        setIsEnteringJourney(true);
        setTimeout(() => {
          onAuthSuccess();
        }, 1200);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'Authentication encountered an unexpected network error. Please try again.');
    }
  };

  // Demo fill helper for testing
  const handleQuickDemo = () => {
    setEmail('traveler@adhira.journey');
    setPassword('adhira2026!');
    setUsername('adhira_explorer');
    setConfirmPassword('adhira2026!');
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
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-6 sm:px-12 py-6 sm:py-8 overflow-y-auto">
        
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
              <span>Adhira</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="hidden sm:inline-flex liquid-glass rounded-full px-4 py-1.5 text-xs font-mono text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer items-center gap-1.5 border border-white/20"
              title="Auto-fill sample credentials"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Fill Sample Data</span>
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
        <main className="max-w-md w-full mx-auto my-auto flex flex-col items-center justify-center py-6">
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
                Connecting to your verified Supabase session...
              </p>
            </div>
          ) : emailConfirmationRequired ? (
            /* Email Confirmation Sent Notification */
            <div className="w-full liquid-glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/25 bg-black/60 backdrop-blur-xl animate-fade-rise text-white text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-instrument text-2xl sm:text-3xl text-white mb-2">
                Check Your Inbox
              </h3>
              <p className="text-xs sm:text-sm text-white/80 mb-6 font-inter leading-relaxed">
                We sent an authentication confirmation link to <span className="font-semibold text-white">{email}</span>. Click the link in your email to verify your account, then sign in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailConfirmationRequired(false);
                  setMode('signin');
                  setError(null);
                }}
                className="w-full rounded-full py-3 px-6 bg-white text-black font-medium text-sm transition-all hover:bg-neutral-100 shadow-xl cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            /* Glassmorphic Auth Form */
            <div className="w-full liquid-glass rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/25 bg-black/40 backdrop-blur-xl animate-fade-rise text-white">
              
              {/* Brand Title */}
              <div className="text-center mb-6">
                <span className="font-instrument text-4xl sm:text-5xl tracking-tight text-white block mb-2 leading-none">
                  Adhira
                </span>
                <h3 className="font-instrument text-2xl text-white/95 font-normal">
                  {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
                </h3>
                <p className="text-xs font-inter text-white/70 mt-1">
                  {mode === 'signin'
                    ? 'Sign in to access your curated travel sanctuary.'
                    : 'Register with Supabase Auth to begin your bespoke journeys.'}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-full bg-white/10 p-1 mb-5 border border-white/15">
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
                <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 backdrop-blur-md flex items-center gap-2.5 text-xs text-red-200 animate-fade-rise">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="aravind_travels"
                        required
                        autoComplete="username"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                      />
                      <UserIcon className="w-4 h-4 text-white/40 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="aravind@adhira.travel"
                      required
                      autoComplete="email"
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                    />
                    <Mail className="w-4 h-4 text-white/40 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                    />
                    <Lock className="w-4 h-4 text-white/40 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/75 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white focus:bg-white/15 transition-all"
                      />
                      <Lock className="w-4 h-4 text-white/40 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Continue CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full py-3 px-6 bg-white text-black font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-neutral-100 shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>{mode === 'signup' ? 'Creating account...' : 'Authenticating...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Mode Switcher Footer */}
              <div className="mt-5 pt-3 border-t border-white/10 text-center">
                {mode === 'signin' ? (
                  <p className="text-xs text-white/70 font-inter">
                    New to Adhira?{' '}
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
            <span>Supabase Auth Engine</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
            <span>Encrypted Session Storage</span>
          </div>
        </footer>
      </div>
    </section>
  );
};
