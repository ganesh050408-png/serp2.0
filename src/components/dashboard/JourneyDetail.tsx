import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Trash2, 
  Plus, 
  X, 
  RotateCcw,
  Edit3,
  Save,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { travelStorage, StoredJourney, ItineraryDay } from '../../services/travelStorage';
import { DestinationInfo, getOrCreateDestination } from '../../services/destinations';
import { useDestinationSearch } from '../../hooks/useDestinationSearch';

interface JourneyDetailProps {
  journeyId: string;
  onNavigate: (path: string) => void;
}

export const JourneyDetail = ({ journeyId, onNavigate }: JourneyDetailProps) => {
  const [journey, setJourney] = useState<StoredJourney | null>(null);
  
  // Edit mode parameters state
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
  
  // Search destinations inside editor
  const [searchQuery, setSearchQuery] = useState('');
  const { results: searchResults, isLoading: isSearchLoading } = useDestinationSearch(searchQuery);
  
  // Inline activity addition input states
  const [newActivityTexts, setNewActivityTexts] = useState<Record<number, string>>({});

  // Loading state for regeneration
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load journey data
  useEffect(() => {
    const list = travelStorage.getJourneys();
    let found = list.find((j) => j.id === journeyId);

    // If journey isn't found in storage, automatically synthesize it from the destination or haven directory
    if (!found && journeyId) {
      const cityName = decodeURIComponent(journeyId).replace(/[-_]/g, ' ');
      const dest = getOrCreateDestination(cityName);
      const fallbackJourney: StoredJourney = {
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
              `Arrival & check-in at ${dest.city} boutique haven`,
              `Evening stroll around ${dest.attractions[0] || 'heritage quarter'}`,
              `Welcome dinner featuring local ${dest.city} cuisine`,
            ],
          },
          {
            dayNumber: 2,
            date: 'Day 2',
            city: dest.city,
            activities: [
              `Morning guided visit to ${dest.attractions[1] || 'signature landmarks'}`,
              `Scenic cultural & artisan craft excursion`,
              `Sunset viewpoint & relaxation`,
            ],
          },
          {
            dayNumber: 3,
            date: 'Day 3',
            city: dest.city,
            activities: [
              `Exploration of ${dest.attractions[2] || 'surrounding natural reserves'}`,
              `Farewell banquet & travel journal reflection`,
            ],
          },
        ],
      };

      travelStorage.saveJourney(fallbackJourney);
      found = fallbackJourney;
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
            AETHERA GLOBAL ARCHIVE
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = getNightsCount();

  // Transit mode selector helper
  const getTransitHint = (fromCity: string, toCity: string) => {
    // Return typical transit methods for Indian cities

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

  // Add / remove / reorder activities in itinerary state directly
  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    if (!journey.itinerary) return;
    const newItinerary = [...journey.itinerary];
    const newDay = { ...newItinerary[dayIndex] };
    newDay.activities = newDay.activities.filter((_, idx) => idx !== activityIndex);
    newItinerary[dayIndex] = newDay;
    
    setJourney({
      ...journey,
      itinerary: newItinerary
    });
  };

  const handleAddActivity = (dayIndex: number) => {
    const text = newActivityTexts[dayIndex]?.trim();
    if (!text || !journey.itinerary) return;

    const newItinerary = [...journey.itinerary];
    const newDay = { ...newItinerary[dayIndex] };
    newDay.activities = [...newDay.activities, text];
    newItinerary[dayIndex] = newDay;

    setJourney({
      ...journey,
      itinerary: newItinerary
    });

    // Clear input
    setNewActivityTexts({
      ...newActivityTexts,
      [dayIndex]: ''
    });
  };

  const handleMoveActivity = (dayIndex: number, activityIndex: number, targetDayNumber: number) => {
    if (!journey.itinerary) return;
    const targetIdx = journey.itinerary.findIndex(d => d.dayNumber === targetDayNumber);
    if (targetIdx === -1 || targetIdx === dayIndex) return;

    const newItinerary = [...journey.itinerary];
    
    // Remove from source day
    const sourceDay = { ...newItinerary[dayIndex] };
    const activityToMove = sourceDay.activities[activityIndex];
    sourceDay.activities = sourceDay.activities.filter((_, idx) => idx !== activityIndex);
    newItinerary[dayIndex] = sourceDay;

    // Append to target day
    const destDay = { ...newItinerary[targetIdx] };
    destDay.activities = [...destDay.activities, activityToMove];
    newItinerary[targetIdx] = destDay;

    setJourney({
      ...journey,
      itinerary: newItinerary
    });
  };

  // Handle updates to parameters in the inline editor
  const handleAddCityToEditList = (dest: DestinationInfo) => {
    if (editCities.some(d => d.city.toLowerCase() === dest.city.toLowerCase())) {
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

  const handleSearchEditCities = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleEditStyle = (st: string) => {
    if (editStyles.includes(st)) {
      setEditStyles(editStyles.filter(s => s !== st));
    } else {
      setEditStyles([...editStyles, st]);
    }
  };

  // REGENERATE JOURNEY
  const handleRegenerateJourney = () => {
    if (editCities.length === 0) return;
    setIsRegenerating(true);
    
    setTimeout(() => {
      // Itinerary generation math
      const D = editDatesDecided ? editCities.length * 3 : (() => {
        if (!editStartDate || !editEndDate) return editCities.length * 3;
        const start = new Date(editStartDate);
        const end = new Date(editEndDate);
        return Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
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
        const totalRecommended = editCities.reduce((sum, d) => sum + d.recommendedDuration, 0);
        
        let distributedCount = 0;
        editCities.forEach((dest, i) => {
          if (i === N - 1) {
            dayAllocation[i] += remainingDays - distributedCount;
          } else {
            const weight = dest.recommendedDuration / totalRecommended;
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
        const matched = dest.activities.filter(act => 
          act.styles.some(style => editStyles.includes(style))
        );
        const activeActivitiesList = matched.length > 0 ? matched : dest.activities;

        for (let d = 0; d < cityDays; d++) {
          let dateStr = `Day ${dayCounter}`;
          if (!editDatesDecided && editStartDate) {
            const curDate = new Date(startBaseDate);
            curDate.setDate(startBaseDate.getDate() + dayCounter - 1);
            dateStr = curDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }

          const dayActivities: string[] = [];
          
          if (d === 0) {
            dayActivities.push(`Arrival in ${dest.city} · Private airport transfer & boutique check-in`);
            const firstAct = activeActivitiesList.find(a => a.styles.includes('relaxed') || a.styles.includes('photography')) 
              || activeActivitiesList[0];
            dayActivities.push(firstAct.name);
          } else {
            const att = dest.attractions[(d - 1) % dest.attractions.length];
            dayActivities.push(`Explore ${att} and cultural surroundings`);
            const act = activeActivitiesList[(d) % activeActivitiesList.length];
            dayActivities.push(act.name);
          }

          if (d === cityDays - 1 && cityIdx < N - 1) {
            const nextCity = editCities[cityIdx + 1].city;
            dayActivities.push(`Evening scenic transfer to ${nextCity} · Leisurely arrival check-in`);
          } else if (d === cityDays - 1 && cityIdx === N - 1) {
            dayActivities.push(`Leisurely departure prep · Souvenir collection & airport departure transfer`);
          }

          itinerary.push({
            dayNumber: dayCounter,
            date: dateStr,
            city: dest.city,
            activities: dayActivities
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
        destination: editCities.map(c => c.city).join(' · ').toUpperCase(),
        budget: editBudgetLabel === 'I\'ll decide later' ? 0 : (editBudgetLabel === 'custom' ? Number(editCustomBudget) : Number(editBudgetLabel.replace(/[^0-9]/g, ''))),
        travelers: editAdults + editChildren,
        style: editStyles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · '),
        destinations: editCities,
        startDate: editDatesDecided ? undefined : editStartDate,
        endDate: editDatesDecided ? undefined : editEndDate,
        datesDecided: editDatesDecided,
        travellersBreakdown: { adults: editAdults, children: editChildren },
        budgetValue: {
          amount: editBudgetLabel === 'I\'ll decide later' ? null : (editBudgetLabel === 'custom' ? Number(editCustomBudget) : Number(editBudgetLabel.replace(/[^0-9]/g, ''))),
          label: finalBudgetText
        },
        interests: editStyles,
        pace: editPace,
        itinerary: itinerary,
        coverImage: editCities[0]?.image || journey.coverImage
      };

      setJourney(updatedJourney);
      setIsRegenerating(false);
      setIsEditingParams(false);
    }, 1000);
  };

  // SAVE TO LOCAL STORAGE
  const handleSaveJourney = () => {
    travelStorage.saveJourney(journey);
    onNavigate('/');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Journey link copied to clipboard!');
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
    { value: 'heritage', label: 'Heritage' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-5 flex flex-wrap items-center justify-between gap-4 border-b border-subtleBorder">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-mutedGray hover:text-black transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>DASHBOARD</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-subtleBorder hover:border-black text-xs font-mono transition-all cursor-pointer"
          >
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-subtleBorder hover:border-black text-xs font-mono transition-all cursor-pointer"
          >
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-mono transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>

          <button
            onClick={() => setIsEditingParams(!isEditingParams)}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full border border-subtleBorder hover:border-black text-xs font-mono transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingParams ? 'Close Editor' : 'Edit'}</span>
          </button>
          
          <button
            onClick={handleSaveJourney}
            className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-black text-white hover:opacity-90 text-xs font-medium shadow-md shadow-black/5 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* PARAMETERS EDIT DRAWER / PANEL */}
      {isEditingParams && (
        <div className="max-w-4xl mx-auto mt-6 mx-6 border border-subtleBorder rounded-3xl bg-warmBg p-6 sm:p-8 space-y-8 animate-fade-rise z-30 relative">
          <div className="flex justify-between items-start border-b border-subtleBorder pb-4">
            <div>
              <h3 className="font-instrument text-3xl text-black">Refine Journey</h3>
              <p className="text-xs text-mutedGray font-inter">Adjust destinations, dates, travelers, budget or style</p>
            </div>
            <button onClick={() => setIsEditingParams(false)} className="p-1 hover:bg-neutral-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col: Cities List & Add */}
            <div className="space-y-4">
              <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                Edit Destinations
              </label>

              {/* Autocomplete selector */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Add another city..."
                  value={searchQuery}
                  onChange={handleSearchEditCities}
                  className="w-full bg-white border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-4 py-2.5 text-xs font-inter"
                />
                {searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-subtleBorder rounded-xl shadow-lg z-50 divide-y divide-neutral-100 max-h-40 overflow-y-auto">
                     {searchResults.map((dest) => (
                       <button
                         key={dest.id || `${dest.city}-${dest.country}`}
                        onClick={() => handleAddCityToEditList(dest)}
                        className="w-full text-left px-4 py-2 hover:bg-warmBg text-xs font-inter flex justify-between items-center"
                      >
                        <span>{dest.city}</span>
                        <span className="text-[9px] text-mutedGray bg-neutral-50 px-1.5 py-0.5 rounded">{dest.region}</span>
                      </button>
                    ))}
                     {isSearchLoading && searchResults.length === 0 && (
                       <div className="w-full text-left px-4 py-2 text-xs text-mutedGray font-inter">
                         Searching destinations...
                       </div>
                     )}
                     {!isSearchLoading && searchResults.length === 0 && (
                      <button
                        onClick={() => handleAddCityToEditList(getOrCreateDestination(searchQuery))}
                        className="w-full text-left px-4 py-2 hover:bg-warmBg text-xs font-medium text-black flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add "{searchQuery}"</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Current Cities in edit list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {editCities.map((c, idx) => (
                  <div key={c.city + idx} className="flex items-center justify-between bg-white border border-subtleBorder rounded-xl p-2 px-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-400">{(idx+1).toString().padStart(2, '0')}</span>
                      <span className="font-medium text-black">{c.city}</span>
                      <span className="text-[10px] text-mutedGray">({c.region})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleMoveCityInEditList(idx, 'up')} disabled={idx === 0} className="p-0.5 hover:text-black disabled:opacity-30">
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleMoveCityInEditList(idx, 'down')} disabled={idx === editCities.length - 1} className="p-0.5 hover:text-black disabled:opacity-30">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleRemoveCityFromEditList(idx)} className="p-0.5 text-mutedGray hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Details */}
            <div className="space-y-6">
              {/* Dates */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">Dates</label>
                  <label className="flex items-center gap-1.5 text-xs text-mutedGray cursor-pointer">
                    <input type="checkbox" checked={editDatesDecided} onChange={(e) => setEditDatesDecided(e.target.checked)} className="w-3.5 h-3.5 rounded border-subtleBorder text-black focus:ring-black" />
                    <span>To be decided</span>
                  </label>
                </div>
                {!editDatesDecided ? (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="w-full bg-white border border-subtleBorder rounded-xl px-3 py-2 text-xs font-inter" />
                    <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="w-full bg-white border border-subtleBorder rounded-xl px-3 py-2 text-xs font-inter" />
                  </div>
                ) : (
                  <div className="bg-white/50 border border-subtleBorder p-2.5 text-xs text-mutedGray rounded-xl font-inter">No fixed dates set</div>
                )}
              </div>

              {/* Travelers */}
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">Travelers</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center justify-between border border-subtleBorder bg-white rounded-xl p-2 px-3">
                    <span>Adults</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditAdults(Math.max(1, editAdults - 1))} className="px-1.5 py-0.5 border rounded">-</button>
                      <span className="font-mono font-bold w-3 text-center">{editAdults}</span>
                      <button onClick={() => setEditAdults(editAdults + 1)} className="px-1.5 py-0.5 border rounded">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border border-subtleBorder bg-white rounded-xl p-2 px-3">
                    <span>Children</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditChildren(Math.max(0, editChildren - 1))} className="px-1.5 py-0.5 border rounded">-</button>
                      <span className="font-mono font-bold w-3 text-center">{editChildren}</span>
                      <button onClick={() => setEditChildren(editChildren + 1)} className="px-1.5 py-0.5 border rounded">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">Budget</label>
                <div className="flex flex-wrap gap-1.5">
                  {['₹25,000', '₹50,000', '₹1,00,000', '₹2,00,000+', 'custom'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setEditBudgetLabel(b)}
                      className={`px-3 py-1.5 border rounded-lg text-[10px] font-mono capitalize transition-all ${
                        editBudgetLabel === b
                          ? 'bg-black border-black text-white'
                          : 'bg-white border-subtleBorder hover:border-black text-black'
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
                    className="w-full bg-white border border-subtleBorder rounded-xl px-3 py-2 text-xs font-mono mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Style pills */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">Travel Style</label>
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
                        : 'bg-white border-subtleBorder hover:border-black text-black'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex justify-end gap-3 pt-4 border-t border-subtleBorder">
            <button
              onClick={() => setIsEditingParams(false)}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-mutedGray hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerateJourney}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-black text-white hover:opacity-95 text-xs font-medium shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate journey</span>
            </button>
          </div>
        </div>
      )}

      {/* LOADING REGENERATION overlay */}
      {isRegenerating && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="text-center space-y-4 max-w-sm px-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-black mx-auto animate-spin" style={{ animationDuration: '3s' }} />
            <h3 className="font-instrument text-3xl text-black">Regenerating Itinerary...</h3>
            <p className="text-xs text-mutedGray font-mono uppercase tracking-wider">Recalculating routing and allocations</p>
          </div>
        </div>
      )}

      {/* 5. HERO PANEL SECTION */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 pt-10 sm:pt-14 animate-fade-rise">
        
        {/* Soft background grid cards */}
        <div className="relative border border-subtleBorder rounded-[32px] overflow-hidden bg-warmBg p-8 sm:p-12 md:p-16 flex flex-col justify-between shadow-sm min-h-[360px]">
          {/* Subtle cover image overlay under card */}
          {journey.coverImage && (
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
              <img src={journey.coverImage} alt="" className="w-full h-full object-cover filter grayscale blur-sm" />
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono uppercase tracking-widest bg-white border border-subtleBorder px-3 py-1 rounded-full text-black font-semibold">
                {journey.status}
              </span>
              <span className="text-xs font-mono text-mutedGray">
                SAVED PLAN
              </span>
            </div>

            <h1 className="font-instrument text-5xl sm:text-7xl md:text-8xl text-black tracking-tight leading-none max-w-5xl">
              {journey.destinations?.map(d => d.city).join(' · ') || journey.destination}
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-subtleBorder/70 font-inter text-xs text-mutedGray">
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">DATE RANGE</span>
              <span className="text-black font-semibold text-sm">
                {journey.datesDecided 
                  ? 'Dates to be Decided'
                  : `${new Date(journey.startDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} — ${new Date(journey.endDate || '').toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`
                }
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">DURATION</span>
              <span className="text-black font-semibold text-sm">{nights} Nights · {nights + 1} Days</span>
            </div>

            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">TRAVELLERS</span>
              <span className="text-black font-semibold text-sm">
                {journey.travellersBreakdown
                  ? `${journey.travellersBreakdown.adults} Adults ${journey.travellersBreakdown.children ? `, ${journey.travellersBreakdown.children} Child` : ''}`
                  : `${journey.travelers} Travellers`
                }
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">BUDGET TARGET</span>
              <span className="text-black font-semibold text-sm">{journey.budgetValue?.label || `₹${journey.budget.toLocaleString()}`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* VISUAL ROUTE TIMELINE */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 animate-fade-rise">
        <span className="font-mono text-xs uppercase tracking-widest text-mutedGray block mb-8 text-center sm:text-left">
          SPATIAL TIMELINE ROUTE
        </span>
        
        {/* Connection visualization map */}
        <div className="bg-[#FAF8F5]/50 border border-subtleBorder rounded-[24px] p-6 sm:p-10 flex flex-col md:flex-row items-center md:justify-around gap-8 relative overflow-hidden">
          {journey.destinations?.map((dest, i) => {
            const isLast = i === (journey.destinations?.length || 0) - 1;
            return (
              <React.Fragment key={dest.city + i}>
                {/* City node */}
                <div className="flex items-center gap-4 shrink-0 text-center md:text-left md:flex-col md:gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-black flex items-center justify-center text-xs font-mono font-bold text-black shadow-xs shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="font-instrument text-2xl text-black leading-none">{dest.city}</h4>
                    <span className="text-[10px] text-mutedGray font-mono block mt-0.5">{dest.region}, {dest.country}</span>
                  </div>
                </div>

                {/* Transit line connecting nodes */}
                {!isLast && journey.destinations && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center w-full md:w-auto relative py-2 md:py-0">
                    {/* Horizontal Line on Desktop */}
                    <div className="hidden md:block w-full h-[1px] bg-dashed bg-neutral-300 absolute top-6 left-1/2 right-1/2 -z-10" />
                    {/* Vertical Line on Mobile */}
                    <div className="md:hidden w-[1px] h-10 bg-dashed bg-neutral-300 -z-10 my-1" />
                    
                    <span className="bg-[#FAF8F5]/80 backdrop-blur-xs px-3 py-1 border border-subtleBorder rounded-full text-[9px] font-mono text-mutedGray z-10">
                      {getTransitHint(dest.city, journey.destinations[i + 1].city)}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* TRANSPORTATION & MOBILITY PASSES */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-8 animate-fade-rise">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-mutedGray">
            TRANSPORTATION & TRANSIT PASSES
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs font-mono text-black hover:underline cursor-pointer"
          >
            + Book Bike / Flight →
          </button>
        </div>

        {journey.transportation && journey.transportation.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journey.transportation.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-subtleBorder hover:border-black rounded-2xl p-6 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {item.type === 'bike' ? '🏍️' : '✈️'}
                    </span>
                    <div>
                      <h4 className="font-instrument text-2xl text-black leading-none">
                        {item.title}
                      </h4>
                      <span className="text-xs text-mutedGray font-mono">{item.subtitle}</span>
                    </div>
                  </div>
                  <span className="font-instrument text-2xl text-black">{item.cost}</span>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs font-mono space-y-1 text-neutral-700 mb-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">ROUTE:</span>
                    <span className="font-semibold">{item.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">DATES:</span>
                    <span>{item.dates}</span>
                  </div>
                </div>

                <p className="text-[11px] text-mutedGray font-inter">{item.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-subtleBorder rounded-2xl p-8 text-center bg-warmBg/40">
            <p className="text-sm font-inter text-mutedGray mb-3">
              No flights or bike rentals booked for this journey yet.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <span>Explore Transportation Options</span>
            </button>
          </div>
        )}
      </section>

      {/* DAY-BY-DAY ITINERARY SECTIONS */}
      <section className="relative z-10 w-full max-w-3xl mx-auto px-6 sm:px-8 py-10 animate-fade-rise">
        <span className="font-mono text-xs uppercase tracking-widest text-mutedGray block mb-10">
          DAY-BY-DAY JOURNAL
        </span>

        <div className="space-y-16">
          {journey.destinations?.map((dest, cityIdx) => {
            const daysInThisCity = journey.itinerary?.filter(d => d.city === dest.city) || [];
            if (daysInThisCity.length === 0) return null;

            return (
              <div key={dest.city + cityIdx} className="space-y-8">
                
                {/* Destination Banner Header */}
                <div className="border-b border-subtleBorder pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-mutedGray">
                      STOP № {String(cityIdx + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-instrument text-4xl sm:text-5xl text-black leading-none">
                      {dest.city}
                    </h2>
                    <p className="text-xs text-mutedGray font-inter">
                      {dest.region}, {dest.country} · Suggested duration: {dest.recommendedDuration} Days
                    </p>
                  </div>

                  <span className="text-xs font-mono text-mutedGray shrink-0">
                    {daysInThisCity[0]?.date} — {daysInThisCity[daysInThisCity.length - 1]?.date}
                  </span>
                </div>

                {/* Days Loop */}
                <div className="space-y-8 pl-0 sm:pl-4">
                  {daysInThisCity.map((day) => {
                    const dayGlobalIndex = journey.itinerary?.findIndex(d => d.dayNumber === day.dayNumber) ?? 0;
                    
                    return (
                      <div key={day.dayNumber} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start relative border-l border-neutral-100 pl-6 pb-6">
                        {/* Dot indicator on vertical line */}
                        <div className="absolute left-0 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-black border-2 border-white" />

                        {/* Left column: Date/Day labels */}
                        <div className="md:col-span-3">
                          <span className="font-mono text-xs font-bold text-black block">Day {day.dayNumber}</span>
                          <span className="text-[11px] text-mutedGray font-mono uppercase tracking-wider block mt-0.5">{day.date}</span>
                        </div>

                        {/* Right column: Activities */}
                        <div className="md:col-span-9 space-y-4">
                          <div className="space-y-3">
                            {day.activities.map((act, actIdx) => (
                              <div
                                key={actIdx}
                                className="group flex items-start justify-between bg-warmBg/50 hover:bg-warmBg rounded-xl p-3 border border-subtleBorder text-xs text-black leading-relaxed transition-all"
                              >
                                <span className="pr-4">{typeof act === 'string' ? act : (act.name || act.id)}</span>

                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 shrink-0 transition-opacity">
                                  {/* Shift Days Dropdown */}
                                  {journey.itinerary && journey.itinerary.length > 1 && (
                                    <select
                                      title="Move to another day"
                                      onChange={(e) => {
                                        const targetNum = Number(e.target.value);
                                        if (targetNum) handleMoveActivity(dayGlobalIndex, actIdx, targetNum);
                                      }}
                                      value=""
                                      className="bg-white border border-subtleBorder text-[10px] py-0.5 px-1 rounded hover:border-black cursor-pointer font-mono"
                                    >
                                      <option value="" disabled>Move...</option>
                                      {journey.itinerary.map(d => (
                                        <option key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber}</option>
                                      ))}
                                    </select>
                                  )}

                                  {/* Delete Activity */}
                                  <button
                                    onClick={() => handleRemoveActivity(dayGlobalIndex, actIdx)}
                                    className="text-mutedGray hover:text-red-500 transition-colors"
                                    title="Delete activity"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add Inline Custom Activity */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add activity to this day..."
                              value={newActivityTexts[dayGlobalIndex] || ''}
                              onChange={(e) => setNewActivityTexts({
                                ...newActivityTexts,
                                [dayGlobalIndex]: e.target.value
                              })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddActivity(dayGlobalIndex);
                              }}
                              className="w-full bg-white border border-subtleBorder focus:border-black focus:outline-hidden rounded-lg px-3 py-1.5 text-xs font-inter"
                            />
                            <button
                              onClick={() => handleAddActivity(dayGlobalIndex)}
                              className="px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-medium shrink-0 cursor-pointer"
                            >
                              Add
                            </button>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
