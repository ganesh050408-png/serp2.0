import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VideoBackground } from './components/VideoBackground';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { JourneyPlanner } from './components/dashboard/JourneyPlanner';
import { JourneyDetail } from './components/dashboard/JourneyDetail';
import { TripProvider } from './context/TripContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LumoraTrainExperience } from './components/LumoraTrainExperience';
import { ScenicTrainAuth } from './components/auth/ScenicTrainAuth';

import { JourneyCalendar } from './components/dashboard/JourneyCalendar';
import { HospitalsPage } from './components/dashboard/HospitalsPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { user, isLoading } = useAuth();

  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.search.includes('join=')) {
        return 'dashboard';
      }
      if (window.location.pathname.startsWith('/auth')) {
        return 'auth';
      }
    }
    return 'landing';
  });

  const [currentPath, setCurrentPath] = useState<string>(() => 
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('join=')) {
      setCurrentView('dashboard');
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to parse /journey/:id or /journeys/:id route
  const getJourneyIdFromPath = (path: string): string | null => {
    const match = path.match(/^\/(?:journey|journeys)\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  };

  const journeyId = getJourneyIdFromPath(currentPath);

  // Protected route enforcement
  useEffect(() => {
    if (isLoading) return;

    const isExplicitAuthPath = currentPath === '/auth' || currentPath === '/auth/journey';
    const isProtectedPath =
      currentPath.startsWith('/plan') ||
      currentPath.startsWith('/planner') ||
      currentPath.startsWith('/journey') ||
      currentPath.startsWith('/journeys') ||
      currentPath.startsWith('/train') ||
      currentPath.startsWith('/lumora') ||
      currentPath.startsWith('/hospitals');

    // If logged out and attempting to access a protected path or dashboard view
    if (!user) {
      if (isProtectedPath || currentView === 'dashboard') {
        setCurrentView('auth');
        if (!isExplicitAuthPath) {
          navigate('/auth');
        }
      }
    } else {
      // If logged in and on the auth page, proceed to dashboard
      if (isExplicitAuthPath || currentView === 'auth') {
        setCurrentView('dashboard');
        if (currentPath.startsWith('/auth')) {
          navigate('/');
        }
      }
    }
  }, [user, isLoading, currentPath, currentView]);

  // Loading state placeholder while resolving initial session
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-[#FAF8F5] flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs text-[#6F6F6F] tracking-widest uppercase">Restoring Sanctuary Session...</span>
      </div>
    );
  }

  // Render correct view based on path
  const renderPathView = () => {
    if (currentPath === '/train' || currentPath === '/lumora' || currentPath === '/train-experience') {
      return (
        <div className="animate-fade-rise">
          <LumoraTrainExperience
            onContinueToPlanner={() => navigate('/planner/new')}
            onClose={() => navigate('/')}
            onEnterDashboard={() => navigate('/')}
            onNavigate={navigate}
          />
        </div>
      );
    }

    if (currentPath === '/plan' || currentPath === '/planner/intro' || currentPath === '/planner/new' || currentPath === '/journeys/new' || currentPath === '/journeys/new/national' || currentPath === '/journeys/new/international') {
      return (
        <div className="animate-fade-rise">
          <JourneyPlanner onNavigate={navigate} />
        </div>
      );
    }

    if (journeyId && currentPath.endsWith('/calendar')) {
      return (
        <div className="animate-fade-rise">
          <JourneyCalendar journeyId={journeyId} onNavigate={navigate} />
        </div>
      );
    }
    
    if (journeyId && journeyId !== 'new') {
      return (
        <div className="animate-fade-rise">
          <JourneyDetail journeyId={journeyId} onNavigate={navigate} />
        </div>
      );
    }

    if (currentPath === '/hospitals' || currentPath === '/hospitals-near-me') {
      return (
        <div className="animate-fade-rise">
          <ErrorBoundary fallbackTitle="Unable to load Hospitals directory">
            <HospitalsPage onNavigate={navigate} />
          </ErrorBoundary>
        </div>
      );
    }

    if (currentPath === '/auth' || currentPath === '/auth/journey' || currentView === 'auth') {
      return (
        <div className="animate-fade-rise">
          <ScenicTrainAuth
            onAuthSuccess={() => {
              setCurrentView('dashboard');
              if (currentPath.startsWith('/auth')) {
                navigate('/');
              }
            }}
            onBack={() => {
              setCurrentView('landing');
              if (currentPath.startsWith('/auth')) {
                navigate('/');
              }
            }}
          />
        </div>
      );
    }

    // Default to main home page or dashboard
    return currentView === 'landing' ? (
      <main className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-white selection:bg-black selection:text-white animate-fade-rise">
        {/* Background Video Layer with Gradients */}
        <VideoBackground />

        {/* Navigation Bar */}
        <Navbar onBeginJourney={() => {
          if (user) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('auth');
            navigate('/auth');
          }
        }} />

        {/* Hero Section centered in the dashboard */}
        <HeroSection onBeginJourney={() => {
          if (user) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('auth');
            navigate('/auth');
          }
        }} />

        {/* Spacer to perfectly balance the navbar height on desktop */}
        <div className="hidden md:block h-[88px] pointer-events-none" />
      </main>
    ) : (
      <DashboardPage 
        onGoToLanding={() => setCurrentView('landing')} 
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="w-full min-h-screen font-sans bg-white">
      {renderPathView()}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
