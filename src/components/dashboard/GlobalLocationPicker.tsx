import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe2, 
  MapPin, 
  Navigation, 
  Search, 
  X, 
  Plus, 
  Check, 
  ChevronDown, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { 
  getCountries, 
  getStatesForCountry, 
  getCitiesForState, 
  getSubdivisionLabel, 
  createGlobalDestination,
  LocationCountry,
  LocationState,
  LocationCity
} from '../../services/locationService';
import { DestinationInfo } from '../../services/destinations';

interface GlobalLocationPickerProps {
  onAddDestination: (dest: DestinationInfo) => void;
  existingDestinations: DestinationInfo[];
}

export const GlobalLocationPicker: React.FC<GlobalLocationPickerProps> = ({
  onAddDestination,
  existingDestinations,
}) => {
  // Selection State
  const [selectedCountry, setSelectedCountry] = useState<LocationCountry | null>(null);
  const [selectedState, setSelectedState] = useState<LocationState | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationCity | null>(null);

  // Search Queries
  const [countryQuery, setCountryQuery] = useState('');
  const [stateQuery, setStateQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');

  // Dropdown Open States
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Loading States
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [justAddedCity, setJustAddedCity] = useState<string | null>(null);

  // Refs for click outside
  const countryRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // All countries
  const allCountries = useMemo(() => getCountries(), []);

  // Filtered Countries
  const filteredCountries = useMemo(() => {
    if (!countryQuery.trim()) return allCountries.slice(0, 100);
    const q = countryQuery.toLowerCase().trim();
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    ).slice(0, 100);
  }, [allCountries, countryQuery]);

  // States for selected Country
  const [countryStates, setCountryStates] = useState<LocationState[]>([]);

  useEffect(() => {
    if (selectedCountry) {
      setIsLoadingStates(true);
      // Fast microtask execution to allow smooth UI transition
      const timer = setTimeout(() => {
        const states = getStatesForCountry(selectedCountry.code);
        setCountryStates(states);
        setIsLoadingStates(false);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setCountryStates([]);
    }
  }, [selectedCountry]);

  // Filtered States
  const filteredStates = useMemo(() => {
    if (!stateQuery.trim()) return countryStates.slice(0, 100);
    const q = stateQuery.toLowerCase().trim();
    return countryStates.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 100);
  }, [countryStates, stateQuery]);

  // Cities for selected State
  const [stateCities, setStateCities] = useState<LocationCity[]>([]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      setIsLoadingCities(true);
      const timer = setTimeout(() => {
        const cities = getCitiesForState(selectedCountry.code, selectedState.code);
        setStateCities(cities);
        setIsLoadingCities(false);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setStateCities([]);
    }
  }, [selectedCountry, selectedState]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return stateCities.slice(0, 100);
    const q = cityQuery.toLowerCase().trim();
    return stateCities.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 100);
  }, [stateCities, cityQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setIsCountryOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setIsStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subdivision label
  const subdivisionLabel = useMemo(() => {
    return selectedCountry ? getSubdivisionLabel(selectedCountry.code) : 'State / Region';
  }, [selectedCountry]);

  // Country Selection Handler
  const handleSelectCountry = (country: LocationCountry) => {
    setSelectedCountry(country);
    setCountryQuery('');
    setIsCountryOpen(false);

    // Clear downstream selections
    setSelectedState(null);
    setStateQuery('');
    setSelectedCity(null);
    setCityQuery('');

    // Open next dropdown automatically for fast flow
    setTimeout(() => setIsStateOpen(true), 100);
  };

  // State Selection Handler
  const handleSelectState = (state: LocationState) => {
    setSelectedState(state);
    setStateQuery('');
    setIsStateOpen(false);

    // Clear downstream city
    setSelectedCity(null);
    setCityQuery('');

    // Open city dropdown automatically
    setTimeout(() => setIsCityOpen(true), 100);
  };

  // City Selection Handler
  const handleSelectCity = (city: LocationCity) => {
    setSelectedCity(city);
    setCityQuery('');
    setIsCityOpen(false);
  };

  // Add City to Itinerary
  const handleAddCityToJourney = (cityToAdd?: LocationCity | { name: string }) => {
    const targetCity = cityToAdd || selectedCity;
    if (!selectedCountry || !targetCity) return;

    const cityName = targetCity.name.trim();
    const stateName = selectedState ? selectedState.name : selectedCountry.name;
    const countryName = selectedCountry.name;

    const lat = 'latitude' in targetCity && typeof targetCity.latitude === 'string' && targetCity.latitude ? parseFloat(targetCity.latitude) : undefined;
    const lng = 'longitude' in targetCity && typeof targetCity.longitude === 'string' && targetCity.longitude ? parseFloat(targetCity.longitude) : undefined;

    const newDest = createGlobalDestination(countryName, stateName, cityName, lat, lng);
    onAddDestination(newDest);

    setJustAddedCity(cityName);
    setSelectedCity(null);
    setCityQuery('');
    setIsCityOpen(false);

    setTimeout(() => {
      setJustAddedCity(null);
    }, 2500);
  };

  const isCityAlreadyAdded = (name: string) => {
    return existingDestinations.some(
      (d) => d.city.toLowerCase() === name.toLowerCase().trim()
    );
  };

  return (
    <div className="space-y-6 bg-[#FFFFFF] border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-mutedGray block mb-1">
            GLOBAL LOCATION SELECTOR
          </span>
          <h2 className="font-instrument text-2xl sm:text-3xl text-black leading-tight">
            Select Country, {subdivisionLabel} & City
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-mutedGray bg-warmBg px-3 py-1.5 rounded-full border border-subtleBorder self-start sm:self-auto">
          <Globe2 className="w-3.5 h-3.5 text-black" />
          <span>Worldwide Geographic Engine</span>
        </div>
      </div>

      {/* 3-Step Cascading Dropdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        {/* 1. Country Selector */}
        <div className="relative" ref={countryRef}>
          <label className="block text-xs font-mono uppercase tracking-wider text-mutedGray mb-2 flex items-center justify-between">
            <span>01 Country</span>
            {selectedCountry && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                {selectedCountry.code}
              </span>
            )}
          </label>

          <div
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className={`relative flex items-center bg-warmBg border rounded-2xl px-4 py-3.5 transition-all cursor-pointer ${
              isCountryOpen ? 'border-black ring-1 ring-black bg-white shadow-sm' : 'border-subtleBorder hover:border-black/50'
            }`}
          >
            <Globe2 className="w-4 h-4 text-mutedGray mr-3 shrink-0" />
            <div className="flex-1 truncate text-sm font-inter">
              {selectedCountry ? (
                <span className="font-medium text-black flex items-center gap-2">
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                </span>
              ) : (
                <span className="text-mutedGray">Select Country...</span>
              )}
            </div>
            {selectedCountry ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCountry(null);
                  setSelectedState(null);
                  setSelectedCity(null);
                  setCountryQuery('');
                }}
                className="p-1 text-mutedGray hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer mr-1"
                title="Clear Country"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <ChevronDown className={`w-4 h-4 text-mutedGray transition-transform duration-200 ${isCountryOpen ? 'rotate-180 text-black' : ''}`} />
          </div>

          {/* Searchable Country Dropdown */}
          {isCountryOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border border-subtleBorder rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-rise">
              {/* Internal Search Input */}
              <div className="p-3 border-b border-neutral-100 bg-warmBg/50 flex items-center gap-2">
                <Search className="w-4 h-4 text-mutedGray shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={countryQuery}
                  onChange={(e) => setCountryQuery(e.target.value)}
                  placeholder="Search country (e.g. India, USA, Japan)..."
                  className="w-full bg-transparent text-sm font-inter text-black placeholder:text-mutedGray focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                {countryQuery && (
                  <button
                    onClick={() => setCountryQuery('')}
                    className="p-1 text-mutedGray hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100/60">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleSelectCountry(country)}
                      className={`w-full text-left px-4 py-3 hover:bg-warmBg flex items-center justify-between text-sm transition-colors cursor-pointer ${
                        selectedCountry?.code === country.code ? 'bg-neutral-100 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base leading-none">{country.flag}</span>
                        <span className="truncate text-black">{country.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-mutedGray bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                        {country.code}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-inter text-mutedGray">
                    No countries matching "{countryQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. State / Province / Region Selector */}
        <div className="relative" ref={stateRef}>
          <label className="block text-xs font-mono uppercase tracking-wider text-mutedGray mb-2 flex items-center justify-between">
            <span>02 {subdivisionLabel}</span>
            {selectedState && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                {selectedState.code}
              </span>
            )}
          </label>

          <div
            onClick={() => {
              if (selectedCountry) setIsStateOpen(!isStateOpen);
            }}
            className={`relative flex items-center rounded-2xl px-4 py-3.5 transition-all ${
              !selectedCountry
                ? 'bg-neutral-100/60 border border-dashed border-subtleBorder text-mutedGray/50 cursor-not-allowed'
                : isStateOpen
                ? 'bg-white border border-black ring-1 ring-black shadow-sm cursor-pointer'
                : 'bg-warmBg border border-subtleBorder hover:border-black/50 cursor-pointer'
            }`}
          >
            <Navigation className="w-4 h-4 text-mutedGray mr-3 shrink-0" />
            <div className="flex-1 truncate text-sm font-inter">
              {!selectedCountry ? (
                <span className="text-mutedGray/60">Select Country First</span>
              ) : selectedState ? (
                <span className="font-medium text-black">{selectedState.name}</span>
              ) : isLoadingStates ? (
                <span className="text-mutedGray flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading divisions...
                </span>
              ) : (
                <span className="text-mutedGray">Select {subdivisionLabel}...</span>
              )}
            </div>
            {selectedState ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedState(null);
                  setSelectedCity(null);
                  setStateQuery('');
                }}
                className="p-1 text-mutedGray hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer mr-1"
                title={`Clear ${subdivisionLabel}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <ChevronDown className={`w-4 h-4 text-mutedGray transition-transform duration-200 ${isStateOpen ? 'rotate-180 text-black' : ''}`} />
          </div>

          {/* Searchable State Dropdown */}
          {isStateOpen && selectedCountry && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border border-subtleBorder rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-rise">
              <div className="p-3 border-b border-neutral-100 bg-warmBg/50 flex items-center gap-2">
                <Search className="w-4 h-4 text-mutedGray shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={stateQuery}
                  onChange={(e) => setStateQuery(e.target.value)}
                  placeholder={`Search ${subdivisionLabel.toLowerCase()} (e.g. Gujarat, California)...`}
                  className="w-full bg-transparent text-sm font-inter text-black placeholder:text-mutedGray focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                {stateQuery && (
                  <button
                    onClick={() => setStateQuery('')}
                    className="p-1 text-mutedGray hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100/60">
                {isLoadingStates ? (
                  <div className="p-5 text-center text-xs font-inter text-mutedGray flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Loading administrative regions...</span>
                  </div>
                ) : filteredStates.length > 0 ? (
                  filteredStates.map((state) => (
                    <button
                      key={state.code || state.name}
                      type="button"
                      onClick={() => handleSelectState(state)}
                      className={`w-full text-left px-4 py-3 hover:bg-warmBg flex items-center justify-between text-sm transition-colors cursor-pointer ${
                        selectedState?.code === state.code ? 'bg-neutral-100 font-medium' : ''
                      }`}
                    >
                      <span className="truncate text-black">{state.name}</span>
                      {state.code && (
                        <span className="text-[10px] font-mono text-mutedGray bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                          {state.code}
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs font-inter text-mutedGray">
                    {countryStates.length === 0 ? (
                      <div>
                        <span>No explicit subdivisions recorded.</span>
                        <button
                          type="button"
                          onClick={() => handleSelectState({ code: 'ALL', name: selectedCountry.name, countryCode: selectedCountry.code })}
                          className="mt-2 block mx-auto text-xs underline font-medium text-black hover:text-neutral-700"
                        >
                          Use {selectedCountry.name} as Region & Proceed
                        </button>
                      </div>
                    ) : (
                      `No ${subdivisionLabel.toLowerCase()} found matching "${stateQuery}"`
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. City Selector */}
        <div className="relative" ref={cityRef}>
          <label className="block text-xs font-mono uppercase tracking-wider text-mutedGray mb-2 flex items-center justify-between">
            <span>03 City</span>
            {stateCities.length > 0 && (
              <span className="text-[10px] text-mutedGray font-mono">
                {stateCities.length} Cities Available
              </span>
            )}
          </label>

          <div
            onClick={() => {
              if (selectedState) setIsCityOpen(!isCityOpen);
            }}
            className={`relative flex items-center rounded-2xl px-4 py-3.5 transition-all ${
              !selectedState
                ? 'bg-neutral-100/60 border border-dashed border-subtleBorder text-mutedGray/50 cursor-not-allowed'
                : isCityOpen
                ? 'bg-white border border-black ring-1 ring-black shadow-sm cursor-pointer'
                : 'bg-warmBg border border-subtleBorder hover:border-black/50 cursor-pointer'
            }`}
          >
            <MapPin className="w-4 h-4 text-mutedGray mr-3 shrink-0" />
            <div className="flex-1 truncate text-sm font-inter">
              {!selectedState ? (
                <span className="text-mutedGray/60">Select {subdivisionLabel} First</span>
              ) : selectedCity ? (
                <span className="font-medium text-black">{selectedCity.name}</span>
              ) : isLoadingCities ? (
                <span className="text-mutedGray flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading cities...
                </span>
              ) : (
                <span className="text-mutedGray">Search & Select City...</span>
              )}
            </div>
            {selectedCity ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCity(null);
                  setCityQuery('');
                }}
                className="p-1 text-mutedGray hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer mr-1"
                title="Clear City"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
            <ChevronDown className={`w-4 h-4 text-mutedGray transition-transform duration-200 ${isCityOpen ? 'rotate-180 text-black' : ''}`} />
          </div>

          {/* Searchable City Dropdown */}
          {isCityOpen && selectedState && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FFFFFF] border border-subtleBorder rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-rise">
              <div className="p-3 border-b border-neutral-100 bg-warmBg/50 flex items-center gap-2">
                <Search className="w-4 h-4 text-mutedGray shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Search city (e.g. Anand, Ahmedabad, SF)..."
                  className="w-full bg-transparent text-sm font-inter text-black placeholder:text-mutedGray focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
                {cityQuery && (
                  <button
                    onClick={() => setCityQuery('')}
                    className="p-1 text-mutedGray hover:text-black"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100/60">
                {isLoadingCities ? (
                  <div className="p-5 text-center text-xs font-inter text-mutedGray flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Loading municipal directory...</span>
                  </div>
                ) : filteredCities.length > 0 ? (
                  filteredCities.map((city) => {
                    const alreadyAdded = isCityAlreadyAdded(city.name);
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => {
                          handleSelectCity(city);
                          handleAddCityToJourney(city);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-warmBg flex items-center justify-between text-sm transition-colors cursor-pointer ${
                          selectedCity?.name === city.name ? 'bg-neutral-100 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-mutedGray shrink-0" />
                          <span className="truncate text-black">{city.name}</span>
                        </div>
                        {alreadyAdded ? (
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" /> In Route
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-mutedGray bg-neutral-100 px-2 py-0.5 rounded group-hover:bg-black group-hover:text-white transition-colors shrink-0">
                            + Add
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs font-inter text-mutedGray space-y-3">
                    <p>No listed city found matching "{cityQuery}".</p>
                    {cityQuery.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleAddCityToJourney({ name: cityQuery.trim() });
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add "{cityQuery.trim()}" as Destination</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Location Confirmation Bar / Direct Add Button */}
      {selectedCountry && selectedState && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-warmBg/70 p-4 rounded-2xl border border-subtleBorder">
          <div className="flex items-center gap-2.5 text-xs text-black font-inter">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              Route Path: <strong className="font-semibold">{selectedCountry.flag} {selectedCountry.name}</strong> → <strong>{selectedState.name}</strong>
              {selectedCity && (
                <> → <strong className="underline underline-offset-2">{selectedCity.name}</strong></>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {selectedCity ? (
              <button
                type="button"
                onClick={() => handleAddCityToJourney()}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {selectedCity.name} to Route</span>
              </button>
            ) : (
              <span className="text-xs font-mono text-mutedGray">
                Select a city above to add to itinerary
              </span>
            )}
          </div>
        </div>
      )}

      {/* Instant Success Flash Badge */}
      {justAddedCity && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-mono flex items-center gap-2 animate-fade-rise">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Added <strong>{justAddedCity}</strong> to your journey route!</span>
        </div>
      )}
    </div>
  );
};
