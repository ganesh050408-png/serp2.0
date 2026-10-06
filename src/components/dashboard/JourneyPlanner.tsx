import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Sparkles, 
  Plus, 
  X, 
  ChevronUp, 
  ChevronDown, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertTriangle,
  Move
} from 'lucide-react';
import { travelStorage, StoredJourney, ItineraryDay } from '../../services/travelStorage';
import { 
  DestinationInfo, 
  searchCities, 
  getOrCreateDestination 
} from '../../services/destinations';

interface JourneyPlannerProps {
  onNavigate: (path: string) => void;
}

export const JourneyPlanner = ({ onNavigate }: JourneyPlannerProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // STEP 01 State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DestinationInfo[]>([]);
  const [selectedDestinations, setSelectedDestinations] = useState<DestinationInfo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // STEP 02 State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datesDecided, setDatesDecided] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetLabel, setBudgetLabel] = useState('₹50,000');
  const [customBudget, setCustomBudget] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['culture', 'food', 'relaxed']);
  const [pace, setPace] = useState<'slow' | 'balanced' | 'packed'>('balanced');
  
  // STEP 03 / Loading State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(0);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim()) {
      const results = searchCities(q);
      setSearchResults(results);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Add a destination
  const addDestination = (dest: DestinationInfo) => {
    if (selectedDestinations.some(d => d.city.toLowerCase() === dest.city.toLowerCase())) {
      // Avoid duplicate
      setSearchQuery('');
      setShowDropdown(false);
      return;
    }
    setSelectedDestinations([...selectedDestinations, dest]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Remove a destination
  const removeDestination = (index: number) => {
    setSelectedDestinations(selectedDestinations.filter((_, i) => i !== index));
  };

  // Reorder destinations (Up/Down)
  const moveDestination = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedDestinations.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...selectedDestinations];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setSelectedDestinations(newList);
  };

  // Native HTML5 Drag and Drop handlers
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newList = [...selectedDestinations];
      const draggedItemContent = newList[dragItem.current];
      newList.splice(dragItem.current, 1);
      newList.splice(dragOverItem.current, 0, draggedItemContent);
      setSelectedDestinations(newList);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Trip duration calculations
  const calculateNights = () => {
    if (datesDecided || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nightsCount = calculateNights();

  // Validate Dates
  const isDateRangeInvalid = () => {
    if (datesDecided) return false;
    if (!startDate || !endDate) return false;
    return new Date(endDate) < new Date(startDate);
  };

  // Travel style selection toggle
  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  // Generate Itinerary and save
  const handleCreateJourney = () => {
    setIsGenerating(true);
    
    // Simulate luxury planning progress steps
    const phases = [
      'Analyzing geographic routes...',
      'Optimizing travel style allocations...',
      'Mapping boutique hotel arrivals...',
      'Curating culinary and art experiences...',
      'Finalizing your personalized journal...'
    ];

    let currentPhase = 0;
    const interval = setInterval(() => {
      if (currentPhase < phases.length - 1) {
        currentPhase += 1;
        setGenerationPhase(currentPhase);
      } else {
        clearInterval(interval);
        
        // Generate actual itinerary day allocation
        const D = datesDecided ? selectedDestinations.length * 3 : Math.max(1, nightsCount);
        const N = selectedDestinations.length;
        
        // Allocate days proportionally
        const dayAllocation: number[] = [];
        let allocatedSum = 0;
        
        // Step 1: Assign at least 1 day per city
        selectedDestinations.forEach(() => {
          dayAllocation.push(1);
          allocatedSum += 1;
        });

        // Step 2: Distribute remaining days based on recommended duration weights
        if (D > N) {
          const remainingDays = D - N;
          const totalRecommended = selectedDestinations.reduce((sum, d) => sum + d.recommendedDuration, 0);
          
          let distributedCount = 0;
          selectedDestinations.forEach((dest, i) => {
            if (i === N - 1) {
              // Add remainder to last city
              dayAllocation[i] += remainingDays - distributedCount;
            } else {
              const weight = dest.recommendedDuration / totalRecommended;
              const extra = Math.round(remainingDays * weight);
              dayAllocation[i] += extra;
              distributedCount += extra;
            }
          });
        }

        // Build itinerary days list
        const itinerary: ItineraryDay[] = [];
        let dayCounter = 1;
        
        const startBaseDate = startDate ? new Date(startDate) : new Date();

        selectedDestinations.forEach((dest, cityIdx) => {
          const cityDays = dayAllocation[cityIdx];
          
          // Match activities with style tags
          const matched = dest.activities.filter(act => 
            act.styles.some(style => selectedStyles.includes(style))
          );
          const activeActivitiesList = matched.length > 0 ? matched : dest.activities;

          for (let d = 0; d < cityDays; d++) {
            // Format current date
            let dateStr = `Day ${dayCounter}`;
            if (!datesDecided && startDate) {
              const curDate = new Date(startBaseDate);
              curDate.setDate(startBaseDate.getDate() + dayCounter - 1);
              dateStr = curDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }

            const dayActivities: string[] = [];
            
            if (d === 0) {
              dayActivities.push(`Arrival in ${dest.city} · Private airport transfer & boutique check-in`);
              // Relaxed or photo activity
              const firstAct = activeActivitiesList.find(a => a.styles.includes('relaxed') || a.styles.includes('photography')) 
                || activeActivitiesList[0];
              dayActivities.push(firstAct.name);
            } else {
              // Attractions
              const att = dest.attractions[(d - 1) % dest.attractions.length];
              dayActivities.push(`Explore ${att} and cultural surroundings`);
              
              // Custom matched activity
              const act = activeActivitiesList[(d) % activeActivitiesList.length];
              dayActivities.push(act.name);
            }

            // Transit to next destination on last day of this city
            if (d === cityDays - 1 && cityIdx < N - 1) {
              const nextCity = selectedDestinations[cityIdx + 1].city;
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

        // Save StoredJourney
        const firstDest = selectedDestinations[0];
        const journeyId = crypto.randomUUID();
        const citiesListText = selectedDestinations.map(d => d.city).join(' · ');
        
        let finalBudgetText = budgetLabel;
        if (budgetLabel === 'custom') {
          finalBudgetText = `₹${Number(customBudget).toLocaleString()}`;
        }

        const journey: StoredJourney = {
          id: journeyId,
          destination: citiesListText.toUpperCase(),
          budget: budgetLabel === 'I\'ll decide later' ? 0 : (budgetLabel === 'custom' ? Number(customBudget) : Number(budgetLabel.replace(/[^0-9]/g, ''))),
          travelers: adults + children,
          style: selectedStyles.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · '),
          createdAt: new Date().toISOString(),
          status: 'Planning',
          destinations: selectedDestinations,
          startDate: datesDecided ? undefined : startDate,
          endDate: datesDecided ? undefined : endDate,
          datesDecided: datesDecided,
          travellersBreakdown: { adults, children },
          budgetValue: {
            amount: budgetLabel === 'I\'ll decide later' ? null : (budgetLabel === 'custom' ? Number(customBudget) : Number(budgetLabel.replace(/[^0-9]/g, ''))),
            label: finalBudgetText
          },
          interests: selectedStyles,
          pace: pace,
          itinerary: itinerary,
          coverImage: firstDest.image
        };

        travelStorage.saveJourney(journey);
        
        // Done, redirect
        setTimeout(() => {
          onNavigate(`/journey/${journeyId}`);
        }, 600);
      }
    }, 900);
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

  // Quick helper warnings
  const showShortTripWarning = () => {
    if (datesDecided) return false;
    const destCount = selectedDestinations.length;
    const totalDays = nightsCount;
    // e.g. 3 destinations in 5 days
    return destCount > 1 && totalDays > 0 && totalDays < destCount * 2;
  };

  if (isGenerating) {
    const phases = [
      'Analyzing geographic routes...',
      'Optimizing travel style allocations...',
      'Mapping boutique hotel arrivals...',
      'Curating culinary and art experiences...',
      'Finalizing your personalized journal...'
    ];

    return (
      <div className="min-h-screen bg-warmBg flex flex-col items-center justify-center px-6 selection:bg-black selection:text-white">
        <div className="max-w-md w-full text-center space-y-8 animate-pulse">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center border border-subtleBorder shadow-sm">
            <Sparkles className="w-6 h-6 text-black animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          
          <div className="space-y-3">
            <h2 className="font-instrument text-4xl text-black leading-none">
              Crafting your journey...
            </h2>
            <p className="font-mono text-xs text-mutedGray uppercase tracking-widest min-h-[16px]">
              {phases[generationPhase]}
            </p>
          </div>

          <div className="w-full bg-subtleBorder h-[1px] relative overflow-hidden rounded-full">
            <div 
              className="absolute left-0 top-0 h-full bg-black transition-all duration-700 ease-out" 
              style={{ width: `${((generationPhase + 1) / phases.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] text-black font-sans selection:bg-black selection:text-white pb-24">
      {/* Header and Brand */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-6 flex items-center justify-between border-b border-subtleBorder">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-mutedGray hover:text-black transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO DASHBOARD</span>
        </button>

        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
          className="font-instrument text-3xl tracking-tight select-none inline-flex items-baseline"
        >
          <span>Aethera</span>
          <sup className="text-xs font-sans ml-0.5 relative -top-3">°</sup>
        </a>
      </div>

      {/* Main planner workspace */}
      <div className="max-w-3xl mx-auto px-6 pt-12 sm:pt-16">
        
        {/* Editorial Title */}
        <div className="space-y-4 mb-10 text-center sm:text-left">
          <h1 className="font-instrument text-5xl sm:text-6xl text-black tracking-tight leading-none">
            Plan your next journey
          </h1>
          <p className="font-inter text-sm sm:text-base text-mutedGray max-w-xl">
            Tell us where you want to go, and we'll shape the journey around you.
          </p>
        </div>

        {/* Progress bar indicator */}
        <div className="flex items-center justify-center sm:justify-start gap-4 mb-12 font-mono text-xs text-mutedGray border-b border-neutral-100 pb-4">
          <button 
            disabled={selectedDestinations.length === 0}
            onClick={() => setStep(1)}
            className={`transition-colors uppercase tracking-wider ${step === 1 ? 'text-black font-bold border-b border-black pb-4 -mb-4' : 'hover:text-black'}`}
          >
            01 Destination
          </button>
          <span className="text-neutral-300">→</span>
          <button 
            disabled={selectedDestinations.length === 0}
            onClick={() => setStep(2)}
            className={`transition-colors uppercase tracking-wider ${step === 2 ? 'text-black font-bold border-b border-black pb-4 -mb-4' : 'hover:text-black disabled:opacity-50'}`}
          >
            02 Details
          </button>
          <span className="text-neutral-300">→</span>
          <button 
            disabled={selectedDestinations.length === 0 || isDateRangeInvalid()}
            onClick={() => setStep(3)}
            className={`transition-colors uppercase tracking-wider ${step === 3 ? 'text-black font-bold border-b border-black pb-4 -mb-4' : 'hover:text-black disabled:opacity-50'}`}
          >
            03 Your Plan
          </button>
        </div>

        {/* STEP 1: CHOOSE DESTINATIONS */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-rise">
            <div className="space-y-4">
              <label htmlFor="search-cities" className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                Where do you want to go?
              </label>
              
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedGray" />
                  <input
                    id="search-cities"
                    type="text"
                    placeholder="Search cities, regions or countries..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchQuery) setShowDropdown(true); }}
                    className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-full pl-11 pr-5 py-4 text-sm font-inter transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-mutedGray hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Floating Autocomplete Dropdown */}
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border border-subtleBorder rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-rise">
                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100">
                      {searchResults.map((dest) => (
                        <button
                          key={dest.city}
                          onClick={() => addDestination(dest)}
                          className="w-full text-left px-5 py-3.5 hover:bg-warmBg flex items-center justify-between text-sm transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-mutedGray" />
                            <div>
                              <span className="font-medium text-black">{dest.city}</span>
                              <span className="text-xs text-mutedGray ml-2">{dest.region}, {dest.country}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-mutedGray bg-neutral-100 px-2 py-0.5 rounded">
                            {dest.recommendedDuration} Days
                          </span>
                        </button>
                      ))}

                      {/* If query has length but no matching default cities */}
                      {searchResults.length === 0 && searchQuery.trim().length > 0 && (
                        <button
                          onClick={() => addDestination(getOrCreateDestination(searchQuery))}
                          className="w-full text-left px-5 py-4 hover:bg-warmBg flex items-center gap-2 text-sm text-black font-medium transition-colors cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add "{searchQuery}" as custom destination</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Destinations List */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                Selected Destinations ({selectedDestinations.length})
              </span>

              {selectedDestinations.length === 0 ? (
                <div className="border border-dashed border-subtleBorder rounded-2xl p-10 text-center bg-warmBg/50 text-sm text-mutedGray font-inter">
                  No destinations selected yet. Search and select above to begin.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDestinations.map((dest, index) => (
                    <div
                      key={dest.city + index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className="group bg-[#FFFFFF] border border-[#E7E5E2] hover:border-black rounded-2xl p-4 sm:p-5 card-hover-effect cursor-grab active:cursor-grabbing relative transition-all shadow-xs hover:shadow-md space-y-4"
                    >
                      {/* Top Header Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Drag Handle Indicator */}
                          <div className="text-mutedGray/50 group-hover:text-black transition-colors cursor-grab">
                            <Move className="w-4 h-4" />
                          </div>

                          {/* Number Index */}
                          <span className="font-mono text-xs text-mutedGray font-bold">
                            {String(index + 1).padStart(2, '0')}
                          </span>

                          {/* City Details */}
                          <div>
                            <h3 className="font-instrument text-2xl text-black leading-none mb-0.5">
                              {dest.city}
                            </h3>
                            <p className="text-xs text-mutedGray font-inter">
                              {dest.region}, {dest.country} · {dest.recommendedDuration} Days Recommended
                            </p>
                          </div>
                        </div>

                        {/* Controls and Actions */}
                        <div className="flex items-center gap-2">
                          {/* Reordering Move Controls */}
                          <div className="flex items-center gap-1 text-mutedGray">
                            <button
                              type="button"
                              onClick={() => moveDestination(index, 'up')}
                              disabled={index === 0}
                              className="p-1.5 hover:text-black hover:bg-neutral-100 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Move up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDestination(index, 'down')}
                              disabled={index === selectedDestinations.length - 1}
                              className="p-1.5 hover:text-black hover:bg-neutral-100 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Move down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => removeDestination(index)}
                            className="p-2 text-mutedGray hover:text-red-500 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Remove city"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 2 High-Resolution Photos Showcase */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative h-28 sm:h-36 rounded-xl overflow-hidden bg-neutral-900 group-hover:scale-[1.01] transition-transform">
                          <img
                            src={dest.image}
                            alt={`${dest.city} landmark view 1`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs line-clamp-1">
                            {dest.attractions[0] || `${dest.city} Landmark`}
                          </span>
                        </div>

                        <div className="relative h-28 sm:h-36 rounded-xl overflow-hidden bg-neutral-900 group-hover:scale-[1.01] transition-transform">
                          <img
                            src={dest.secondaryImage || dest.image}
                            alt={`${dest.city} landmark view 2`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white/90 px-2 py-0.5 rounded bg-black/50 backdrop-blur-xs line-clamp-1">
                            {dest.attractions[1] || `${dest.city} Heritage`}
                          </span>
                        </div>
                      </div>

                      {/* City Attractions & Style Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {dest.attractions.slice(0, 3).map((att, attIdx) => (
                          <span
                            key={attIdx}
                            className="text-[10px] font-mono text-neutral-600 bg-[#FAF8F5] border border-[#E7E5E2] px-2 py-0.5 rounded-full"
                          >
                            • {att}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Continue */}
            {selectedDestinations.length > 0 && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 rounded-full px-8 py-4.5 bg-black text-white hover:bg-neutral-800 transition-all font-medium text-sm cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: TRIP DETAILS */}
        {step === 2 && (
          <div className="space-y-10 animate-fade-rise">
            
            {/* Dates Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                  When are you travelling?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="decided-dates"
                    checked={datesDecided}
                    onChange={(e) => setDatesDecided(e.target.checked)}
                    className="w-4 h-4 rounded text-black border-subtleBorder focus:ring-black cursor-pointer"
                  />
                  <label htmlFor="decided-dates" className="text-xs font-inter text-mutedGray select-none cursor-pointer">
                    Dates to be decided
                  </label>
                </div>
              </div>

              {!datesDecided ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedGray pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl pl-11 pr-4 py-3.5 text-sm font-inter transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedGray pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl pl-11 pr-4 py-3.5 text-sm font-inter transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="border border-subtleBorder bg-warmBg/50 p-4 rounded-xl text-xs sm:text-sm text-mutedGray font-inter">
                  We'll plan with flexible daily templates. You can set firm dates later.
                </div>
              )}

              {isDateRangeInvalid() && (
                <p className="text-xs text-red-500 font-mono mt-1">
                  * End date cannot be before start date.
                </p>
              )}
            </div>

            {/* Travelers Selector */}
            <div className="space-y-4">
              <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                Who's coming?
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between border border-subtleBorder bg-warmBg rounded-xl px-5 py-4">
                  <div>
                    <span className="font-medium text-sm text-black block">Adults</span>
                    <span className="text-[11px] text-mutedGray">Ages 13+</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-full border border-subtleBorder flex items-center justify-center text-black hover:border-black transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold w-4 text-center">{adults}</span>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-full border border-subtleBorder flex items-center justify-center text-black hover:border-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border border-subtleBorder bg-warmBg rounded-xl px-5 py-4">
                  <div>
                    <span className="font-medium text-sm text-black block">Children</span>
                    <span className="text-[11px] text-mutedGray">Ages 2-12</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-full border border-subtleBorder flex items-center justify-center text-black hover:border-black transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold w-4 text-center">{children}</span>
                    <button
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-full border border-subtleBorder flex items-center justify-center text-black hover:border-black transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-mutedGray pt-1 px-1">
                <span>TOTAL TRAVELERS</span>
                <span className="font-bold text-black">{adults + children} Travellers</span>
              </div>
            </div>

            {/* Budget Range */}
            <div className="space-y-4">
              <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                What's your approximate budget?
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['₹25,000', '₹50,000', '₹1,00,000', '₹2,00,000+'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setBudgetLabel(opt); setCustomBudget(''); }}
                    className={`border px-4 py-3 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      budgetLabel === opt
                        ? 'bg-black border-black text-white'
                        : 'bg-warmBg border-subtleBorder hover:border-black text-black'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
                
                <button
                  onClick={() => setBudgetLabel('I\'ll decide later')}
                  className={`border px-4 py-3 rounded-xl text-xs font-mono transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                    budgetLabel === 'I\'ll decide later'
                      ? 'bg-black border-black text-white'
                      : 'bg-warmBg border-subtleBorder hover:border-black text-black'
                  }`}
                >
                  Later
                </button>
              </div>

              {/* Custom budget entry */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => setBudgetLabel('custom')}
                  className={`border px-4 py-3 rounded-xl text-xs font-mono transition-all shrink-0 cursor-pointer ${
                    budgetLabel === 'custom'
                      ? 'bg-black border-black text-white'
                      : 'bg-warmBg border-subtleBorder hover:border-black text-black'
                  }`}
                >
                  Custom Amount (₹)
                </button>
                {budgetLabel === 'custom' && (
                  <input
                    type="number"
                    placeholder="Enter amount..."
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    className="w-full bg-warmBg border border-subtleBorder focus:border-black focus:outline-hidden rounded-xl px-4 py-2.5 text-xs font-mono"
                  />
                )}
              </div>
            </div>

            {/* Travel Style */}
            <div className="space-y-4">
              <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                Travel Style (Select all that apply)
              </label>
              
              <div className="flex flex-wrap gap-2">
                {travelStylesList.map((st) => {
                  const isSelected = selectedStyles.includes(st.value);
                  return (
                    <button
                      key={st.value}
                      onClick={() => toggleStyle(st.value)}
                      className={`px-4 py-2 rounded-full text-xs font-inter border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-black border-black text-white font-medium'
                          : 'bg-warmBg border-subtleBorder hover:border-black text-black'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Pace */}
            <div className="space-y-4">
              <label className="font-mono text-xs uppercase tracking-widest text-mutedGray block">
                Pace
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'slow', label: 'Slow & relaxed', desc: 'Savoring locations, deeper stays' },
                  { value: 'balanced', label: 'Balanced', desc: 'A mix of landmarks & downtime' },
                  { value: 'packed', label: 'Packed & exploratory', desc: 'Maximizing sights, fast-paced transitions' }
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPace(p.value as any)}
                    className={`border p-4 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      pace === p.value
                        ? 'bg-black border-black text-white'
                        : 'bg-warmBg border-subtleBorder hover:border-black text-black'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold uppercase">{p.label}</span>
                    <span className={`text-[10px] ${pace === p.value ? 'text-neutral-300' : 'text-mutedGray'}`}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Back & Continue Buttons */}
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm font-medium text-mutedGray hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                disabled={isDateRangeInvalid() || (!datesDecided && (!startDate || !endDate))}
                className="flex items-center justify-center gap-2 rounded-full px-8 py-4.5 bg-black text-white hover:bg-neutral-800 transition-all font-medium text-sm disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: PREFERENCES & GENERATE */}
        {step === 3 && (
          <div className="space-y-10 animate-fade-rise">
            
            {/* Short Trip Warnings */}
            {showShortTripWarning() && (
              <div className="border border-amber-200 bg-amber-50/50 p-5 rounded-2xl flex items-start gap-4 text-amber-800 animate-fade-rise">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase font-mono tracking-wider">Pace Advisory</h4>
                  <p className="text-sm font-inter leading-relaxed">
                    {selectedDestinations.length} destinations in {nightsCount} days will feel quite fast. We recommend {Math.max(1, Math.floor(nightsCount/2.5))}–{Math.max(1, Math.floor(nightsCount/2))} destinations for a more relaxed journey.
                  </p>
                </div>
              </div>
            )}

            {/* Summary details */}
            <div className="border border-subtleBorder rounded-[24px] bg-warmBg p-6 sm:p-8 space-y-6">
              
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-mutedGray block mb-1">
                  Your journey
                </span>
                <h3 className="font-instrument text-4xl text-black leading-none">
                  {selectedDestinations.map(d => d.city).join(' → ')}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-4 border-t border-neutral-100 font-inter text-xs text-mutedGray">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5">DATES</span>
                  <span className="text-black font-medium">
                    {datesDecided 
                      ? 'Dates to be decided' 
                      : `${new Date(startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — ${new Date(endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} (${nightsCount} Days)`
                    }
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5">TRAVELLERS</span>
                  <span className="text-black font-medium">{adults + children} travellers</span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5">BUDGET TARGET</span>
                  <span className="text-black font-medium">
                    {budgetLabel === 'custom' ? `₹${Number(customBudget).toLocaleString()}` : budgetLabel}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-0.5">TRAVEL STYLE</span>
                  <span className="text-black font-medium capitalize">
                    {selectedStyles.join(' · ')}
                  </span>
                </div>
              </div>

            </div>

            {/* Final CTAs */}
            <div className="pt-6 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-sm font-medium text-mutedGray hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleCreateJourney}
                className="flex items-center justify-center gap-2 rounded-full px-9 py-5 bg-black text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-medium text-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-neutral-200" />
                <span>✦ Create my journey</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
