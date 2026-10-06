import { useState } from 'react';
import { DashboardNavbar } from './DashboardNavbar';
import { DashboardHero } from './DashboardHero';
import { CurrentJourneyCard } from './CurrentJourneyCard';
import { MyJourneysSection } from './MyJourneysSection';
import { CreateJourneySection } from './CreateJourneySection';
import { AIPlannerSection } from './AIPlannerSection';
import { UpcomingItinerary } from './UpcomingItinerary';
import { TravelBudget } from './TravelBudget';
import { JourneyMap } from './JourneyMap';
import { TravelTogether } from './TravelTogether';
import { DestinationDiscovery } from './DestinationDiscovery';
import { AIAssistantDrawer } from './AIAssistantDrawer';
import { DashboardFooter } from './DashboardFooter';
import { ProfileDrawer } from './ProfileDrawer';
import { JournalDrawer } from './JournalDrawer';
import { DestinationDetailModal } from './DestinationDetailModal';
import { TransportationStudio } from './TransportationStudio';

// Flagship feature components (context-backed)
import { ItineraryBoard } from './ItineraryBoard';
import { WeatherAlertBanner } from './WeatherAlertBanner';
import { FestivalRecommendations } from './FestivalRecommendations';
import { TripPDFExport } from './TripPDFExport';

// Live Journey Mode Components
import { LiveJourneyHero } from '../live/LiveJourneyHero';
import { LiveLocationMap } from '../live/LiveLocationMap';
import { QuickAssistanceGrid, ServiceCategory } from '../live/QuickAssistanceGrid';
import { TodayLiveItinerary } from '../live/TodayLiveItinerary';
import { SmartTravelSuggestions } from '../live/SmartTravelSuggestions';
import { GroupLocationSharing } from '../live/GroupLocationSharing';
import { ServiceModals } from '../live/ServiceModals';
import { LiveTravelCompanionDrawer } from '../live/LiveTravelCompanionDrawer';

// Create Journey Flow Components
import { CreateJourneyModal } from '../planner/CreateJourneyModal';
import { NationalJourney } from '../planner/NationalJourney';
import { InternationalJourney } from '../planner/InternationalJourney';

// Storage services
import { travelStorage, StoredJourney } from '../../services/travelStorage';
import { getOrCreateDestination } from '../../services/destinations';

interface DashboardPageProps {
  onGoToLanding: () => void;
  onNavigate: (path: string) => void;
}

export const DashboardPage = ({ onGoToLanding, onNavigate }: DashboardPageProps) => {
  // Mode state: 'planning' (before trip) or 'live' (active in-destination companion)
  const [tripMode, setTripMode] = useState<'planning' | 'live'>('planning');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState<ServiceCategory | null>(null);

  // Drawer / Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [selectedDestinationName, setSelectedDestinationName] = useState<string | null>(null);

  // Create Journey Flow states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activePlanningJourney, setActivePlanningJourney] = useState<'national' | 'international' | null>(null);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestRide = (_destination?: string) => {
    setActiveServiceCategory('rides');
  };

  const handleSelectJourney = (id: string) => {
    onNavigate(`/journey/${id}`);
  };

  const handleCompleteCreation = (data: any) => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : `journey_${Date.now()}`;
    const dest = getOrCreateDestination(data.destination || 'Goa');

    const newJourney: StoredJourney = {
      id: newId,
      destination: (data.destination || 'Goa').toUpperCase(),
      budget: typeof data.budget === 'number' ? data.budget : 50000,
      travelers: data.travelers || 2,
      style: Array.isArray(data.styles) ? data.styles.join(' · ') : 'Coastal & Heritage',
      createdAt: new Date().toISOString(),
      status: 'Upcoming',
      destinations: [dest],
      startDate: data.dates?.start || '2026-06-12',
      endDate: data.dates?.end || '2026-06-21',
      datesDecided: !data.dates?.flexible,
      travellersBreakdown: { adults: data.travelers || 2, children: 0 },
      budgetValue: {
        amount: typeof data.budget === 'number' ? data.budget : 50000,
        label: typeof data.budget === 'string' ? data.budget : `₹${(data.budget || 50000).toLocaleString()}`,
      },
      interests: data.styles || ['culture', 'relaxed'],
      pace: 'balanced',
      coverImage: dest.image,
      itinerary: [
        {
          dayNumber: 1,
          date: 'Day 1',
          city: dest.city,
          activities: [
            `Arrival and check-in at ${dest.city} haven`,
            `Evening leisurely exploration and sunset walk`,
            `Welcome dinner featuring local specialties`,
          ],
        },
        {
          dayNumber: 2,
          date: 'Day 2',
          city: dest.city,
          activities: [
            `Morning guided exploration of ${dest.attractions[0] || 'landmarks'}`,
            `Afternoon scenic excursion and local artisan discovery`,
            `Sunset dinner overlooking the waterfront`,
          ],
        },
        {
          dayNumber: 3,
          date: 'Day 3',
          city: dest.city,
          activities: [
            `Signature experience at ${dest.attractions[1] || 'heritage sites'}`,
            `Leisurely farewell lunch and journey wrap-up`,
          ],
        },
      ],
    };

    travelStorage.saveJourney(newJourney);
    setActivePlanningJourney(null);
    onNavigate(`/journey/${newId}`);
  };

  // If user is currently in a fullscreen National or International journey planning flow:
  if (activePlanningJourney === 'national') {
    return (
      <NationalJourney
        onBackToDashboard={() => setActivePlanningJourney(null)}
        onCompleteJourney={handleCompleteCreation}
      />
    );
  }

  if (activePlanningJourney === 'international') {
    return (
      <InternationalJourney
        onBackToDashboard={() => setActivePlanningJourney(null)}
        onCompleteJourney={handleCompleteCreation}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-white text-[#000000] font-sans selection:bg-black selection:text-white">
      {/* Top Navbar with Mode Toggle */}
      <DashboardNavbar
        onOpenAI={() => setIsAIOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        onGoToLanding={onGoToLanding}
        onNavigateSection={scrollToSection}
        tripMode={tripMode}
        onToggleTripMode={(mode) => setTripMode(mode)}
      />

      {/* =========================================================================
          LIVE JOURNEY MODE (Active in Goa, Day 4)
      ========================================================================= */}
      {tripMode === 'live' ? (
        <div className="animate-fade-rise">
          {/* Live Hero with Weather & Checkpoint */}
          <LiveJourneyHero
            onOpenMap={() => scrollToSection('live-map')}
            onOpenAI={() => setIsAIOpen(true)}
          />

          {/* Weather alerts for the current city (feature G) */}
          <WeatherAlertBanner city="Goa" className="pt-8" />

          {/* Proactive Smart Travel Suggestions */}
          <SmartTravelSuggestions
            onActionClick={(type) => {
              if (type === 'request_ride') setActiveServiceCategory('rides');
            }}
          />

          {/* Large Live Location Map & Waypoint Route */}
          <LiveLocationMap
            onRequestRide={() => {
              setActiveServiceCategory('rides');
            }}
          />

          {/* Quick Assistance & "I'm Not Feeling Well" Grid */}
          <QuickAssistanceGrid
            onSelectCategory={(category) => setActiveServiceCategory(category)}
          />

          {/* Today's Chronological Live Itinerary */}
          <TodayLiveItinerary
            onNavigate={() => scrollToSection('live-map')}
            onGetRide={() => setActiveServiceCategory('rides')}
          />

          {/* Proximity & Companion Location Sharing */}
          <GroupLocationSharing />

          {/* Live Budget & Expenditure Monitor */}
          <TravelBudget />

          {/* Floating AI Travel Companion (Live context) */}
          <LiveTravelCompanionDrawer
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            onOpen={() => setIsAIOpen(true)}
            onRequestRide={handleRequestRide}
            onOpenCategory={(cat) => setActiveServiceCategory(cat)}
          />
        </div>
      ) : (
        /* =========================================================================
            PLANNING MODE (Trip Studio & Future Explorations)
        ========================================================================= */
        <div className="animate-fade-rise">
          {/* 4. Dashboard Hero Greeting with Train Hover Animation and Direct Planner Navigation */}
          <DashboardHero
            onPlanNew={() => onNavigate('/plan')}
            onExplore={() => scrollToSection('discovery')}
            onOpenTrain={() => onNavigate('/train')}
          />

          {/* 6 & 7. Current Journey Cinematic Card + Minimal Trip Status */}
          <CurrentJourneyCard
            onContinueJourney={() => setTripMode('live')}
          />

          {/* Editable, reorderable itinerary — drag to plan (feature H) */}
          <ItineraryBoard />

          {/* 8. My Journeys Editorial Collection */}
          <MyJourneysSection onSelectJourney={handleSelectJourney} />

          {/* 9. Create Journey Section ("Dream somewhere new") */}
          <CreateJourneySection
            onCreateTrip={(details) => {
              handleCompleteCreation({
                destination: details.destination,
                budget: details.budget,
                travelers: Number(details.travelers) || 2,
                styles: [details.style],
              });
            }}
          />

          {/* 10. AI Planner ("Let AI plan the details") */}
          <AIPlannerSection />

          {/* 11. Upcoming Itinerary */}
          <UpcomingItinerary onOpenJourney={handleSelectJourney} />

          {/* 12. Travel Budget (Monochrome & Editorial) */}
          <TravelBudget />

          {/* Festival & event recommendations timed to the trip (feature K) */}
          <FestivalRecommendations />

          {/* Downloadable trip PDF (feature L) */}
          <TripPDFExport variant="banner" />

          {/* 13. Interactive Journey Map */}
          <JourneyMap
            onSelectCity={(city, journeyId) => {
              if (journeyId) {
                onNavigate(`/journey/${journeyId}`);
              } else {
                setSelectedDestinationName(city);
              }
            }}
            onOpenLiveMap={() => setTripMode('live')}
          />

          {/* Transportation Studio (Decision Screen + Bike & Flight Booking Flows) */}
          <TransportationStudio
            onOpenTrainExperience={() => onNavigate('/train')}
            onNavigate={onNavigate}
          />

          {/* 14. Travel Together Collaboration */}
          <TravelTogether
            onOpenJourney={handleSelectJourney}
            onNavigateSection={scrollToSection}
          />

          {/* 16. Destination Discovery Magazine Showcase */}
          <DestinationDiscovery
            onSelectDestination={(name, journeyId) => {
              if (journeyId) {
                onNavigate(`/journey/${journeyId}`);
              } else {
                setSelectedDestinationName(name);
              }
            }}
          />

          {/* Floating Planning AI Assistant */}
          <AIAssistantDrawer
            isOpen={isAIOpen}
            onClose={() => setIsAIOpen(false)}
            onOpen={() => setIsAIOpen(true)}
          />
        </div>
      )}

      {/* Create New Journey Modal (National vs International vs Custom Builder) */}
      <CreateJourneyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSelectType={(type) => {
          setIsCreateModalOpen(false);
          if (type === 'custom_builder') {
            onNavigate('/planner/new');
          } else {
            setActivePlanningJourney(type);
          }
        }}
      />

      {/* Service Modals (Hospitals, Rides, Pharmacies, Emergency SOS, etc.) */}
      <ServiceModals
        activeCategory={activeServiceCategory}
        onClose={() => setActiveServiceCategory(null)}
        onRequestRide={handleRequestRide}
      />

      {/* User Profile & Preferences Drawer */}
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onNavigate={onNavigate}
      />

      {/* Travel Journal Drawer */}
      <JournalDrawer
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
      />

      {/* Destination Haven Dossier Modal */}
      <DestinationDetailModal
        destinationName={selectedDestinationName}
        onClose={() => setSelectedDestinationName(null)}
        onPlanTrip={(_city) => {
          onNavigate('/planner/new');
        }}
      />

      {/* Editorial Footer */}
      <DashboardFooter
        onBackToTop={handleBackToTop}
        onGoToLanding={onGoToLanding}
      />
    </div>
  );
};
