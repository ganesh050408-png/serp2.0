import React, { useState, useEffect, useMemo } from 'react';
import {
  Bike,
  Plane,
  ArrowRight,
  ArrowLeft,
  Check,
  Compass,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { travelStorage, StoredJourney, StoredTransportItem } from '../../services/travelStorage';
import { searchFlights, SanitizedFlight } from '../../services/flightService';
import { resolveAirportCode } from '../../services/airportCodes';

interface TransportationStudioProps {
  onOpenTrainExperience?: () => void;
  onNavigate?: (path: string) => void;
  initialJourneyId?: string;
  currentJourney?: StoredJourney | null;
  journeys?: StoredJourney[];
}

type TransportMode =
  | 'decision'
  | 'bike_search'
  | 'bike_results'
  | 'bike_summary'
  | 'flight_search'
  | 'flight_results'
  | 'flight_summary';

interface BikeItem {
  id: string;
  name: string;
  type: 'Cruiser' | 'Adventure' | 'Classic Scooter' | 'Electric';
  engine: string;
  dailyRate: number;
  securityDeposit: string;
  features: string[];
  image: string;
  location: string;
  available: boolean;
}

const AVAILABLE_BIKES: BikeItem[] = [
  {
    id: 'bike-1',
    name: 'Royal Enfield Hunter 350',
    type: 'Cruiser',
    engine: '349cc · 20.2 bhp',
    dailyRate: 850,
    securityDeposit: '₹2,000 (Refundable)',
    features: ['2 DOT Helmets included', 'Unlimited KM', 'Phone mount & USB charger'],
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
    location: 'Panaji Latin Quarter & Baga Hub',
    available: true,
  },
  {
    id: 'bike-2',
    name: 'Royal Enfield Himalayan 450',
    type: 'Adventure',
    engine: '452cc · Liquid-cooled',
    dailyRate: 1400,
    securityDeposit: '₹3,500 (Refundable)',
    features: ['Dual-channel ABS', 'Pannier mounts', 'Tripper TFT navigation'],
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
    location: 'Goa Mopa Airport & North Promontory',
    available: true,
  },
  {
    id: 'bike-3',
    name: 'Vespa Elegante 150',
    type: 'Classic Scooter',
    engine: '149cc · Automatic',
    dailyRate: 600,
    securityDeposit: '₹1,500 (Refundable)',
    features: ['Lightweight alloy body', 'Under-seat storage', 'Artisan leather seat'],
    image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?q=80&w=800&auto=format&fit=crop',
    location: 'Fontainhas & Assagao Boutiques',
    available: true,
  },
  {
    id: 'bike-4',
    name: 'Ather 450X Gen 3 (EV)',
    type: 'Electric',
    engine: '3.7 kWh · 150 km Range',
    dailyRate: 550,
    securityDeposit: '₹1,500 (Refundable)',
    features: ['Zero emissions · Silent ride', 'Google Maps onboard', 'Fast charging in 45 min'],
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0ec62192?q=80&w=800&auto=format&fit=crop',
    location: 'Panaji Smart City Hub',
    available: true,
  },
];

// Helper to get formatted date string (YYYY-MM-DD)
function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export const TransportationStudio: React.FC<TransportationStudioProps> = ({
  onOpenTrainExperience,
  onNavigate,
  initialJourneyId,
  currentJourney: propJourney,
  journeys: propJourneys,
}) => {
  const [flow, setFlow] = useState<TransportMode>('decision');

  // Journey context
  const activeJourneys = useMemo(() => {
    if (propJourneys && propJourneys.length > 0) return propJourneys;
    return travelStorage.getJourneys();
  }, [propJourneys]);

  const activeCurrentJourney = useMemo(() => {
    if (propJourney) return propJourney;
    if (initialJourneyId) {
      return activeJourneys.find((j) => j.id === initialJourneyId) || activeJourneys[0] || null;
    }
    return activeJourneys[0] || null;
  }, [propJourney, initialJourneyId, activeJourneys]);

  // Extract cities from current journey for automatic flight segment population
  const journeyCities = useMemo<string[]>(() => {
    if (!activeCurrentJourney) return [];
    if (activeCurrentJourney.destinations && activeCurrentJourney.destinations.length > 0) {
      return activeCurrentJourney.destinations.map((d) => d.city);
    }
    if (activeCurrentJourney.destination) {
      return activeCurrentJourney.destination
        .split(/[·•,\-\/>]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (activeCurrentJourney.city) {
      return [activeCurrentJourney.city];
    }
    return [];
  }, [activeCurrentJourney]);

  // Generate journey flight segments (e.g. Ahmedabad → Mumbai, Mumbai → Goa)
  const journeySegments = useMemo(() => {
    const list: Array<{ label: string; from: string; to: string }> = [];
    if (journeyCities.length >= 2) {
      for (let i = 0; i < journeyCities.length - 1; i++) {
        list.push({
          label: `${journeyCities[i]} → ${journeyCities[i + 1]}`,
          from: journeyCities[i],
          to: journeyCities[i + 1],
        });
      }
      if (journeyCities.length > 2) {
        list.push({
          label: `Full: ${journeyCities[0]} → ${journeyCities[journeyCities.length - 1]}`,
          from: journeyCities[0],
          to: journeyCities[journeyCities.length - 1],
        });
      }
    } else if (journeyCities.length === 1) {
      list.push({
        label: `${journeyCities[0]} Flight`,
        from: journeyCities[0],
        to: 'Goa',
      });
    }
    return list;
  }, [journeyCities]);

  // Bike search state
  const [pickupLocation, setPickupLocation] = useState('Panaji, Goa');
  const [returnLocation, setReturnLocation] = useState('Panaji, Goa');
  const [pickupDate, setPickupDate] = useState(() => getFutureDate(7));
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState(() => getFutureDate(10));
  const [returnTime, setReturnTime] = useState('18:00');
  const [bikeTypeFilter, setBikeTypeFilter] = useState('All');
  const [selectedBike, setSelectedBike] = useState<BikeItem | null>(null);

  // Flight search state (dynamically populated from current journey)
  const [flightType, setFlightType] = useState<'round' | 'oneway'>('oneway');
  const [flightFrom, setFlightFrom] = useState<string>('Ahmedabad');
  const [flightTo, setFlightTo] = useState<string>('Goa');
  const [flightDepartDate, setFlightDepartDate] = useState<string>(() => getFutureDate(14));
  const [flightReturnDate, setFlightReturnDate] = useState<string>(() => getFutureDate(21));
  const [flightTravelers, setFlightTravelers] = useState<number>(2);
  const [flightClass, setFlightClass] = useState<string>('Economy');

  // Real SerpApi search results state (NO fake/demo data)
  const [liveFlights, setLiveFlights] = useState<SanitizedFlight[]>([]);
  const [isSearchingFlights, setIsSearchingFlights] = useState<boolean>(false);
  const [flightSearchError, setFlightSearchError] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<SanitizedFlight | null>(null);
  const [passengerName, setPassengerName] = useState('Traveler');
  const [passengerEmail, setPassengerEmail] = useState('traveler@aethera.luxury');

  // Success toast notification state
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Auto-populate initial flight fields whenever active journey changes
  useEffect(() => {
    if (journeyCities.length >= 2) {
      setFlightFrom(journeyCities[0]);
      setFlightTo(journeyCities[1]);
    } else if (journeyCities.length === 1) {
      setFlightFrom(journeyCities[0]);
      setFlightTo('Goa');
    }

    if (activeCurrentJourney?.startDate) {
      setFlightDepartDate(activeCurrentJourney.startDate);
    }
    if (activeCurrentJourney?.endDate) {
      setFlightReturnDate(activeCurrentJourney.endDate);
    }
    if (activeCurrentJourney?.travelers) {
      setFlightTravelers(activeCurrentJourney.travelers);
    } else if (activeCurrentJourney?.travellersBreakdown?.adults) {
      setFlightTravelers(activeCurrentJourney.travellersBreakdown.adults);
    }
  }, [activeCurrentJourney, journeyCities]);

  // Execute Real SerpApi Google Flights Search (Triggered ONLY on form submit)
  const handleExecuteFlightSearch = async () => {
    setIsSearchingFlights(true);
    setFlightSearchError(null);
    setLiveFlights([]);
    setFlow('flight_results');

    const res = await searchFlights({
      from: flightFrom,
      to: flightTo,
      departureDate: flightDepartDate,
      returnDate: flightType === 'round' ? flightReturnDate : undefined,
      tripType: flightType,
      adults: flightTravelers,
      travelClass: flightClass as any,
      currency: 'INR',
    });

    setIsSearchingFlights(false);
    if (res.success) {
      setLiveFlights(res.flights);
      if (res.flights.length === 0) {
        setFlightSearchError(null);
      }
    } else {
      setFlightSearchError(res.error || 'Unable to find flights right now.');
    }
  };

  // Bike Filter
  const filteredBikes = AVAILABLE_BIKES.filter((b) => {
    if (bikeTypeFilter === 'All') return true;
    return b.type.toLowerCase().includes(bikeTypeFilter.toLowerCase());
  });

  // Calculate rental duration in days
  const rentalDays = Math.max(
    1,
    Math.ceil(
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / (1000 * 60 * 60 * 24)
    ) || 3
  );

  // Save Bike to Journey
  const handleSaveBikeToJourney = () => {
    if (!selectedBike) return;
    const totalCost = selectedBike.dailyRate * rentalDays;
    const transportItem: StoredTransportItem = {
      id: `bike_${Date.now()}`,
      type: 'bike',
      title: `${selectedBike.name} Rental`,
      subtitle: `${rentalDays} Days · ${selectedBike.type}`,
      route: `${pickupLocation} ⟷ ${returnLocation}`,
      dates: `${pickupDate} → ${returnDate}`,
      cost: `₹${totalCost.toLocaleString()}`,
      details: `${selectedBike.features.join(' · ')}`,
      createdAt: new Date().toISOString(),
    };

    if (activeCurrentJourney) {
      travelStorage.addTransportToJourney(activeCurrentJourney.id, transportItem);
    }
    setSavedSuccessMsg(`✓ ${selectedBike.name} rental saved to your ${activeCurrentJourney?.destination || 'Trip'} journey!`);
    setTimeout(() => {
      setSavedSuccessMsg(null);
      setFlow('decision');
    }, 2500);
  };

  // Save Flight to Journey
  const handleSaveFlightToJourney = () => {
    if (!selectedFlight) return;
    const totalCost = selectedFlight.price * flightTravelers;
    const transportItem: StoredTransportItem = {
      id: `flight_${Date.now()}`,
      type: 'flight',
      title: `${selectedFlight.airline} (${selectedFlight.flightNumber})`,
      subtitle: `${selectedFlight.travelClass} · ${flightTravelers} Traveler${flightTravelers > 1 ? 's' : ''}`,
      route: `${selectedFlight.from} (${selectedFlight.fromCode}) → ${selectedFlight.to} (${selectedFlight.toCode})`,
      dates: `${flightDepartDate} · ${selectedFlight.departureTime} → ${selectedFlight.arrivalTime}`,
      cost: `₹${totalCost.toLocaleString()}`,
      details: `${selectedFlight.duration} · ${selectedFlight.stops} · ${selectedFlight.baggage || 'Standard'}`,
      createdAt: new Date().toISOString(),
    };

    if (activeCurrentJourney) {
      travelStorage.addTransportToJourney(activeCurrentJourney.id, transportItem);
    }
    setSavedSuccessMsg(`✓ ${selectedFlight.airline} flight saved to your ${activeCurrentJourney?.destination || 'Trip'} journey!`);
    setTimeout(() => {
      setSavedSuccessMsg(null);
      setFlow('decision');
    }, 2500);
  };

  return (
    <section id="transit-rentals" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      {/* Toast Notification */}
      {savedSuccessMsg && (
        <div className="fixed top-8 right-8 z-50 bg-black text-white px-6 py-4 rounded-2xl shadow-2xl font-mono text-xs flex items-center justify-between gap-4 animate-fade-rise border border-neutral-700">
          <div className="flex items-center gap-3">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedSuccessMsg}</span>
          </div>
          {onNavigate && activeCurrentJourney && (
            <button
              type="button"
              onClick={() => onNavigate(`/journey/${activeCurrentJourney.id}`)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] underline underline-offset-2 cursor-pointer transition-colors"
            >
              View in Journey →
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 1: DECISION SCREEN (The Choice Cards)
      ========================================================================= */}
      {flow === 'decision' && (
        <div className="animate-fade-rise">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block">
                TRANSPORTATION & MOBILITY
              </span>
              {activeCurrentJourney && (
                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full">
                  {activeCurrentJourney.destination}
                </span>
              )}
            </div>
            <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
              Move with purpose.
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-lg">
              Choose your travel experience: local two-wheeler freedom or live SerpApi Google Flights search synchronized with your journey.
            </p>
          </div>

          {/* 2 Primary Choice Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CARD 1: RENT A BIKE */}
            <div
              onClick={() => setFlow('bike_search')}
              className="group bg-[#FFFFFF] border border-[#E8E6E2] hover:border-black rounded-[28px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] flex items-center justify-center text-black mb-8 group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <Bike className="w-7 h-7 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-instrument text-4xl text-[#000000] leading-none mb-3">
                  Rent a Bike
                </h3>
                <p className="text-base text-[#000000] font-inter font-medium leading-snug mb-2">
                  Explore your destination freely with a bike or scooter.
                </p>
                <p className="text-xs text-[#6F6F6F] font-inter leading-relaxed">
                  Perfect for local exploration, coastal rides, and short-distance travel.
                </p>
              </div>

              <div className="pt-8 mt-6 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#6F6F6F]">
                  Cruisers · Scooters · EVs
                </span>
                <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#000000] text-white text-xs font-medium group-hover:bg-neutral-800 transition-all">
                  <span>Rent a Bike</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* CARD 2: BOOK A FLIGHT (Live SerpApi Google Flights Search) */}
            <div
              onClick={() => setFlow('flight_search')}
              className="group bg-[#FFFFFF] border border-[#E8E6E2] hover:border-black rounded-[28px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] flex items-center justify-center text-black mb-8 group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <Plane className="w-7 h-7 transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-instrument text-4xl text-[#000000] leading-none mb-3">
                  Book a Flight
                </h3>
                <p className="text-base text-[#000000] font-inter font-medium leading-snug mb-2">
                  Live Google Flights search powered by SerpApi.
                </p>
                <p className="text-xs text-[#6F6F6F] font-inter leading-relaxed">
                  Real airline schedules, transparent pricing, and instant booking links connected to your journey.
                </p>
              </div>

              <div className="pt-8 mt-6 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#6F6F6F]">
                  {journeySegments.length > 0 ? journeySegments[0].label : 'Domestic & International'}
                </span>
                <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#000000] text-white text-xs font-medium group-hover:bg-neutral-800 transition-all">
                  <span>Book Flight</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Train Experience Link */}
          {onOpenTrainExperience && (
            <div className="mt-8 p-6 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E7E5E2] flex items-center justify-center text-black shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-instrument text-2xl text-black">Scenic Rail Journeys</h4>
                  <p className="text-xs text-[#6F6F6F] font-inter">Explore heritage rail connections and scenic luxury train routes.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenTrainExperience}
                className="px-5 py-2.5 rounded-full border border-neutral-300 hover:border-black text-xs font-mono text-black transition-all cursor-pointer whitespace-nowrap"
              >
                Explore Trains →
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: BIKE SEARCH FLOW
      ========================================================================= */}
      {flow === 'bike_search' && (
        <div className="max-w-3xl mx-auto animate-fade-rise">
          <button
            type="button"
            onClick={() => setFlow('decision')}
            className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TRANSPORT OPTIONS</span>
          </button>

          <div className="bg-white border border-[#E8E6E2] rounded-[32px] p-8 sm:p-12 shadow-sm">
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
              BIKE & SCOOTER SEARCH
            </span>
            <h2 className="font-instrument text-4xl sm:text-5xl text-black leading-none mb-3">
              Rent a Bike in {journeyCities[0] || 'Goa'}
            </h2>
            <p className="text-sm text-[#6F6F6F] font-inter mb-8">
              Select your pickup dates and location for premium cruiser and scooter rentals.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFlow('bike_results');
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1.5">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1.5">
                    Return Location
                  </label>
                  <input
                    type="text"
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Pickup Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    />
                    <input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Return Date & Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    />
                    <input
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
                >
                  <span>Search Available Bikes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: BIKE RESULTS
      ========================================================================= */}
      {flow === 'bike_results' && (
        <div className="max-w-4xl mx-auto animate-fade-rise">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <button
              type="button"
              onClick={() => setFlow('bike_search')}
              className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EDIT SEARCH</span>
            </button>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {['All', 'Cruiser', 'Adventure', 'Classic Scooter', 'Electric'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBikeTypeFilter(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all cursor-pointer ${
                    bikeTypeFilter === cat
                      ? 'bg-black text-white font-semibold shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-[#6F6F6F]">
              {filteredBikes.length} available vehicles for {rentalDays} days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredBikes.map((bike) => (
              <div
                key={bike.id}
                className="bg-white border border-[#E8E6E2] rounded-3xl overflow-hidden hover:border-black transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-neutral-100">
                  <img src={bike.image} alt={bike.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono font-medium text-black">
                    {bike.type}
                  </span>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-instrument text-2xl text-black mb-1">{bike.name}</h3>
                    <span className="text-xs font-mono text-neutral-500 block mb-3">{bike.engine}</span>
                    <ul className="space-y-1 mb-4">
                      {bike.features.map((f, i) => (
                        <li key={i} className="text-xs text-[#6F6F6F] flex items-center gap-1.5 font-inter">
                          <Check className="w-3 h-3 text-neutral-400" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Daily Rate</span>
                      <span className="font-instrument text-2xl text-black">₹{bike.dailyRate}</span>
                      <span className="text-[10px] text-neutral-400 font-mono ml-1">/ day</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBike(bike);
                        setFlow('bike_summary');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: BIKE SUMMARY
      ========================================================================= */}
      {flow === 'bike_summary' && selectedBike && (
        <div className="max-w-2xl mx-auto animate-fade-rise">
          <button
            type="button"
            onClick={() => setFlow('bike_results')}
            className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO BIKE LIST</span>
          </button>

          <div className="bg-white border border-[#E8E6E2] rounded-[32px] p-8 sm:p-12 shadow-sm space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block">
              RENTAL SUMMARY
            </span>
            <h3 className="font-instrument text-4xl text-black leading-tight">
              {selectedBike.name}
            </h3>

            <div className="grid grid-cols-2 gap-4 p-5 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Duration</span>
                <span className="font-bold text-black">{rentalDays} Days</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Dates</span>
                <span className="font-bold text-black">{pickupDate} → {returnDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Deposit</span>
                <span className="font-bold text-black">{selectedBike.securityDeposit}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Total Cost</span>
                <span className="font-instrument text-2xl text-black">
                  ₹{(selectedBike.dailyRate * rentalDays).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setFlow('bike_results')}
                className="text-xs font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
              >
                Change Bike
              </button>

              <button
                type="button"
                onClick={handleSaveBikeToJourney}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Save Rental to Journey</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: FLIGHT SEARCH FLOW (Connected to CURRENT Journey)
      ========================================================================= */}
      {flow === 'flight_search' && (
        <div className="max-w-3xl mx-auto animate-fade-rise">
          <button
            type="button"
            onClick={() => setFlow('decision')}
            className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO TRANSPORT OPTIONS</span>
          </button>

          <div className="bg-white border border-[#E8E6E2] rounded-[32px] p-8 sm:p-12 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block">
                LIVE FLIGHT SEARCH · GOOGLE FLIGHTS
              </span>
              {activeCurrentJourney && (
                <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full">
                  Trip: {activeCurrentJourney.destination}
                </span>
              )}
            </div>

            <h2 className="font-instrument text-4xl sm:text-5xl text-black leading-none mb-3">
              Search Flights
            </h2>
            <p className="text-sm text-[#6F6F6F] font-inter mb-6">
              Find live airline prices and direct schedules via SerpApi Google Flights.
            </p>

            {/* Quick Segment Selector Pills from Current Journey */}
            {journeySegments.length > 0 && (
              <div className="mb-8 p-4 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl">
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block mb-2 font-semibold">
                  JOURNEY ROUTE SEGMENTS:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {journeySegments.map((seg, idx) => {
                    const isSelected = flightFrom === seg.from && flightTo === seg.to;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFlightFrom(seg.from);
                          setFlightTo(seg.to);
                        }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-sm font-semibold'
                            : 'bg-white text-neutral-700 border border-neutral-200 hover:border-black'
                        }`}
                      >
                        ✈ {seg.label}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setFlightFrom('');
                      setFlightTo('');
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-mono text-neutral-500 hover:text-black border border-dashed border-neutral-300 hover:border-black transition-all cursor-pointer"
                  >
                    Custom Route +
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteFlightSearch();
              }}
              className="space-y-6"
            >
              {/* Trip Type */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFlightType('oneway')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-all ${
                    flightType === 'oneway'
                      ? 'bg-black text-white'
                      : 'bg-[#FAF8F5] text-[#6F6F6F] border border-[#E7E5E2]'
                  }`}
                >
                  One Way
                </button>
                <button
                  type="button"
                  onClick={() => setFlightType('round')}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono cursor-pointer transition-all ${
                    flightType === 'round'
                      ? 'bg-black text-white'
                      : 'bg-[#FAF8F5] text-[#6F6F6F] border border-[#E7E5E2]'
                  }`}
                >
                  Round Trip
                </button>
              </div>

              {/* From / To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1.5">
                    From (City or Airport Code)
                  </label>
                  <div className="relative">
                    <Plane className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={flightFrom}
                      onChange={(e) => setFlightFrom(e.target.value)}
                      placeholder="e.g. Ahmedabad (AMD)"
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                      required
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                    IATA Code: {resolveAirportCode(flightFrom) || '---'}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1.5">
                    To (City or Airport Code)
                  </label>
                  <div className="relative">
                    <Plane className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={flightTo}
                      onChange={(e) => setFlightTo(e.target.value)}
                      placeholder="e.g. Goa (GOI)"
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                      required
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                    IATA Code: {resolveAirportCode(flightTo) || '---'}
                  </span>
                </div>
              </div>

              {/* Dates & Travelers & Class */}
              <div className={`grid grid-cols-1 ${flightType === 'round' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={flightDepartDate}
                    onChange={(e) => setFlightDepartDate(e.target.value)}
                    required
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>

                {flightType === 'round' && (
                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={flightReturnDate}
                      onChange={(e) => setFlightReturnDate(e.target.value)}
                      required
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Passengers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9"
                    value={flightTravelers}
                    onChange={(e) => setFlightTravelers(Number(e.target.value) || 1)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Cabin Class
                  </label>
                  <select
                    value={flightClass}
                    onChange={(e) => setFlightClass(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none focus:border-black cursor-pointer font-inter"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#6F6F6F]">
                  Querying live SerpApi Google Flights API
                </span>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-md"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Flights</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: FLIGHT RESULTS (Real SerpApi Data, No Fake Fallback)
      ========================================================================= */}
      {flow === 'flight_results' && (
        <div className="max-w-4xl mx-auto animate-fade-rise">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <button
              type="button"
              onClick={() => setFlow('flight_search')}
              className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EDIT SEARCH ({flightFrom} → {flightTo})</span>
            </button>

            {!isSearchingFlights && !flightSearchError && liveFlights.length > 0 && (
              <span className="text-xs font-mono text-[#6F6F6F] bg-neutral-100 px-3 py-1 rounded-full">
                {liveFlights.length} live flight options found · Google Flights
              </span>
            )}
          </div>

          {/* 1. LOADING STATE */}
          {isSearchingFlights && (
            <div className="bg-white border border-[#E8E6E2] rounded-[32px] p-12 text-center shadow-sm space-y-6">
              <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-black animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-black stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-instrument text-3xl sm:text-4xl text-black mb-2">
                  Searching available flights…
                </h3>
                <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter max-w-md mx-auto">
                  Connecting to SerpApi Google Flights for <span className="font-semibold text-black">{flightFrom}</span> ({resolveAirportCode(flightFrom)}) → <span className="font-semibold text-black">{flightTo}</span> ({resolveAirportCode(flightTo)}) on {flightDepartDate}.
                </p>
              </div>

              {/* Skeleton place-holder pulses */}
              <div className="space-y-3 max-w-lg mx-auto pt-4">
                <div className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-neutral-50 rounded-2xl animate-pulse" />
              </div>
            </div>
          )}

          {/* 2. ERROR STATE (NO fake fallback) */}
          {!isSearchingFlights && flightSearchError && (
            <div className="bg-white border border-red-200 rounded-[32px] p-10 sm:p-12 text-center shadow-sm space-y-5">
              <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-instrument text-3xl sm:text-4xl text-black mb-2">
                  Unable to find flights right now.
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-inter max-w-md mx-auto mb-2">
                  {flightSearchError}
                </p>
                <p className="text-[11px] font-mono text-neutral-400 max-w-md mx-auto">
                  Check your origin, destination airport codes, and departure date or configure SERPAPI_KEY in backend .env.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFlow('flight_search')}
                  className="px-6 py-2.5 rounded-full border border-neutral-300 text-xs font-mono text-black hover:border-black cursor-pointer transition-colors"
                >
                  Edit Search
                </button>
                <button
                  type="button"
                  onClick={handleExecuteFlightSearch}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 cursor-pointer transition-all shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try again</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. EMPTY STATE (0 flights found) */}
          {!isSearchingFlights && !flightSearchError && liveFlights.length === 0 && (
            <div className="bg-white border border-[#E8E6E2] rounded-[32px] p-10 sm:p-12 text-center shadow-sm space-y-5">
              <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-600">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-instrument text-3xl sm:text-4xl text-black mb-2">
                  No flights found for this route and date.
                </h3>
                <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter max-w-md mx-auto">
                  No scheduled flights were returned for <span className="font-semibold text-black">{flightFrom} → {flightTo}</span> on {flightDepartDate}. Try adjusting your departure date or neighboring airports.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setFlow('flight_search')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 cursor-pointer transition-all shadow-sm"
                >
                  <span>Modify Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 4. REAL FLIGHT RESULTS LIST */}
          {!isSearchingFlights && !flightSearchError && liveFlights.length > 0 && (
            <div className="space-y-4">
              {liveFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-white border border-[#E8E6E2] hover:border-black rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 shadow-xs hover:shadow-md"
                >
                  {/* Airline & Timings */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {flight.airlineLogo ? (
                        <img
                          src={flight.airlineLogo}
                          alt={flight.airline}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Plane className="w-6 h-6 text-black" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-black text-sm">{flight.airline}</span>
                        <span className="text-[10px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                          {flight.flightNumber}
                        </span>
                        {flight.isBest && (
                          <span className="text-[10px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Best Value
                          </span>
                        )}
                        {flight.airplane && (
                          <span className="text-[10px] font-mono text-neutral-400">
                            {flight.airplane}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2">
                        <div>
                          <span className="font-instrument text-2xl text-black block leading-none">
                            {flight.departureTime}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-neutral-700 block mt-0.5">
                            {flight.fromCode}
                          </span>
                          <span className="text-[10px] font-mono text-[#8F8F8F] line-clamp-1 max-w-[120px]">
                            {flight.from}
                          </span>
                        </div>

                        <div className="text-center px-2 shrink-0">
                          <span className="text-[10px] font-mono text-[#6F6F6F] block">
                            {flight.duration}
                          </span>
                          <div className="w-20 h-[1px] bg-neutral-300 mx-auto my-1.5 relative">
                            <div className="w-1.5 h-1.5 rounded-full bg-black absolute -top-0.5 left-1/2 -translate-x-1/2" />
                          </div>
                          <span
                            className={`text-[9px] font-mono ${
                              flight.stopsCount === 0 ? 'text-emerald-700 font-semibold' : 'text-amber-700'
                            }`}
                          >
                            {flight.stops}
                          </span>
                        </div>

                        <div>
                          <span className="font-instrument text-2xl text-black block leading-none">
                            {flight.arrivalTime}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-neutral-700 block mt-0.5">
                            {flight.toCode}
                          </span>
                          <span className="text-[10px] font-mono text-[#8F8F8F] line-clamp-1 max-w-[120px]">
                            {flight.to}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
                        {flight.travelClass}
                      </span>
                      <span className="font-instrument text-3xl text-black">
                        {flight.price > 0 ? `₹${flight.price.toLocaleString('en-IN')}` : 'View Price'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* External Booking Link */}
                      <a
                        href={flight.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-sm hover:scale-105"
                      >
                        <span>View Flight</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Save to Journey Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFlight(flight);
                          setFlow('flight_summary');
                        }}
                        className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono transition-all cursor-pointer"
                        title="Save flight details to current journey"
                      >
                        <span>Save +</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 7: FLIGHT SUMMARY & SAVE TO JOURNEY
      ========================================================================= */}
      {flow === 'flight_summary' && selectedFlight && (
        <div className="max-w-2xl mx-auto animate-fade-rise">
          <button
            type="button"
            onClick={() => setFlow('flight_results')}
            className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO FLIGHT RESULTS</span>
          </button>

          <div className="bg-white border border-[#E8E6E2] rounded-[32px] p-8 sm:p-12 shadow-sm space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block">
              FLIGHT SUMMARY & JOURNEY SYNC
            </span>
            <h3 className="font-instrument text-4xl text-black leading-tight">
              {selectedFlight.airline} {selectedFlight.flightNumber}
            </h3>

            {/* Flight dossier */}
            <div className="grid grid-cols-2 gap-4 p-5 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Route</span>
                <span className="font-bold text-black">{selectedFlight.fromCode} → {selectedFlight.toCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Date & Time</span>
                <span className="font-bold text-black">{flightDepartDate} · {selectedFlight.departureTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Travelers</span>
                <span className="font-bold text-black">{flightTravelers} ({flightClass})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Estimated Price</span>
                <span className="font-instrument text-2xl text-black">
                  {selectedFlight.price > 0 ? `₹${(selectedFlight.price * flightTravelers).toLocaleString('en-IN')}` : 'Check Airline'}
                </span>
              </div>
            </div>

            {/* Passenger Fields */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] block">
                Primary Passenger Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Primary Passenger Name"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-xs text-black font-inter focus:outline-none focus:border-black"
                />
                <input
                  type="email"
                  value={passengerEmail}
                  onChange={(e) => setPassengerEmail(e.target.value)}
                  placeholder="Email for E-ticket sync"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-xs text-black font-inter focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setFlow('flight_results')}
                className="text-xs font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
              >
                Change Flight
              </button>

              <button
                type="button"
                onClick={handleSaveFlightToJourney}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Save to Journey</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
