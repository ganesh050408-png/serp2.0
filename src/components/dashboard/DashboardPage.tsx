import { useState } from 'react';
import { createPortal } from 'react-dom';
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
import { HospitalsNearMeModal } from './HospitalsNearMeModal';
import { TripNotificationCenter } from './TripNotificationCenter';
import { X } from 'lucide-react';

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
import { StoredJourney } from '../../services/travelStorage';
import { getOrCreateDestination } from '../../services/destinations';
import { useJourneys } from '../../context/useJourneys';

interface DashboardPageProps {
  onGoToLanding: () => void;
  onNavigate: (path: string) => void;
}

export const DashboardPage = ({ onGoToLanding, onNavigate }: DashboardPageProps) => {
  const { journeys, activeJourney, saveJourney } = useJourneys();

  // Active journey state (allows switching between journeys)
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const currentLiveJourney = journeys.find((j) => j.id === selectedJourneyId) || activeJourney;
  const currentLiveCity =
    currentLiveJourney?.destinations?.[0]?.city ||
    currentLiveJourney?.destinations?.[0]?.name ||
    currentLiveJourney?.city ||
    currentLiveJourney?.destination ||
    'Goa';

  // Mode state: 'planning' (before trip) or 'live' (active in-destination companion)
  const [tripMode, setTripMode] = useState<'planning' | 'live'>('planning');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState<ServiceCategory | null>(null);

  // Drawer / Modal states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isHospitalsModalOpen, setIsHospitalsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [selectedDestinationName, setSelectedDestinationName] = useState<string | null>(null);

  // Create Journey Flow states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [activePlanningJourney, setActivePlanningJourney] = useState<'national' | 'international' | null>(null);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    const dest = data.destinationInfo || getOrCreateDestination(data.destination || 'Goa');

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
      travelType: data.travelType || 'friends',
      members: data.members || [
        { id: 'user_you', name: 'You', role: 'owner' },
        { id: 'user_comp1', name: data.travelType === 'family' ? 'Family Member' : 'Friend 1', role: 'editor' },
      ],
      expenses: [],
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

    saveJourney(newJourney);
    setActivePlanningJourney(null);
    onNavigate('/');
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
        onOpenHospitals={() => onNavigate('/hospitals')}
        onOpenNotifications={() => setIsNotificationsModalOpen(true)}
        onGoToLanding={onGoToLanding}
        onNavigateSection={scrollToSection}
        tripMode={tripMode}
        onToggleTripMode={(mode) => setTripMode(mode)}
      />

      {/* =========================================================================
          LIVE JOURNEY MODE (Active in Goa, Day 4)
      ========================================================================= */}
      {tripMode === 'live' ? (
        <div>
          {/* Live Hero with Weather & Checkpoint */}
          <LiveJourneyHero
            journey={currentLiveJourney}
            journeys={journeys}
            onSelectJourney={(id) => setSelectedJourneyId(id)}
            onOpenMap={() => scrollToSection('live-map')}
            onOpenAI={() => setIsAIOpen(true)}
          />

          {/* Weather alerts for the current city (feature G) */}
          <WeatherAlertBanner city={currentLiveCity} className="pt-8" />

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
            journey={currentLiveJourney}
            onNavigate={() => scrollToSection('live-map')}
            onGetRide={() => setActiveServiceCategory('rides')}
          />

          {/* Proximity & Companion Location Sharing */}
          <GroupLocationSharing />

          {/* Live Budget & Expenditure Monitor */}
          <TravelBudget />
        </div>
      ) : (
        /* =========================================================================
            PLANNING MODE (Trip Studio & Future Explorations)
        ========================================================================= */
        <div>
          {/* 4. Dashboard Hero Greeting with Train Hover Animation and Direct Planner Navigation */}
          <DashboardHero
            onPlanNew={() => onNavigate('/planner/new')}
            onExplore={() => scrollToSection('discovery')}
            onOpenTrain={() => onNavigate('/train')}
          />

          {/* Destination Discovery Magazine Showcase ("Explore" - Places worth discovering) */}
          <DestinationDiscovery
            onSelectDestination={(name, journeyId) => {
              if (journeyId) {
                onNavigate(`/journey/${journeyId}`);
              } else {
                setSelectedDestinationName(name);
              }
            }}
          />

          {/* 6 & 7. Current Journey Cinematic Card + Minimal Trip Status */}
          <CurrentJourneyCard
            journey={activeJourney}
            onSelectJourney={handleSelectJourney}
            onPlanNew={() => onNavigate('/planner/new')}
            onContinueJourney={() => {
              if (activeJourney) {
                handleSelectJourney(activeJourney.id);
              }
            }}
          />

          {/* Editable, reorderable itinerary — drag to plan ("Shape every day.") */}
          <ItineraryBoard journey={activeJourney} onPlanNew={() => onNavigate('/planner/new')} />

          {/* 8. My Journeys Editorial Collection */}
          <MyJourneysSection
            journeys={journeys}
            onSelectJourney={handleSelectJourney}
            onPlanNew={() => onNavigate('/planner/new')}
          />

          {/* 9. Create Journey Section ("Dream somewhere new") */}
          <CreateJourneySection
            onCreateTrip={(details) => {
              handleCompleteCreation({
                destination: details.destination,
                destinationInfo: details.destinationInfo,
                budget: details.budget,
                travelers: Number(details.travelers) || 2,
                styles: [details.style],
              });
            }}
          />

          {/* 10. AI Planner ("Let AI plan the details") */}
          <AIPlannerSection />

          {/* Transportation Studio (Decision Screen + Bike & Flight Booking Flows - "Bikes & Rail") */}
          <TransportationStudio
            currentJourney={activeJourney}
            journeys={journeys}
            onOpenTrainExperience={() => onNavigate('/train')}
            onNavigate={onNavigate}
          />

          {/* 11. Upcoming Itinerary */}
          <UpcomingItinerary journey={activeJourney} onOpenJourney={handleSelectJourney} />

          {/* 12. Travel Budget (Monochrome & Editorial) */}
          <TravelBudget />

          {/* Festival & event recommendations timed to the trip (feature K) */}
          <FestivalRecommendations />

          {/* Downloadable trip PDF (feature L) */}
          <TripPDFExport variant="banner" />

          {/* 13. Interactive Journey Map */}
          <JourneyMap
            journey={activeJourney}
            journeys={journeys}
            onSelectCity={(city, journeyId) => {
              if (journeyId) {
                onNavigate(`/journey/${journeyId}`);
              } else {
                setSelectedDestinationName(city);
              }
            }}
            onOpenLiveMap={() => setTripMode('live')}
            onPlanNew={() => onNavigate('/planner/new')}
          />

          {/* 14. Travel Together Collaboration */}
          <TravelTogether
            onOpenJourney={handleSelectJourney}
            onNavigateSection={scrollToSection}
          />
        </div>
      )}

      {/* Floating AI Assistant / Travel Companion */}
      {tripMode === 'live' ? (
        <LiveTravelCompanionDrawer
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          onOpen={() => setIsAIOpen(true)}
          onRequestRide={handleRequestRide}
          onOpenCategory={(cat) => setActiveServiceCategory(cat)}
          journey={currentLiveJourney}
        />
      ) : (
        <AIAssistantDrawer
          isOpen={isAIOpen}
          onClose={() => setIsAIOpen(false)}
          onOpen={() => setIsAIOpen(true)}
          journey={activeJourney}
        />
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
        city={currentLiveCity}
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

      {/* Hospitals Near Me Live Modal */}
      {isHospitalsModalOpen && (
        <HospitalsNearMeModal
          isOpen={isHospitalsModalOpen}
          onClose={() => setIsHospitalsModalOpen(false)}
          defaultCity={activeJourney?.destinations?.[0]?.city || activeJourney?.city}
        />
      )}

      {/* Notifications Drawer Modal */}
      {isNotificationsModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="fixed inset-0 -z-10" onClick={() => setIsNotificationsModalOpen(false)} />
          <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative animate-fade-rise">
            <button
              onClick={() => setIsNotificationsModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#6F6F6F] hover:text-black rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <TripNotificationCenter
              journeyId={activeJourney?.id}
              onNavigate={(section) => {
                setIsNotificationsModalOpen(false);
                scrollToSection(section);
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Editorial Footer */}
      <DashboardFooter
        onBackToTop={handleBackToTop}
        onGoToLanding={onGoToLanding}
      />
    </div>
  );
};
