import { useState } from 'react';
import { Bike, Train, ArrowRight, ShieldCheck, MapPin, Check } from 'lucide-react';

interface BikeRental {
  id: string;
  name: string;
  category: 'Cruiser' | 'Adventure' | 'Classic Scooter' | 'Electric EV';
  engine: string;
  dailyRate: string;
  securityDeposit: string;
  features: string[];
  image: string;
  pickupLocations: string[];
  popularFor: string;
  isPopular?: boolean;
}

interface TrainJourney {
  id: string;
  trainName: string;
  trainNumber: string;
  route: string;
  departure: string;
  arrival: string;
  duration: string;
  classes: string[];
  scenicHighlights: string;
  startingFare: string;
  frequency: string;
  status: 'On Time' | 'Seats Available' | 'Fast Filling';
}

const BIKE_RENTALS: BikeRental[] = [
  {
    id: 'bike-1',
    name: 'Royal Enfield Hunter 350',
    category: 'Cruiser',
    engine: '349cc · 20.2 bhp',
    dailyRate: '₹850 / day',
    securityDeposit: '₹2,000 (Refundable)',
    features: ['2 DOT Helmets included', 'Unlimited KM', 'Phone Mount with USB charger', 'Full Tank on delivery'],
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
    pickupLocations: ['Panaji Latin Quarter', 'Baga Jetty', 'Mopa Airport (GOX)', 'Madgaon Junction'],
    popularFor: 'Coastal cruising & Latin Quarter heritage photography',
    isPopular: true,
  },
  {
    id: 'bike-2',
    name: 'Royal Enfield Himalayan 450',
    category: 'Adventure',
    engine: '452cc · Liquid-cooled',
    dailyRate: '₹1,400 / day',
    securityDeposit: '₹3,500 (Refundable)',
    features: ['Dual-channel ABS', 'Pannier mounts', 'Tripper TFT navigation', 'Off-road suspension'],
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
    pickupLocations: ['Panaji Hub', 'Leh Main Bazaar', 'Srinagar Dal Gate', 'Manali Mall'],
    popularFor: 'Ghat ascents, high-altitude passes & rugged coastal hinterlands',
  },
  {
    id: 'bike-3',
    name: 'Vespa Elegante 150',
    category: 'Classic Scooter',
    engine: '149cc · Automatic',
    dailyRate: '₹600 / day',
    securityDeposit: '₹1,500 (Refundable)',
    features: ['Lightweight alloy body', 'Front disc brake', 'Spacious under-seat storage', 'Artisan leather seat'],
    image: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?q=80&w=800&auto=format&fit=crop',
    pickupLocations: ['Fontainhas Panaji', 'Anjuna Flea Market', 'Assagao Boutiques', 'Fort Kochi'],
    popularFor: 'Effortless village exploration, cafe hopping & bakery trails',
    isPopular: true,
  },
  {
    id: 'bike-4',
    name: 'Ather 450X Gen 3 (EV)',
    category: 'Electric EV',
    engine: '3.7 kWh · 150 km Range',
    dailyRate: '₹550 / day',
    securityDeposit: '₹1,500 (Refundable)',
    features: ['Zero emissions · Silent ride', 'Google Maps onboard', 'Fast charging in 45 min', 'Fast-tag enabled'],
    image: 'https://images.unsplash.com/photo-1616422285623-13ff0ec62192?q=80&w=800&auto=format&fit=crop',
    pickupLocations: ['Panaji Smart City Hub', 'Mumbai BKC', 'Bengaluru Indiranagar'],
    popularFor: 'Silent eco-friendly urban journeys & scenic promontory rides',
  },
];

const TRAIN_JOURNEYS: TrainJourney[] = [
  {
    id: 'train-1',
    trainName: 'Vande Bharat Coastal Express',
    trainNumber: '22229 / 22230',
    route: 'Mumbai CSMT ⟷ Madgaon (Goa)',
    departure: '05:25 AM',
    arrival: '01:10 PM',
    duration: '7h 45m',
    classes: ['Executive Chair Car (EC)', 'AC Chair Car (CC)'],
    scenicHighlights: 'Traverses 91 tunnels and 2,000 bridges through misty Sahyadri Western Ghats and Arabian Sea estuaries.',
    startingFare: '₹1,815',
    frequency: '6 Days a week (Except Friday)',
    status: 'Seats Available',
  },
  {
    id: 'train-2',
    trainName: 'Mandovi VistaDome Scenic Rail',
    trainNumber: '10103 / 10104',
    route: 'Mumbai CSMT ⟷ Goa (Madgaon)',
    departure: '07:10 AM',
    arrival: '07:00 PM',
    duration: '11h 50m',
    classes: ['VistaDome Glass Ceiling (EV)', 'AC 2-Tier', 'AC 3-Tier'],
    scenicHighlights: '180-degree glass dome roof, rotating panoramic seats, Dudhsagar waterfall mist and Konkan viaducts.',
    startingFare: '₹2,450 (VistaDome)',
    frequency: 'Daily Departures',
    status: 'Fast Filling',
  },
  {
    id: 'train-3',
    trainName: 'Tejas Superfast Express',
    trainNumber: '22119 / 22120',
    route: 'Mumbai ⟷ Karmali (North Goa)',
    departure: '05:50 AM',
    arrival: '02:00 PM',
    duration: '8h 10m',
    classes: ['Smart Executive EC', 'Smart Chair Car CC'],
    scenicHighlights: 'Automated sliding doors, curated regional meals, scenic Konkan coconut grove corridors.',
    startingFare: '₹1,670',
    frequency: 'Tuesday, Thursday, Saturday, Sunday',
    status: 'On Time',
  },
  {
    id: 'train-4',
    trainName: 'Palace on Wheels Heritage Rail',
    trainNumber: 'POW-ROYAL',
    route: 'Delhi ⟷ Jaipur ⟷ Udaipur ⟷ Jaisalmer',
    departure: '16:30 PM',
    arrival: '7-Day Royal Circuit',
    duration: '7 Days / 6 Nights',
    classes: ['Deluxe Cabin', 'Super Deluxe Suite', 'Presidential Suite'],
    scenicHighlights: 'Luxury royal carriages, private butler service, Thar desert sunset halts, and illuminated fort visits.',
    startingFare: '₹48,000 / night',
    frequency: 'Wednesday Departures (Sep – Apr)',
    status: 'Seats Available',
  },
];

interface TransitRentalsSectionProps {
  onOpenTrainExperience?: () => void;
}

export const TransitRentalsSection = ({ onOpenTrainExperience }: TransitRentalsSectionProps) => {
  const [activeTab, setActiveTab] = useState<'bikes' | 'trains'>('bikes');
  const [selectedBike, setSelectedBike] = useState<BikeRental | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const handleBookBike = (bike: BikeRental) => {
    setSelectedBike(bike);
  };

  const handleConfirmBikeBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(`Your ${selectedBike?.name} rental has been reserved with hotel delivery.`);
    setTimeout(() => {
      setBookingSuccess(null);
      setSelectedBike(null);
    }, 3000);
  };

  const handleConfirmTrainBooking = (train: TrainJourney) => {
    setBookingSuccess(`Seats on ${train.trainName} (${train.trainNumber}) synchronized to your journey pass.`);
    setTimeout(() => {
      setBookingSuccess(null);
    }, 3000);
  };

  return (
    <section id="transit-rentals" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
            TRANSIT & MOBILITY STUDIO
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
            Bikes & Scenic Rail.
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-xl leading-relaxed">
            Curated two-wheeler rentals for spontaneous coastal detours and iconic panoramic train connections across India.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {onOpenTrainExperience && (
            <button
              type="button"
              onClick={onOpenTrainExperience}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono bg-neutral-900 text-white hover:bg-black transition-all hover:scale-105 cursor-pointer shadow-sm"
            >
              <span>✦ Fullscreen Train Window (Lumora)</span>
            </button>
          )}

          <div className="flex items-center p-1 bg-[#FAF8F5] border border-[#E7E5E2] rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab('bikes')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'bikes'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-[#6F6F6F] hover:text-black'
              }`}
            >
              <Bike className="w-4 h-4" />
              <span>BIKE & SCOOTER RENTALS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trains')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'trains'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-[#6F6F6F] hover:text-black'
              }`}
            >
              <Train className="w-4 h-4" />
              <span>TRAIN TRAVEL & SCENIC RAIL</span>
            </button>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono text-emerald-900 flex items-center justify-between animate-fade-rise">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{bookingSuccess}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-700">CONFIRMED</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: BIKE & SCOOTER RENTALS
      ========================================================================= */}
      {activeTab === 'bikes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-rise">
          {BIKE_RENTALS.map((bike) => (
            <div
              key={bike.id}
              className="bg-white border border-[#E7E5E2] rounded-[28px] overflow-hidden flex flex-col justify-between hover:border-black transition-all group card-hover-effect"
            >
              {/* Image & Badges */}
              <div className="relative h-48 bg-neutral-900 overflow-hidden">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono text-black font-semibold">
                    {bike.category}
                  </span>
                  {bike.isPopular && (
                    <span className="px-2.5 py-1 rounded-full bg-black text-white text-[10px] font-mono">
                      POPULAR CHOICE
                    </span>
                  )}
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-[#6F6F6F] block">{bike.engine}</span>
                  <h3 className="font-instrument text-2xl text-black leading-tight mt-0.5">
                    {bike.name}
                  </h3>
                  <p className="text-xs text-[#6F6F6F] font-inter mt-2 line-clamp-2">
                    {bike.popularFor}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-neutral-100 text-xs">
                  {bike.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-[#6F6F6F]">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-800 shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Price & Booking Button */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Daily Rate</span>
                    <span className="font-instrument text-2xl text-black">{bike.dailyRate}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookBike(bike)}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-medium transition-all hover:scale-105 cursor-pointer shadow-xs"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          TAB 2: TRAIN TRAVEL & SCENIC RAIL
      ========================================================================= */}
      {activeTab === 'trains' && (
        <div className="space-y-6 animate-fade-rise">
          {TRAIN_JOURNEYS.map((train) => (
            <div
              key={train.id}
              className="bg-white border border-[#E7E5E2] rounded-[28px] p-6 sm:p-8 hover:border-black transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
                {/* Train Identifiers */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E7E5E2] text-xs font-mono font-semibold text-black">
                      № {train.trainNumber}
                    </span>
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
                      train.status === 'Seats Available'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {train.status}
                    </span>
                  </div>
                  <h3 className="font-instrument text-3xl sm:text-4xl text-black leading-tight pt-1">
                    {train.trainName}
                  </h3>
                  <span className="text-xs font-mono text-[#6F6F6F] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {train.route}
                  </span>
                </div>

                {/* Timings & Duration */}
                <div className="flex items-center gap-8 text-center sm:text-left bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4 sm:px-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Departs</span>
                    <span className="font-instrument text-2xl text-black">{train.departure}</span>
                  </div>
                  <div className="text-center px-2">
                    <span className="text-[10px] font-mono text-[#6F6F6F] block">{train.duration}</span>
                    <div className="w-16 h-[1px] bg-neutral-300 mx-auto my-1 relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-black absolute -top-0.5 left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500">Non-stop / Fast</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Arrives</span>
                    <span className="font-instrument text-2xl text-black">{train.arrival}</span>
                  </div>
                </div>
              </div>

              {/* Scenic Story & Classes */}
              <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter leading-relaxed">
                    <span className="font-semibold text-black">Scenic Corridor: </span>
                    {train.scenicHighlights}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-mono uppercase text-[#6F6F6F]">Classes:</span>
                    {train.classes.map((cls, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[11px] font-mono text-black"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Fare & Booking */}
                <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Fares From</span>
                    <span className="font-instrument text-3xl text-black">{train.startingFare}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConfirmTrainBooking(train)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-mono hover:scale-105 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Reserve Seats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reserve Bike Modal */}
      {selectedBike && !bookingSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 overflow-y-auto animate-fade-rise">
          <div className="fixed inset-0 -z-10" onClick={() => setSelectedBike(null)} />

          <div className="relative w-full max-w-lg bg-white border border-[#E7E5E2] rounded-[32px] p-6 sm:p-8 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#6F6F6F]">RESERVATION CONFIRMATION</span>
                <h3 className="font-instrument text-2xl text-black">{selectedBike.name}</h3>
              </div>
              <button
                onClick={() => setSelectedBike(null)}
                className="p-1.5 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBikeBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#6F6F6F] uppercase block">Rate</span>
                  <span className="font-bold text-black">{selectedBike.dailyRate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#6F6F6F] uppercase block">Deposit</span>
                  <span className="font-medium text-black">{selectedBike.securityDeposit}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Pickup Location or Hotel</label>
                <select className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer">
                  {selectedBike.pickupLocations.map((loc, i) => (
                    <option key={i} value={loc}>{loc}</option>
                  ))}
                  <option value="hotel_delivery">Hotel / Villa Delivery (+₹150)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Rental Duration</label>
                  <select className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer">
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days (Recommended)</option>
                    <option value="5">5 Days</option>
                    <option value="7">Full Week (-15% off)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">Helmet Count</label>
                  <select className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black cursor-pointer">
                    <option value="1">1 Rider Helmet</option>
                    <option value="2">2 Helmets (Rider + Pillion)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full rounded-full py-3.5 bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Reservation · Pay on Delivery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
