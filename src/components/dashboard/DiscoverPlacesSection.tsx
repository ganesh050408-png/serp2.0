import React, { useState, useEffect } from 'react';
import {
  Compass,
  Building2,
  Hotel,
  Moon,
  ShoppingBag,
  Utensils,
  MapPin,
  Star,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Plus,
  Search,
  Loader2,
  Check,
} from 'lucide-react';
import { StoredJourney, PlaceCategory, SavedPlace, travelStorage } from '../../services/travelStorage';

interface DiscoverPlacesSectionProps {
  journey: StoredJourney;
  onUpdateJourney: (updated: StoredJourney) => void;
}

interface PlaceItem {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  amenities?: string[];
  isOpen?: boolean;
}

const CATEGORIES: Array<{ id: PlaceCategory; label: string; icon: React.FC<{ className?: string }> }> = [
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'resort', label: 'Resorts', icon: Building2 },
  { id: 'hostel', label: 'Hostels', icon: Building2 },
  { id: 'restaurant', label: 'Dining & Cafes', icon: Utensils },
  { id: 'club', label: 'Clubs & Nightlife', icon: Moon },
  { id: 'shopping', label: 'Shopping & Bazaars', icon: ShoppingBag },
  { id: 'activity', label: 'Activities & Sites', icon: Compass },
];

export const DiscoverPlacesSection: React.FC<DiscoverPlacesSectionProps> = ({
  journey,
  onUpdateJourney,
}) => {
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>('hotel');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(
    journey.destinations?.[0]?.city || journey.destinations?.[0]?.name || journey.city || 'Mumbai'
  );
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [addingToDay, setAddingToDay] = useState<{ place: PlaceItem; dayIndex: number } | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Available destination cities from journey
  const availableCities = Array.from(
    new Set(
      [
        ...(journey.destinations?.map((d: any) => d.city || d.name) || []),
        journey.city,
        journey.destination,
      ].filter(Boolean) as string[]
    )
  );

  const fetchPlaces = async (category: PlaceCategory, city: string) => {
    setLoading(true);
    setError(null);
    try {
      // Find coordinates if available in journey destinations
      const destMatch: any = journey.destinations?.find(
        (d: any) => (d.city || d.name || '').toLowerCase() === city.toLowerCase()
      );
      const lat = destMatch?.coordinates?.[0] || destMatch?.lat;
      const lng = destMatch?.coordinates?.[1] || destMatch?.lng;

      const params = new URLSearchParams({
        category,
        city,
      });
      if (lat !== undefined && lng !== undefined) {
        params.append('lat', String(lat));
        params.append('lng', String(lng));
      }

      const res = await fetch(`/api/places/discover?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load places (${res.status})`);
      }
      const data = await res.json();
      setPlaces(data.places || []);
    } catch (err: any) {
      console.error('Error fetching discover places:', err);
      setError('Unable to fetch live places right now. Please check your network connection.');
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCity) {
      fetchPlaces(activeCategory, selectedCity);
    }
  }, [activeCategory, selectedCity]);

  const handleToggleBookmark = (place: PlaceItem) => {
    const isSaved = journey.savedPlaces?.some((p) => p.id === place.id || (p.name === place.name && p.address === place.address));
    let updatedSaved: SavedPlace[];

    if (isSaved) {
      updatedSaved = (journey.savedPlaces || []).filter(
        (p) => !(p.id === place.id || (p.name === place.name && p.address === place.address))
      );
      setActionSuccess(`Removed ${place.name} from saved places`);
    } else {
      const newSaved: SavedPlace = {
        id: place.id || `place-${Date.now()}`,
        name: place.name,
        category: place.category,
        address: place.address,
        rating: place.rating,
        priceLevel: place.priceLevel,
        phone: place.phone,
        website: place.website,
        lat: place.lat,
        lng: place.lng,
        savedAt: new Date().toISOString(),
      };
      updatedSaved = [...(journey.savedPlaces || []), newSaved];
      setActionSuccess(`Saved ${place.name} to journey!`);
    }

    const updatedJourney = {
      ...journey,
      savedPlaces: updatedSaved,
    };
    travelStorage.saveJourney(updatedJourney);
    onUpdateJourney(updatedJourney);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleAddToItinerary = (place: PlaceItem, dayIndex: number) => {
    const itinerary = journey.itinerary || [];
    if (!itinerary[dayIndex]) {
      return;
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      name: place.name,
      startTime: '14:00',
      endTime: '16:00',
      location: place.address || selectedCity,
      description: `${place.category.toUpperCase()} • ${place.address || ''}`,
    };

    const updatedItinerary = itinerary.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          activities: [...(day.activities || []), newActivity],
        };
      }
      return day;
    });

    const updatedJourney = {
      ...journey,
      itinerary: updatedItinerary,
    };

    travelStorage.saveJourney(updatedJourney);
    onUpdateJourney(updatedJourney);
    setAddingToDay(null);
    setActionSuccess(`Added "${place.name}" to Day ${dayIndex + 1}!`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const filteredPlaces = places.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      p.amenities?.some((a) => a.toLowerCase().includes(q))
    );
  });

  const savedPlacesList = journey.savedPlaces || [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                CURATED SPATIAL DISCOVERY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="font-instrument text-3xl sm:text-4xl text-black">
              Discover Stays, Dining & Experiences
            </h2>
            <p className="text-sm font-inter text-[#6F6F6F] mt-1">
              Live location-based recommendations matched to your journey's destinations.
            </p>
          </div>

          {/* City Selector */}
          {availableCities.length > 0 && (
            <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-1.5 self-start md:self-auto">
              <MapPin className="w-4 h-4 text-[#6F6F6F] ml-2" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-mono text-black font-semibold pr-4 py-1.5 focus:outline-none cursor-pointer"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notifications / Toast */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono text-emerald-800 flex items-center gap-2 animate-fade-rise">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-100">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && !showOnlySaved;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setShowOnlySaved(false);
                  setActiveCategory(cat.id);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-mono flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-[#FAF8F5] text-[#6F6F6F] hover:text-black border border-[#E7E5E2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}

          {/* Saved Tab */}
          <button
            type="button"
            onClick={() => setShowOnlySaved(true)}
            className={`px-4 py-2.5 rounded-full text-xs font-mono flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ml-auto ${
              showOnlySaved
                ? 'bg-black text-white shadow-sm'
                : 'bg-[#FAF8F5] text-[#6F6F6F] hover:text-black border border-[#E7E5E2]'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved ({savedPlacesList.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        {!showOnlySaved && (
          <div className="relative">
            <Search className="w-4 h-4 text-[#6F6F6F] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeCategory}s in ${selectedCity}...`}
              className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl pl-11 pr-4 py-3 text-sm text-black placeholder:text-[#6F6F6F] focus:outline-none focus:border-black transition-colors"
            />
          </div>
        )}
      </div>

      {/* Content Area */}
      {showOnlySaved ? (
        /* SAVED PLACES VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-instrument text-2xl text-black">
              Bookmarked Places for this Journey ({savedPlacesList.length})
            </h3>
          </div>

          {savedPlacesList.length === 0 ? (
            <div className="bg-white border border-[#E7E5E2] rounded-3xl p-12 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-neutral-300 mx-auto" />
              <h4 className="font-instrument text-2xl text-black">No bookmarked places yet</h4>
              <p className="text-xs font-mono text-[#6F6F6F] max-w-md mx-auto">
                Explore hotels, restaurants, clubs, and attractions in the discovery tabs above and click the bookmark icon to save them to your trip.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPlacesList.map((place) => (
                <div
                  key={place.id}
                  className="bg-white border border-[#E7E5E2] rounded-3xl p-5 hover:border-black transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-neutral-100 text-[#6F6F6F]">
                        {place.category}
                      </span>
                      {place.rating && (
                        <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h4 className="font-instrument text-2xl text-black leading-tight">
                      {place.name}
                    </h4>
                    <p className="text-xs font-inter text-[#6F6F6F] line-clamp-2">
                      {place.address}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${place.name} ${place.address}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-black hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleToggleBookmark(place as any)}
                      className="px-3 py-1.5 rounded-full bg-red-50 text-red-700 hover:bg-red-100 text-xs font-mono cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* LIVE PLACES LIST */
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-[#E7E5E2] rounded-3xl p-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-black animate-spin mx-auto" />
              <p className="text-xs font-mono text-[#6F6F6F]">
                Discovering authentic {activeCategory}s in {selectedCity}...
              </p>
            </div>
          ) : error ? (
            <div className="bg-white border border-red-200 rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm font-inter text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => fetchPlaces(activeCategory, selectedCity)}
                className="px-4 py-2 bg-black text-white text-xs font-mono rounded-full hover:bg-neutral-800"
              >
                Retry Search
              </button>
            </div>
          ) : filteredPlaces.length === 0 ? (
            <div className="bg-white border border-[#E7E5E2] rounded-3xl p-12 text-center space-y-3">
              <Compass className="w-8 h-8 text-neutral-300 mx-auto" />
              <h4 className="font-instrument text-2xl text-black">No {activeCategory}s found</h4>
              <p className="text-xs font-mono text-[#6F6F6F]">
                Try adjusting your search query or selecting a different destination city.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaces.map((place) => {
                const isBookmarked = journey.savedPlaces?.some(
                  (p) => p.id === place.id || (p.name === place.name && p.address === place.address)
                );

                return (
                  <div
                    key={place.id}
                    className="bg-white border border-[#E7E5E2] rounded-3xl p-5 hover:border-black transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#E7E5E2] text-black font-semibold">
                          {place.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {place.rating && (
                            <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {place.rating.toFixed(1)}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(place)}
                            className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                              isBookmarked
                                ? 'bg-amber-50 border-amber-300 text-amber-600'
                                : 'bg-[#FAF8F5] border-[#E7E5E2] text-neutral-400 hover:text-black'
                            }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark place'}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-instrument text-2xl text-black leading-tight">
                          {place.name}
                        </h4>
                        <p className="text-xs font-inter text-[#6F6F6F] line-clamp-2 mt-1">
                          {place.address}
                        </p>
                      </div>

                      {/* Amenities or tags */}
                      {place.amenities && place.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {place.amenities.slice(0, 3).map((a, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-[#6F6F6F]"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-neutral-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${place.name} ${place.address}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#6F6F6F]" />
                          <span>Map & Directions</span>
                        </a>

                        {place.website && (
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6F6F6F] hover:text-black flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>

                      {/* Add to day Itinerary */}
                      {journey.itinerary && journey.itinerary.length > 0 && (
                        <div className="pt-1">
                          {addingToDay?.place.id === place.id ? (
                            <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl p-2 space-y-1.5 animate-fade-rise">
                              <span className="text-[10px] font-mono text-[#6F6F6F] block">
                                SELECT ITINERARY DAY:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {journey.itinerary.map((day, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleAddToItinerary(place, idx)}
                                    className="px-2.5 py-1 bg-black text-white text-[10px] font-mono rounded hover:bg-neutral-800 cursor-pointer"
                                  >
                                    Day {idx + 1} ({day.city || 'Trip'})
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => setAddingToDay(null)}
                                  className="px-2 py-1 text-[10px] font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAddingToDay({ place, dayIndex: 0 })}
                              className="w-full py-1.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add to Day Itinerary</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
