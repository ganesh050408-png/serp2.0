import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Trash2,
  Plus,
  X,
  RotateCcw,
  Edit3,
  Save,
  Share2,
  Copy,
  ChevronUp,
  ChevronDown,
  Hospital,
  Compass,
  DollarSign,
  Users,
  Plane,
  Bell,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  travelStorage,
  StoredJourney,
  ItineraryDay,
} from '../../services/travelStorage';
import { DestinationInfo, getOrCreateDestination } from '../../services/destinations';
import { useDestinationSearch } from '../../hooks/useDestinationSearch';
import { HospitalsNearMeModal } from './HospitalsNearMeModal';
import { JourneyBudgetPlanner } from './JourneyBudgetPlanner';
import { CollaboratorsManager } from './CollaboratorsManager';
import { DiscoverPlacesSection } from './DiscoverPlacesSection';
import { JourneyBookingsHub } from './JourneyBookingsHub';
import { TripNotificationCenter } from './TripNotificationCenter';
import { JourneyShareModal } from './JourneyShareModal';
import { EditJourneyModal } from './EditJourneyModal';

interface JourneyDetailProps {
  journeyId: string;
  onNavigate: (path: string) => void;
}

type JourneyTab =
  | 'overview'
  | 'itinerary'
  | 'discover'
  | 'budget'
  | 'bookings'
  | 'collaborators'
  | 'notifications';

export const JourneyDetail: React.FC<JourneyDetailProps> = ({ journeyId, onNavigate }) => {
  const [journey, setJourney] = useState<StoredJourney | null>(null);
  const [activeTab, setActiveTab] = useState<JourneyTab>('overview');

  // Modals state
  const [isHospitalsModalOpen, setIsHospitalsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit mode parameters state (inline editor)
  const [isEditingParams, setIsEditingParams] = useState(false);
  const [editCities, setEditCities] = useState<DestinationInfo[]>([]);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editDatesDecided, setEditDatesDecided] = useState(false);
  const [editAdults, setEditAdults] = useState(2);
  const [editChildren, setEditChildren] = useState(0);
  const [editBudgetLabel, setEditBudgetLabel] = useState('₹50,000');
  const [editCustomBudget, setEditCustomBudget] = useState('');
  const [editStyles, setEditStyles] = useState<string[]>([]);
  const [editPace, setEditPace] = useState('balanced');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Search destinations inside editor
  const [searchQuery, setSearchQuery] = useState('');
  const { results: searchResults } = useDestinationSearch(searchQuery);

  // Inline activity addition input states
  const [newActivityTexts, setNewActivityTexts] = useState<Record<number, string>>({});

  // Load journey data
  useEffect(() => {
    const list = travelStorage.getJourneys();
    let found = list.find((j) => j.id === journeyId);

    if (!found && journeyId) {
      const cityName = decodeURIComponent(journeyId).replace(/[-_]/g, ' ');
      const dest = getOrCreateDestination(cityName);
      const tempJourney: StoredJourney = {
        id: journeyId,
        destination: dest.city.toUpperCase(),
        budget: 54000,
        travelers: 2,
        style: dest.styles.join(' · ') || 'Cultural & Scenic',
        createdAt: new Date().toISOString(),
        status: 'Planning',
        destinations: [dest],
        startDate: '2026-07-15',
        endDate: '2026-07-22',
        datesDecided: true,
        travellersBreakdown: { adults: 2, children: 0 },
        budgetValue: { amount: 54000, label: '₹54,000' },
        interests: dest.styles || ['culture', 'nature', 'relaxed'],
        pace: 'balanced',
        coverImage: dest.image,
        itinerary: [
          {
            dayNumber: 1,
            date: 'Day 1',
            city: dest.city,
            activities: [
              {
                id: 'act-1',
                name: `Arrival & check-in at ${dest.city} boutique haven`,
                startTime: '10:00',
                endTime: '12:00',
                location: dest.city,
                description: 'Private airport transfer & check-in',
              },
              {
                id: 'act-2',
                name: `Evening stroll around ${dest.attractions[0] || 'heritage quarter'}`,
                startTime: '16:00',
                endTime: '18:30',
                location: dest.city,
                description: 'Explore scenic pathways and cultural landmarks',
              },
              {
                id: 'act-3',
                name: `Welcome dinner featuring local ${dest.city} cuisine`,
                startTime: '20:00',
                endTime: '22:00',
                location: dest.city,
                description: 'Regional gastronomic tasting menu',
              },
            ],
          },
        ],
      };
      found = tempJourney;
    }

    if (found) {
      setJourney(found);

      // Initialize edit states
      setEditCities(found.destinations || []);
      setEditStartDate(found.startDate || '');
      setEditEndDate(found.endDate || '');
      setEditDatesDecided(!!found.datesDecided);
      setEditAdults(found.travellersBreakdown?.adults ?? found.travelers);
      setEditChildren(found.travellersBreakdown?.children ?? 0);
      setEditPace(found.pace || 'balanced');
      setEditStyles(found.interests || []);

      if (found.budgetValue) {
        setEditBudgetLabel(found.budgetValue.label);
      } else {
        setEditBudgetLabel("I'll decide later");
      }
    }
  }, [journeyId]);

  if (!journey) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#6F6F6F]">
            ADHIRA GLOBAL ARCHIVE
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-black leading-tight">
            Explore Destinations
          </h2>
          <p className="text-sm font-inter text-[#6F6F6F]">
            This journey is ready to be designed. Shape your upcoming itinerary with our bespoke studio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('/planner/new')}
              className="w-full sm:w-auto rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
            >
              ✦ Plan a New Journey
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="w-full sm:w-auto rounded-full px-6 py-3.5 bg-neutral-100 text-black text-xs font-mono hover:bg-neutral-200 transition-all cursor-pointer"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate nights
  const getNightsCount = () => {
    if (journey.datesDecided || !journey.startDate || !journey.endDate) {
      return (journey.destinations?.length || 1) * 3;
    }
    const start = new Date(journey.startDate);
    const end = new Date(journey.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const nights = getNightsCount();

  const getTransitHint = (fromCity: string, toCity: string) => {
    if (
      (fromCity === 'Goa' && toCity === 'Mumbai') ||
      (fromCity === 'Mumbai' && toCity === 'Goa')
    ) {
      return 'Scenic coastal rail connecting Vande Bharat (~8h) or Flight (1.2h)';
    }
    if (
      (fromCity === 'Delhi' && toCity === 'Jaipur') ||
      (fromCity === 'Jaipur' && toCity === 'Delhi')
    ) {
      return 'Express Highway drive (~5h) or Double Decker train (4.5h)';
    }
    return 'Regional connection · Recommended Flight (~2h)';
  };

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (!journey.itinerary) return;
    const newItinerary = [...journey.itinerary];
    const newDay = { ...newItinerary[dayIndex] };
    newDay.activities = newDay.activities.filter((_, idx) => idx !== activityIndex);
    newItinerary[dayIndex] = newDay;

    const updatedJourney = {
      ...journey,
      itinerary: newItinerary,
    };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);
  };

  const handleAddActivity = (dayIndex: number) => {
    const text = newActivityTexts[dayIndex]?.trim();
    if (!text || !journey.itinerary) return;

    const newActivity = {
      id: `act-${Date.now()}`,
      name: text,
      startTime: '14:00',
      endTime: '15:30',
      location: journey.itinerary[dayIndex]?.city || journey.destination,
      description: 'Curated custom stop',
    };

    const newItinerary = [...journey.itinerary];
    const newDay = { ...newItinerary[dayIndex] };
    newDay.activities = [...(newDay.activities || []), newActivity];
    newItinerary[dayIndex] = newDay;

    const updatedJourney = {
      ...journey,
      itinerary: newItinerary,
    };
    setJourney(updatedJourney);
    travelStorage.saveJourney(updatedJourney);

    setNewActivityTexts({
      ...newActivityTexts,
      [dayIndex]: '',
    });
  };

  const handleAddCityToEditList = (dest: DestinationInfo) => {
    if (editCities.some((d) => d.city.toLowerCase() === dest.city.toLowerCase())) {
      setSearchQuery('');
      return;
    }
    setEditCities([...editCities, dest]);
    setSearchQuery('');
  };

  const handleRemoveCityFromEditList = (index: number) => {
    setEditCities(editCities.filter((_, i) => i !== index));
  };

  const handleMoveCityInEditList = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editCities.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...editCities];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setEditCities(newList);
  };

  const toggleEditStyle = (st: string) => {
    if (editStyles.includes(st)) {
      setEditStyles(editStyles.filter((s) => s !== st));
    } else {
      setEditStyles([...editStyles, st]);
    }
  };

  const handleRegenerateJourney = () => {
    if (editCities.length === 0) return;
    setIsRegenerating(true);

    setTimeout(() => {
      const D = editDatesDecided
        ? editCities.length * 3
        : (() => {
            if (!editStartDate || !editEndDate) return editCities.length * 3;
            const start = new Date(editStartDate);
            const end = new Date(editEndDate);
            return Math.max(
              1,
              Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            );
          })();

      const N = editCities.length;
      const dayAllocation: number[] = [];
      let allocatedSum = 0;

      editCities.forEach(() => {
        dayAllocation.push(1);
        allocatedSum += 1;
      });

      if (D > N) {
        const remainingDays = D - N;
        const totalRecommended = editCities.reduce(
          (sum, d) => sum + d.recommendedDuration,
          0
        );

        let distributedCount = 0;
        editCities.forEach((dest, i) => {
          if (i === N - 1) {
            dayAllocation[i] += remainingDays - distributedCount;
          } else {
            const weight = dest.recommendedDuration / (totalRecommended || 1);
            const extra = Math.round(remainingDays * weight);
            dayAllocation[i] += extra;
            distributedCount += extra;
          }
        });
      }

      const itinerary: ItineraryDay[] = [];
      let dayCounter = 1;
      const startBaseDate = editStartDate ? new Date(editStartDate) : new Date();

      editCities.forEach((dest, cityIdx) => {
        const cityDays = dayAllocation[cityIdx];
        const matched = dest.activities.filter((act) =>
          act.styles.some((style) => editStyles.includes(style))
        );
        const activeActivitiesList = matched.length > 0 ? matched : dest.activities;

        for (let d = 0; d < cityDays; d++) {
          let dateStr = `Day ${dayCounter}`;
          if (!editDatesDecided && editStartDate) {
            const curDate = new Date(startBaseDate);
            curDate.setDate(startBaseDate.getDate() + dayCounter - 1);
            dateStr = curDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }

          const dayActivities: any[] = [];

          if (d === 0) {
            dayActivities.push({
              id: `act-${dayCounter}-1`,
              name: `Arrival in ${dest.city} · Private airport transfer & boutique check-in`,
              startTime: '10:00',
              endTime: '12:00',
              location: dest.city,
            });
            const firstAct =
              activeActivitiesList.find(
                (a) => a.styles.includes('relaxed') || a.styles.includes('photography')
              ) || activeActivitiesList[0];
            if (firstAct) {
              dayActivities.push({
                id: `act-${dayCounter}-2`,
                name: firstAct.name,
                startTime: '16:00',
                endTime: '18:30',
                location: dest.city,
              });
            }
          } else {
            const att = dest.attractions[(d - 1) % dest.attractions.length];
            dayActivities.push({
              id: `act-${dayCounter}-1`,
              name: `Explore ${att} and cultural surroundings`,
              startTime: '09:30',
              endTime: '13:00',
              location: dest.city,
            });
            const act = activeActivitiesList[d % activeActivitiesList.length];
            if (act) {
              dayActivities.push({
                id: `act-${dayCounter}-2`,
                name: act.name,
                startTime: '15:30',
                endTime: '18:00',
                location: dest.city,
              });
            }
          }

          if (d === cityDays - 1 && cityIdx < N - 1) {
            const nextCity = editCities[cityIdx + 1].city;
            dayActivities.push({
              id: `act-${dayCounter}-3`,
              name: `Evening scenic transfer to ${nextCity} · Leisurely arrival check-in`,
              startTime: '19:00',
              endTime: '21:30',
              location: nextCity,
            });
          }

          itinerary.push({
            dayNumber: dayCounter,
            date: dateStr,
            city: dest.city,
            activities: dayActivities,
          });

          dayCounter += 1;
        }
      });

      let finalBudgetText = editBudgetLabel;
      if (editBudgetLabel === 'custom') {
        finalBudgetText = `₹${Number(editCustomBudget).toLocaleString()}`;
      }

      const updatedJourney: StoredJourney = {
        ...journey,
        destination: editCities.map((c) => c.city).join(' · ').toUpperCase(),
        budget:
          editBudgetLabel === "I'll decide later"
            ? 0
            : editBudgetLabel === 'custom'
            ? Number(editCustomBudget)
            : Number(editBudgetLabel.replace(/[^0-9]/g, '')),
        travelers: editAdults + editChildren,
        style: editStyles.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' · '),
        destinations: editCities,
        startDate: editDatesDecided ? undefined : editStartDate,
        endDate: editDatesDecided ? undefined : editEndDate,
        datesDecided: editDatesDecided,
        travellersBreakdown: { adults: editAdults, children: editChildren },
        budgetValue: {
          amount:
            editBudgetLabel === "I'll decide later"
              ? null
              : editBudgetLabel === 'custom'
              ? Number(editCustomBudget)
              : Number(editBudgetLabel.replace(/[^0-9]/g, '')),
          label: finalBudgetText,
        },
        interests: editStyles,
        pace: editPace,
        itinerary,
        coverImage: editCities[0]?.image || journey.coverImage,
      };

      setJourney(updatedJourney);
      travelStorage.saveJourney(updatedJourney);
      setIsRegenerating(false);
      setIsEditingParams(false);
    }, 1000);
  };

  const handleDuplicate = () => {
    const dup = travelStorage.duplicateJourney(journey.id);
    if (dup) {
      alert('Journey duplicated successfully!');
      onNavigate(`/journey/${dup.id}`);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${journey.destination}"?`)) {
      travelStorage.deleteJourney(journey.id);
      onNavigate('/');
    }
  };

  const travelStylesList = [
    { value: 'relaxed', label: 'Relaxed' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'culture', label: 'Culture' },
    { value: 'food', label: 'Food' },
    { value: 'nature', label: 'Nature' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'budget', label: 'Budget' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'nightlife', label: 'Nightlife' },
    { value: 'photography', label: 'Photography' },
    { value: 'heritage', label: 'Heritage' },
  ];

  const TABS: Array<{ id: JourneyTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'discover', label: 'Discover Places', icon: Compass },
    { id: 'budget', label: 'Budget Planner', icon: DollarSign },
    { id: 'bookings', label: 'Bookings & Transit', icon: Plane },
    { id: 'collaborators', label: 'Collaborators', icon: Users },
    { id: 'notifications', label: 'Dispatches & Alerts', icon: Bell },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E7E5E2]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO DASHBOARD</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hospitals Near Me Live Map Button */}
            <button
              type="button"
              onClick={() => setIsHospitalsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 text-red-800 hover:bg-red-100 text-xs font-mono border border-red-200 transition-all cursor-pointer shadow-xs"
            >
              <Hospital className="w-3.5 h-3.5 text-red-600" />
              <span>Hospitals Near Me</span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E7E5E2] hover:border-black text-xs font-mono transition-all cursor-pointer bg-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Edit Parameters Button */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E7E5E2] hover:border-black text-xs font-mono transition-all cursor-pointer bg-white"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#E7E5E2] hover:border-black text-xs font-mono transition-all cursor-pointer bg-white"
              title="Duplicate journey"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-mono transition-all cursor-pointer bg-white"
              title="Delete journey"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                travelStorage.saveJourney(journey);
                alert('Journey saved to your private sanctuary.');
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-mono shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center gap-1 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-[#E7E5E2]/50 text-xs font-mono">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer font-medium ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-[#6F6F6F] hover:text-black hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-rise">
            {/* Hero Card */}
            <section className="relative border border-[#E7E5E2] rounded-[32px] overflow-hidden bg-white p-8 sm:p-12 md:p-14 flex flex-col justify-between shadow-sm min-h-[340px]">
              {journey.coverImage && (
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
                  <img
                    src={journey.coverImage}
                    alt=""
                    className="w-full h-full object-cover filter grayscale blur-xs"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest bg-[#FAF8F5] border border-[#E7E5E2] px-3 py-1 rounded-full text-black font-semibold">
                    {journey.status}
                  </span>
                  <span className="text-xs font-mono text-[#6F6F6F]">
                    {journey.travelType?.toUpperCase() || 'BESPOKE'} JOURNEY
                  </span>
                </div>

                <h1 className="font-instrument text-5xl sm:text-7xl text-black tracking-tight leading-none max-w-5xl">
                  {journey.destinations?.map((d) => d.city).join(' · ') || journey.destination}
                </h1>
                {journey.notes && (
                  <p className="text-sm font-inter text-[#6F6F6F] max-w-2xl italic">
                    "{journey.notes}"
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-[#E7E5E2] font-inter text-xs text-[#6F6F6F]">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    DATE RANGE
                  </span>
                  <span className="text-black font-semibold text-sm">
                    {journey.datesDecided
                      ? 'Dates to be Decided'
                      : journey.startDate && journey.endDate
                      ? `${new Date(journey.startDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })} — ${new Date(journey.endDate).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}`
                      : 'Flexible Schedule'}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    DURATION
                  </span>
                  <span className="text-black font-semibold text-sm">
                    {nights} Nights · {nights + 1} Days
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    TRAVELLERS
                  </span>
                  <span className="text-black font-semibold text-sm">
                    {journey.travellersBreakdown
                      ? `${journey.travellersBreakdown.adults} Adults ${
                          journey.travellersBreakdown.children
                            ? `, ${journey.travellersBreakdown.children} Child`
                            : ''
                        }`
                      : `${journey.travelers} Travellers (${journey.travelType || 'group'})`}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    BUDGET TARGET
                  </span>
                  <span className="text-black font-semibold text-sm">
                    {journey.budgetValue?.label || `₹${journey.budget?.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </section>

            {/* Spatial Trajectory Route Visualization */}
            <section className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                    GEOGRAPHIC TRAJECTORY
                  </span>
                  <h3 className="font-instrument text-3xl text-black">
                    Spatial Route & Multi-City Stops
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHospitalsModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-red-50 text-red-800 hover:bg-red-100 text-xs font-mono flex items-center gap-1.5 border border-red-200 cursor-pointer"
                >
                  <Hospital className="w-3.5 h-3.5 text-red-600" />
                  <span>Nearby Medical Hubs</span>
                </button>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:justify-around gap-8 relative overflow-hidden">
                {journey.destinations?.map((dest, i) => {
                  const isLast = i === (journey.destinations?.length || 0) - 1;
                  return (
                    <React.Fragment key={dest.city + i}>
                      <div className="flex items-center gap-4 shrink-0 text-center md:text-left md:flex-col md:gap-3">
                        <div className="w-12 h-12 rounded-full bg-white border-2 border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-xs shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h4 className="font-instrument text-2xl text-black leading-none">
                            {dest.city}
                          </h4>
                          <span className="text-[10px] text-[#6F6F6F] font-mono block mt-0.5">
                            {dest.region}, {dest.country}
                          </span>
                        </div>
                      </div>

                      {!isLast && journey.destinations && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center w-full md:w-auto relative py-2 md:py-0">
                          <div className="hidden md:block w-full h-[1px] bg-dashed bg-neutral-300 absolute top-6 left-1/2 right-1/2 -z-10" />
                          <div className="md:hidden w-[1px] h-10 bg-dashed bg-neutral-300 -z-10 my-1" />
                          <span className="bg-white px-3 py-1 border border-[#E7E5E2] rounded-full text-[9px] font-mono text-[#6F6F6F] z-10">
                            {getTransitHint(dest.city, journey.destinations[i + 1].city)}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>

            {/* Quick Access Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                onClick={() => setActiveTab('discover')}
                className="bg-white border border-[#E7E5E2] hover:border-black rounded-3xl p-6 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <h4 className="font-instrument text-2xl text-black">Discover Stays & Dining</h4>
                <p className="text-xs font-inter text-[#6F6F6F]">
                  Curate hotels, resorts, nightlife spots, and cultural dining across your journey destinations.
                </p>
                <span className="text-xs font-mono text-black font-semibold block pt-2">
                  Explore Places →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('budget')}
                className="bg-white border border-[#E7E5E2] hover:border-black rounded-3xl p-6 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-instrument text-2xl text-black">Budget & Cost Splits</h4>
                <p className="text-xs font-inter text-[#6F6F6F]">
                  Track expenses across 8 categories, calculate daily burn rates, and simplify group settlements.
                </p>
                <span className="text-xs font-mono text-black font-semibold block pt-2">
                  Open Budget Planner →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('bookings')}
                className="bg-white border border-[#E7E5E2] hover:border-black rounded-3xl p-6 transition-all cursor-pointer group space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
                  <Plane className="w-5 h-5" />
                </div>
                <h4 className="font-instrument text-2xl text-black">Transit & Bookings</h4>
                <p className="text-xs font-inter text-[#6F6F6F]">
                  Search live flights with SerpApi, launch IRCTC railway portals, and manage confirmation receipts.
                </p>
                <span className="text-xs font-mono text-black font-semibold block pt-2">
                  Manage Bookings →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ITINERARY */}
        {activeTab === 'itinerary' && (
          <div className="space-y-8 animate-fade-rise">
            <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                  DAY-BY-DAY CURATION
                </span>
                <h2 className="font-instrument text-3xl sm:text-4xl text-black">
                  Detailed Travel Schedule
                </h2>
                <p className="text-xs font-inter text-[#6F6F6F] mt-1">
                  Adjust activities, add spontaneous detours, or regenerate the entire route allocation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingParams(true)}
                className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black text-xs font-mono text-black flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate with AI</span>
              </button>
            </div>

            {/* Inline AI Parameter Editor */}
            {isEditingParams && (
              <div className="border border-[#E7E5E2] rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-start border-b border-[#E7E5E2] pb-4">
                  <div>
                    <h3 className="font-instrument text-3xl text-black">Refine Journey</h3>
                    <p className="text-xs text-[#6F6F6F] font-inter">
                      Adjust destinations, dates, travelers, budget or style
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditingParams(false)}
                    className="p-1.5 hover:bg-neutral-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="font-mono text-xs uppercase tracking-widest text-[#6F6F6F] block">
                      Edit Destinations
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add another city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none"
                      />
                      {searchQuery.trim() && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E7E5E2] rounded-xl shadow-lg z-50 divide-y divide-neutral-100 max-h-40 overflow-y-auto">
                          {searchResults.map((dest) => (
                            <button
                              key={dest.id || `${dest.city}-${dest.country}`}
                              onClick={() => handleAddCityToEditList(dest)}
                              className="w-full text-left px-4 py-2 hover:bg-[#FAF8F5] text-xs font-inter flex justify-between items-center"
                            >
                              <span>{dest.city}</span>
                              <span className="text-[9px] text-[#6F6F6F] bg-neutral-50 px-1.5 py-0.5 rounded">
                                {dest.region}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {editCities.map((c, idx) => (
                        <div
                          key={c.city + idx}
                          className="flex items-center justify-between bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl p-2 px-3 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-neutral-400">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <span className="font-medium text-black">{c.city}</span>
                            <span className="text-[10px] text-[#6F6F6F]">({c.region})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleMoveCityInEditList(idx, 'up')}
                              disabled={idx === 0}
                              className="p-0.5 hover:text-black disabled:opacity-30"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveCityInEditList(idx, 'down')}
                              disabled={idx === editCities.length - 1}
                              className="p-0.5 hover:text-black disabled:opacity-30"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveCityFromEditList(idx)}
                              className="p-0.5 text-[#6F6F6F] hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="font-mono text-xs uppercase tracking-widest text-[#6F6F6F] block">
                        Travel Style
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {travelStylesList.map((s) => {
                          const isSelected = editStyles.includes(s.value);
                          return (
                            <button
                              key={s.value}
                              onClick={() => toggleEditStyle(s.value)}
                              className={`px-3 py-1 rounded-full text-[10px] font-inter border transition-all ${
                                isSelected
                                  ? 'bg-black border-black text-white font-medium'
                                  : 'bg-white border-[#E7E5E2] hover:border-black text-black'
                              }`}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-mono text-xs uppercase tracking-widest text-[#6F6F6F] block">
                        Budget Target
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['₹25,000', '₹50,000', '₹1,00,000', 'custom'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setEditBudgetLabel(b)}
                            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-all ${
                              editBudgetLabel === b
                                ? 'bg-black border-black text-white font-medium'
                                : 'bg-white border-[#E7E5E2] text-black'
                            }`}
                          >
                            {b === 'custom' ? 'Custom' : b}
                          </button>
                        ))}
                      </div>
                      {editBudgetLabel === 'custom' && (
                        <input
                          type="number"
                          placeholder="Enter amount (₹)..."
                          value={editCustomBudget}
                          onChange={(e) => setEditCustomBudget(e.target.value)}
                          className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono mt-2 text-black"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {isRegenerating && (
                  <div className="p-3 bg-neutral-100 rounded-xl text-center text-xs font-mono text-black animate-pulse">
                    ✦ Calculating optimal route allocations and timings...
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E2]">
                  <button
                    onClick={() => setIsEditingParams(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-medium text-[#6F6F6F] hover:text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerateJourney}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-mono cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate Itinerary</span>
                  </button>
                </div>
              </div>
            )}

            {/* Days Timeline View */}
            <div className="space-y-6">
              {journey.itinerary?.map((day, dayIdx) => (
                <div
                  key={day.dayNumber}
                  className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-instrument text-lg font-bold">
                        {day.dayNumber}
                      </div>
                      <div>
                        <h4 className="font-instrument text-2xl text-black">
                          {day.date} — {day.city}
                        </h4>
                        <span className="text-[11px] font-mono text-[#6F6F6F]">
                          {day.activities?.length || 0} scheduled experiences
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="space-y-2.5">
                    {day.activities?.map((act, actIdx) => {
                      const name = typeof act === 'string' ? act : act.name;
                      const time = typeof act === 'object' && act.startTime ? act.startTime : null;

                      return (
                        <div
                          key={actIdx}
                          className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4 flex items-center justify-between gap-3 group hover:border-black transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-neutral-400 group-hover:bg-black transition-colors shrink-0" />
                            {time && (
                              <span className="text-xs font-mono font-semibold text-neutral-800 bg-white px-2 py-0.5 rounded border border-[#E7E5E2]">
                                {time}
                              </span>
                            )}
                            <span className="text-sm font-inter text-black">{name}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveActivity(dayIdx, actIdx)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                            title="Remove activity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Activity Input */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Add an activity to Day ${day.dayNumber}...`}
                      value={newActivityTexts[dayIdx] || ''}
                      onChange={(e) =>
                        setNewActivityTexts({
                          ...newActivityTexts,
                          [dayIdx]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddActivity(dayIdx);
                      }}
                      className="flex-1 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl px-4 py-2.5 text-xs font-inter text-black focus:outline-none focus:border-black"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddActivity(dayIdx)}
                      className="px-4 py-2.5 bg-black text-white text-xs font-mono rounded-2xl hover:bg-neutral-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISCOVER PLACES */}
        {activeTab === 'discover' && (
          <div className="animate-fade-rise">
            <DiscoverPlacesSection
              journey={journey}
              onUpdateJourney={(updated) => setJourney(updated)}
            />
          </div>
        )}

        {/* TAB 4: BUDGET PLANNER */}
        {activeTab === 'budget' && (
          <div className="animate-fade-rise">
            <JourneyBudgetPlanner
              journey={journey}
              onUpdateJourney={(updated) => setJourney(updated)}
            />
          </div>
        )}

        {/* TAB 5: BOOKINGS & TRANSIT */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-rise">
            <JourneyBookingsHub
              journey={journey}
              onUpdateJourney={(updated) => setJourney(updated)}
            />
          </div>
        )}

        {/* TAB 6: COLLABORATORS */}
        {activeTab === 'collaborators' && (
          <div className="animate-fade-rise">
            <CollaboratorsManager
              journey={journey}
              onUpdateJourney={(updated) => setJourney(updated)}
            />
          </div>
        )}

        {/* TAB 7: DISPATCHES & ALERTS */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-rise">
            <TripNotificationCenter
              journeyId={journey.id}
              onNavigate={(tab) => setActiveTab(tab as any)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {isHospitalsModalOpen && (
        <HospitalsNearMeModal
          isOpen={isHospitalsModalOpen}
          onClose={() => setIsHospitalsModalOpen(false)}
          defaultCity={journey.destinations?.[0]?.city || journey.city}
        />
      )}

      {isShareModalOpen && (
        <JourneyShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          journey={journey}
          onUpdateJourney={(updated) => setJourney(updated)}
        />
      )}

      {isEditModalOpen && (
        <EditJourneyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          journey={journey}
          onUpdateJourney={(updated) => setJourney(updated)}
        />
      )}
    </div>
  );
};
