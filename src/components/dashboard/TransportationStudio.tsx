import React, { useState } from 'react';
import {
  Bike,
  Plane,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Check,
  Compass,
  Train,
} from 'lucide-react';
import { travelStorage, StoredTransportItem } from '../../services/travelStorage';

interface TransportationStudioProps {
  onOpenTrainExperience?: () => void;
  onNavigate?: (path: string) => void;
  initialJourneyId?: string;
}

type TransportMode = 'decision' | 'bike_search' | 'bike_results' | 'bike_summary' | 'flight_search' | 'flight_results' | 'flight_summary';

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

interface FlightItem {
  id: string;
  airline: string;
  flightNumber: string;
  logo: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: string;
  price: number;
  baggage: string;
  class: string;
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

const AVAILABLE_FLIGHTS: FlightItem[] = [
  {
    id: 'flight-1',
    airline: 'Air India',
    flightNumber: 'AI-864',
    logo: '🇮🇳',
    from: 'Goa (GOX)',
    to: 'Mumbai (BOM)',
    departureTime: '08:45 AM',
    arrivalTime: '10:05 AM',
    duration: '1h 20m',
    stops: 'Non-stop',
    price: 3850,
    baggage: '15 kg check-in + 7 kg cabin',
    class: 'Economy',
  },
  {
    id: 'flight-2',
    airline: 'IndiGo',
    flightNumber: '6E-5321',
    logo: '🔵',
    from: 'Mumbai (BOM)',
    to: 'Delhi (DEL)',
    departureTime: '12:30 PM',
    arrivalTime: '02:45 PM',
    duration: '2h 15m',
    stops: 'Non-stop',
    price: 4650,
    baggage: '15 kg check-in + 7 kg cabin',
    class: 'Economy',
  },
  {
    id: 'flight-3',
    airline: 'Vistara',
    flightNumber: 'UK-992',
    logo: '🟣',
    from: 'Delhi (DEL)',
    to: 'Jaipur (JAI)',
    departureTime: '04:15 PM',
    arrivalTime: '05:10 PM',
    duration: '0h 55m',
    stops: 'Non-stop',
    price: 3200,
    baggage: '20 kg check-in + 7 kg cabin',
    class: 'Premium Economy',
  },
];

export const TransportationStudio: React.FC<TransportationStudioProps> = ({
  onOpenTrainExperience,
  onNavigate,
  initialJourneyId,
}) => {
  const [flow, setFlow] = useState<TransportMode>('decision');

  // Journey context
  const activeJourneys = travelStorage.getJourneys();
  const currentJourney = initialJourneyId
    ? activeJourneys.find((j) => j.id === initialJourneyId) || activeJourneys[0]
    : activeJourneys[0];

  // Bike search state
  const [pickupLocation, setPickupLocation] = useState('Panaji, Goa');
  const [returnLocation, setReturnLocation] = useState('Panaji, Goa');
  const [pickupDate, setPickupDate] = useState('2026-06-12');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnDate, setReturnDate] = useState('2026-06-15');
  const [returnTime, setReturnTime] = useState('18:00');
  const [bikeTypeFilter, setBikeTypeFilter] = useState('All');
  const [selectedBike, setSelectedBike] = useState<BikeItem | null>(null);

  // Flight search state
  const [flightType, setFlightType] = useState<'round' | 'oneway'>('oneway');
  const [flightFrom, setFlightFrom] = useState(
    currentJourney?.destinations?.[0]?.city ? `${currentJourney.destinations[0].city} Airport` : 'Goa (GOX)'
  );
  const [flightTo, setFlightTo] = useState(
    currentJourney?.destinations?.[1]?.city ? `${currentJourney.destinations[1].city} (BOM)` : 'Mumbai (BOM)'
  );
  const [flightDepartDate, setFlightDepartDate] = useState(currentJourney?.startDate || '2026-06-12');
  const [flightReturnDate, setFlightReturnDate] = useState(currentJourney?.endDate || '2026-06-21');
  const [flightTravelers, setFlightTravelers] = useState(currentJourney?.travelers || 2);
  const [flightClass, setFlightClass] = useState('Economy');
  const [selectedFlight, setSelectedFlight] = useState<FlightItem | null>(null);
  const [passengerName, setPassengerName] = useState('Aravind S.');
  const [passengerEmail, setPassengerEmail] = useState('aravind@aethera.luxury');

  // Success state
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Live Location Helper
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPickupLocation('Current Location (Panaji Promenade, Goa)');
        },
        () => {
          setPickupLocation('Panaji Latin Quarter, Goa');
        }
      );
    } else {
      setPickupLocation('Panaji Latin Quarter, Goa');
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

    if (currentJourney) {
      travelStorage.addTransportToJourney(currentJourney.id, transportItem);
    }
    setSavedSuccessMsg(`✓ ${selectedBike.name} rental saved to your ${currentJourney?.destination || 'Goa'} journey!`);
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
      subtitle: `${selectedFlight.class} · ${flightTravelers} Travelers`,
      route: `${selectedFlight.from} → ${selectedFlight.to}`,
      dates: `${flightDepartDate} · ${selectedFlight.departureTime} → ${selectedFlight.arrivalTime}`,
      cost: `₹${totalCost.toLocaleString()}`,
      details: `${selectedFlight.duration} · ${selectedFlight.stops} · ${selectedFlight.baggage}`,
      createdAt: new Date().toISOString(),
    };

    if (currentJourney) {
      travelStorage.addTransportToJourney(currentJourney.id, transportItem);
    }
    setSavedSuccessMsg(`✓ ${selectedFlight.airline} flight saved to your ${currentJourney?.destination || 'Goa'} journey!`);
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
          {onNavigate && currentJourney && (
            <button
              type="button"
              onClick={() => onNavigate(`/journey/${currentJourney.id}`)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] underline underline-offset-2 cursor-pointer transition-colors"
            >
              View in Journey →
            </button>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 1: DECISION SCREEN (The Two Large Choice Cards)
      ========================================================================= */}
      {flow === 'decision' && (
        <div className="animate-fade-rise">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-3">
              TRANSPORT & MOBILITY
            </span>
            <h2 className="font-instrument text-5xl sm:text-6xl md:text-7xl text-[#000000] tracking-headline leading-none">
              How would you like to travel?
            </h2>
            <p className="font-inter text-base sm:text-lg text-[#6F6F6F] mt-5 leading-relaxed">
              Choose what you need for your journey. Aethera will help you find the right option and
              keep everything organized in one place.
            </p>

            {/* Scenic Train Window Banner Pill */}
            {onOpenTrainExperience && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenTrainExperience}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 border border-[#E7E5E2] text-xs font-mono text-black transition-all hover:scale-105 cursor-pointer shadow-xs"
                >
                  <Train className="w-3.5 h-3.5 text-neutral-700" />
                  <span>✦ Launch Fullscreen Scenic Train Window (Lumora Experience)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* TWO MAIN CHOICE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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

            {/* CARD 2: BOOK A FLIGHT */}
            <div
              onClick={() => {
                if (onOpenTrainExperience) {
                  // Launch the requested train transition or flight flow
                  setFlow('flight_search');
                } else {
                  setFlow('flight_search');
                }
              }}
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
                  Find and organize flights for your journey.
                </p>
                <p className="text-xs text-[#6F6F6F] font-inter leading-relaxed">
                  Compare travel options and keep your flight details synchronized with your trip.
                </p>
              </div>

              <div className="pt-8 mt-6 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-[#6F6F6F]">
                  Domestic & Regional Routes
                </span>
                <div className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[#000000] text-white text-xs font-medium group-hover:bg-neutral-800 transition-all">
                  <span>Book a Flight</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: BIKE RENTAL SEARCH FLOW
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
              Where do you want to ride?
            </h2>
            <p className="text-sm text-[#6F6F6F] font-inter mb-8">
              Select your pickup details to browse available cruisers, scooters, and adventure bikes.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFlow('bike_results');
              }}
              className="space-y-6"
            >
              {/* Pickup & Return */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono uppercase text-[#6F6F6F]">
                      Pickup Location
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-[10px] font-mono text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Use my current location</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="e.g. Panaji, Goa"
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1.5">
                    Return Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={returnLocation}
                      onChange={(e) => setReturnLocation(e.target.value)}
                      placeholder="Same as pickup"
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Return Time
                  </label>
                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Bike Type Filter */}
              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-2">
                  Vehicle Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Scooter', 'Cruiser', 'Adventure', 'Electric'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBikeTypeFilter(type)}
                      className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        bikeTypeFilter === type
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#6F6F6F] border border-[#E7E5E2] hover:border-black'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-md"
                >
                  <span>Find Bikes</span>
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
        <div className="animate-fade-rise">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <button
              type="button"
              onClick={() => setFlow('bike_search')}
              className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EDIT SEARCH ({pickupLocation})</span>
            </button>
            <span className="text-xs font-mono text-[#6F6F6F]">
              {filteredBikes.length} available two-wheelers for {rentalDays} Days
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBikes.map((bike) => (
              <div
                key={bike.id}
                className="bg-white border border-[#E8E6E2] rounded-[28px] overflow-hidden flex flex-col justify-between hover:border-black transition-all group card-hover-effect shadow-xs"
              >
                <div className="relative h-48 bg-neutral-900 overflow-hidden">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono bg-white/90 backdrop-blur-md text-black font-semibold">
                    {bike.type}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-instrument text-2xl text-black leading-tight mb-1">
                      {bike.name}
                    </h4>
                    <p className="text-xs font-mono text-[#6F6F6F] mb-4">{bike.engine}</p>
                    <div className="space-y-1.5 text-xs text-neutral-600 font-inter mb-4">
                      {bike.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
                        Rate
                      </span>
                      <span className="font-instrument text-2xl text-black">
                        ₹{bike.dailyRate} <span className="text-xs font-mono">/ day</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBike(bike);
                        setFlow('bike_summary');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 bg-black text-white text-xs font-medium hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      <span>Continue</span>
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
          VIEW 4: BIKE RENTAL SUMMARY
      ========================================================================= */}
      {flow === 'bike_summary' && selectedBike && (
        <div className="max-w-2xl mx-auto animate-fade-rise">
          <button
            type="button"
            onClick={() => setFlow('bike_results')}
            className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black mb-8 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO BIKE RESULTS</span>
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
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Pickup Location</span>
                <span className="font-bold text-black">{pickupLocation}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Rental Duration</span>
                <span className="font-bold text-black">{rentalDays} Days ({pickupDate} → {returnDate})</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Daily Rate</span>
                <span className="font-bold text-black">₹{selectedBike.dailyRate} / day</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Estimated Total</span>
                <span className="font-instrument text-2xl text-black">
                  ₹{(selectedBike.dailyRate * rentalDays).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-inter">
              <span className="font-semibold block mb-1">Rental API Integration Notice</span>
              Official payment provider connection coming soon. Confirming will synchronize this
              vehicle reservation directly to your active Aethera journey dossier.
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setFlow('bike_results')}
                className="text-xs font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
              >
                Change Vehicle
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
          VIEW 5: FLIGHT SEARCH FLOW
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
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
              FLIGHT SEARCH
            </span>
            <h2 className="font-instrument text-4xl sm:text-5xl text-black leading-none mb-3">
              Where will you fly?
            </h2>
            <p className="text-sm text-[#6F6F6F] font-inter mb-8">
              Compare regional and domestic flight routes synchronized with your itinerary.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFlow('flight_results');
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
                    From (Airport or City)
                  </label>
                  <div className="relative">
                    <Plane className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={flightFrom}
                      onChange={(e) => setFlightFrom(e.target.value)}
                      placeholder="e.g. Goa (GOX)"
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1.5">
                    To (Airport or City)
                  </label>
                  <div className="relative">
                    <Plane className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={flightTo}
                      onChange={(e) => setFlightTo(e.target.value)}
                      placeholder="e.g. Mumbai (BOM)"
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-black font-inter"
                      required
                    />
                  </div>
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
                      className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black font-mono focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Travelers
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
                    className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2.5 text-xs text-black focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="Economy">Economy</option>
                    <option value="Premium Economy">Premium Economy</option>
                    <option value="Business">Business</option>
                    <option value="First Class">First Class</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-md"
                >
                  <span>Search Flights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 6: FLIGHT RESULTS
      ========================================================================= */}
      {flow === 'flight_results' && (
        <div className="max-w-4xl mx-auto animate-fade-rise">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <button
              type="button"
              onClick={() => setFlow('flight_search')}
              className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] hover:text-black transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>EDIT SEARCH ({flightFrom} → {flightTo})</span>
            </button>
            <span className="text-xs font-mono text-[#6F6F6F]">
              {AVAILABLE_FLIGHTS.length} curated flight connections found
            </span>
          </div>

          <div className="space-y-4">
            {AVAILABLE_FLIGHTS.map((flight) => (
              <div
                key={flight.id}
                className="bg-white border border-[#E8E6E2] hover:border-black rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                {/* Airline & Timings */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-xl shrink-0">
                    {flight.logo}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black text-sm">{flight.airline}</span>
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {flight.flightNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <span className="font-instrument text-2xl text-black block">
                          {flight.departureTime}
                        </span>
                        <span className="text-[10px] font-mono text-[#6F6F6F]">{flight.from}</span>
                      </div>

                      <div className="text-center px-2">
                        <span className="text-[10px] font-mono text-[#6F6F6F] block">
                          {flight.duration}
                        </span>
                        <div className="w-16 h-[1px] bg-neutral-300 mx-auto my-1 relative">
                          <div className="w-1.5 h-1.5 rounded-full bg-black absolute -top-0.5 left-1/2 -translate-x-1/2" />
                        </div>
                        <span className="text-[9px] font-mono text-emerald-700">{flight.stops}</span>
                      </div>

                      <div>
                        <span className="font-instrument text-2xl text-black block">
                          {flight.arrivalTime}
                        </span>
                        <span className="text-[10px] font-mono text-[#6F6F6F]">{flight.to}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Baggage & Price Action */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
                      {flight.baggage}
                    </span>
                    <span className="font-instrument text-3xl text-black">
                      ₹{flight.price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFlight(flight);
                      setFlow('flight_summary');
                    }}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all cursor-pointer shadow-sm hover:scale-105"
                  >
                    <span>Select Flight</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 7: FLIGHT SUMMARY & PASSENGER DETAILS
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
              FLIGHT SUMMARY
            </span>
            <h3 className="font-instrument text-4xl text-black leading-tight">
              {selectedFlight.airline} {selectedFlight.flightNumber}
            </h3>

            {/* Flight dossier */}
            <div className="grid grid-cols-2 gap-4 p-5 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Route</span>
                <span className="font-bold text-black">{selectedFlight.from} → {selectedFlight.to}</span>
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
                <span className="text-[10px] text-[#6F6F6F] uppercase block">Total Price</span>
                <span className="font-instrument text-2xl text-black">
                  ₹{(selectedFlight.price * flightTravelers).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Passenger Fields */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] block">
                Passenger Details
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
                  placeholder="Email for E-ticket"
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-xs text-black font-inter focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-inter">
              <span className="font-semibold block mb-1">Flight Booking Notice</span>
              Flight booking integration is not connected yet. Confirming will store your flight itinerary directly inside your Aethera journey.
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
                <span>Save Flight to Journey</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
