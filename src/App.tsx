import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VideoBackground } from './components/VideoBackground';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { JourneyPlanner } from './components/dashboard/JourneyPlanner';
import { JourneyDetail } from './components/dashboard/JourneyDetail';
import { TripProvider } from './context/TripContext';

import { LumoraTrainExperience } from './components/LumoraTrainExperience';
import { ScenicTrainAuth } from './components/auth/ScenicTrainAuth';

import { JourneyCalendar } from './components/dashboard/JourneyCalendar';

export function App() {
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
        <Navbar onBeginJourney={() => setCurrentView('auth')} />

        {/* Hero Section centered in the dashboard */}
        <HeroSection onBeginJourney={() => setCurrentView('auth')} />

        {/* Spacer to perfectly balance the navbar height on desktop */}
        <div className="hidden md:block h-[88px] pointer-events-none" />
      </main>
    ) : (
      <div className="animate-fade-rise">
        <DashboardPage 
          onGoToLanding={() => setCurrentView('landing')} 
          onNavigate={navigate}
        />
      </div>
    );
  };

  return (
    <TripProvider>
      <div className="w-full min-h-screen font-sans bg-white">
        {renderPathView()}
      </div>
    </TripProvider>
  );
}

export default App;
