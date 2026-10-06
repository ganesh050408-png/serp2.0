import { useState } from 'react';
import {
  X,
  MapPin,
  Car,
  Phone,
  ShieldAlert,
  Stethoscope,
  Pill,
  ExternalLink,
  Bike,
  Train,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { ServiceCategory } from './QuickAssistanceGrid';

interface ServiceModalsProps {
  activeCategory: ServiceCategory | null;
  onClose: () => void;
  onRequestRide: (destination: string) => void;
}

export const ServiceModals = ({
  activeCategory,
  onClose,
  onRequestRide,
}: ServiceModalsProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('Uber');
  const [rideDestination] = useState<string>('CityCare Hospital, Panaji');
  const [bookedItem, setBookedItem] = useState<string | null>(null);

  if (!activeCategory) return null;

  const handleBook = (title: string) => {
    setBookedItem(title);
    setTimeout(() => {
      setBookedItem(null);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-rise">
      <div className="bg-white border border-[#E7E5E2] rounded-[28px] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E7E5E2] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center text-sm">
              {activeCategory === 'hospitals' || activeCategory === 'unwell' ? (
                <Stethoscope className="w-5 h-5" />
              ) : activeCategory === 'pharmacies' ? (
                <Pill className="w-5 h-5" />
              ) : activeCategory === 'rides' ? (
                <Car className="w-5 h-5" />
              ) : activeCategory === 'bikes' ? (
                <Bike className="w-5 h-5" />
              ) : activeCategory === 'trains' ? (
                <Train className="w-5 h-5" />
              ) : activeCategory === 'emergency' ? (
                <ShieldAlert className="w-5 h-5 text-red-400" />
              ) : (
                <MapPin className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                LOCATION SERVICES · PANAJI, GOA
              </span>
              <h3 className="font-instrument text-3xl text-[#000000] leading-tight">
                {activeCategory === 'unwell' && 'Medical & Health Support'}
                {activeCategory === 'hospitals' && 'Hospitals Near You'}
                {activeCategory === 'pharmacies' && 'Pharmacies Near You'}
                {activeCategory === 'rides' && 'Get a Ride'}
                {activeCategory === 'bikes' && 'Bike & Scooter Rentals'}
                {activeCategory === 'trains' && 'Scenic Trains & Rail Schedules'}
                {activeCategory === 'restaurants' && 'Curated Dining Near You'}
                {activeCategory === 'hotels' && 'Boutique Stays & Hotels'}
                {activeCategory === 'atms' && 'ATMs & Cash Points'}
                {activeCategory === 'emergency' && 'Emergency Services (SOS)'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-200/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {bookedItem && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-mono text-emerald-900 flex items-center gap-2 animate-fade-rise">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Reservation confirmed for {bookedItem}! Hotel delivery dispatch requested.</span>
            </div>
          )}

          {/* CATEGORY: BIKE RENTALS */}
          {activeCategory === 'bikes' && (
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] block">
                AVAILABLE TWO-WHEELERS IN PANAJI
              </span>

              {[
                { name: 'Royal Enfield Hunter 350', type: 'Cruiser', rate: '₹850/day', dep: '₹2,000 deposit', loc: 'Panaji Latin Quarter · Delivery available', img: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=400&auto=format&fit=crop' },
                { name: 'Vespa Elegante 150', type: 'Classic Scooter', rate: '₹600/day', dep: '₹1,500 deposit', loc: 'Fontainhas Hub · Automatic', img: 'https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?q=80&w=400&auto=format&fit=crop' },
                { name: 'Ather 450X EV', type: 'Electric Eco', rate: '₹550/day', dep: '₹1,500 deposit', loc: 'Smart City Charging Hub', img: 'https://images.unsplash.com/photo-1616422285623-13ff0ec62192?q=80&w=400&auto=format&fit=crop' },
                { name: 'Royal Enfield Himalayan 450', type: 'Adventure Tourer', rate: '₹1,400/day', dep: '₹3,500 deposit', loc: 'North Goa Touring Base', img: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400&auto=format&fit=crop' },
              ].map((bike, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E7E5E2] hover:border-black transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
                      <img src={bike.img} alt={bike.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{bike.type}</span>
                      <h4 className="font-instrument text-2xl text-black leading-tight mt-0.5">{bike.name}</h4>
                      <p className="text-xs text-[#6F6F6F] font-inter">{bike.loc}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <div className="text-left sm:text-right">
                      <span className="font-instrument text-2xl text-black block">{bike.rate}</span>
                      <span className="text-[10px] font-mono text-[#6F6F6F]">{bike.dep}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBook(bike.name)}
                      className="px-5 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-xs"
                    >
                      Rent Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CATEGORY: TRAINS */}
          {activeCategory === 'trains' && (
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] block">
                SCENIC TRAINS CONNECTING GOA & MUMBAI
              </span>

              {[
                { name: 'Vande Bharat Coastal Express (22230)', time: '14:40 Departs Madgaon → 22:25 Mumbai CSMT', duration: '7h 45m', fare: 'From ₹1,815', highlight: 'Fastest Western Ghats scenic rail', status: 'Seats Available' },
                { name: 'Mandovi VistaDome Rail (10104)', time: '09:15 Departs Madgaon → 21:45 Mumbai CSMT', duration: '12h 30m', fare: 'From ₹2,450 (Glass Dome)', highlight: '180° Panoramic glass ceiling view', status: 'Fast Filling' },
                { name: 'Tejas Superfast Express (22120)', time: '15:35 Departs Karmali → 23:55 Mumbai', duration: '8h 20m', fare: 'From ₹1,670', highlight: 'Executive ergonomic cabins', status: 'On Time' },
              ].map((train, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-[#E7E5E2] hover:border-black transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-instrument text-2xl text-black">{train.name}</h4>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">{train.status}</span>
                  </div>

                  <p className="text-xs text-[#6F6F6F] font-inter">
                    <span className="font-semibold text-black">Schedule: </span>{train.time} ({train.duration})
                  </p>
                  <p className="text-xs text-[#6F6F6F] font-inter">
                    <span className="font-semibold text-black">Experience: </span>{train.highlight}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <span className="font-instrument text-2xl text-black">{train.fare}</span>
                    <button
                      type="button"
                      onClick={() => handleBook(train.name)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all hover:scale-105 cursor-pointer shadow-xs"
                    >
                      <span>Reserve Seats</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CATEGORY: UNWELL OR HOSPITALS */}
          {(activeCategory === 'unwell' || activeCategory === 'hospitals') && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-inter text-xs font-bold uppercase tracking-wider text-amber-900">
                    Immediate Health Assistance
                  </h4>
                  <p className="text-xs text-amber-900/90 font-inter leading-relaxed">
                    If this is a life-threatening emergency, call <strong>112</strong> or <strong>108</strong> immediately.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'CityCare Hospital Panaji', dist: '1.8 km', eta: '7 min', type: '24/7 Emergency & Multi-Speciality', phone: '+91 832 242 0000' },
                  { name: 'Manipal Hospital Goa (Dona Paula)', dist: '5.2 km', eta: '14 min', type: 'NABH Accredited Tertiary Center', phone: '+91 832 245 3000' },
                ].map((hosp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-[#E7E5E2] hover:border-black transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-instrument text-2xl text-black leading-tight">{hosp.name}</h4>
                        <p className="text-xs text-[#6F6F6F] font-inter mt-0.5">{hosp.type}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-black bg-neutral-100 px-2 py-1 rounded">{hosp.dist}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                      <a href={`tel:${hosp.phone}`} className="flex-1 rounded-full py-2 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-medium flex items-center justify-center gap-1.5 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Hospital</span>
                      </a>
                      <button type="button" onClick={() => onRequestRide(hosp.name)} className="flex-1 rounded-full py-2 bg-black hover:bg-neutral-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer">
                        <Car className="w-3.5 h-3.5" />
                        <span>Ride to Hospital</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY: RIDES */}
          {activeCategory === 'rides' && (
            <div className="space-y-5">
              <span className="text-xs font-mono uppercase text-[#6F6F6F] block">AVAILABLE RIDE SERVICES</span>
              <div className="space-y-3">
                {[
                  { name: 'Uber Premier / Go', eta: '4 min', price: '₹180', note: 'Top rated sedan driver' },
                  { name: 'Ola Cab Prime', eta: '5 min', price: '₹165', note: 'Sedan nearby' },
                  { name: 'GoaMiles Local Taxi', eta: '3 min', price: '₹220', note: 'Official Goa tourism cab' },
                ].map((ride) => (
                  <label key={ride.name} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${selectedProvider === ride.name ? 'border-black bg-[#FAF8F5] shadow-xs' : 'border-[#E7E5E2] hover:border-neutral-400'}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="rideProvider" checked={selectedProvider === ride.name} onChange={() => setSelectedProvider(ride.name)} className="text-black focus:ring-0" />
                      <div>
                        <span className="font-inter text-sm font-semibold text-black block">{ride.name}</span>
                        <span className="text-xs text-[#6F6F6F]">{ride.note}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-black block">{ride.price}</span>
                      <span className="text-[11px] font-mono text-emerald-700">{ride.eta} away</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert(`Connecting to ${selectedProvider} booking flow for ${rideDestination}...`);
                    onClose();
                  }}
                  className="w-full rounded-full py-4 bg-[#000000] text-white text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Continue to {selectedProvider}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* CATEGORY: PHARMACIES */}
          {activeCategory === 'pharmacies' && (
            <div className="space-y-4">
              {[
                { name: 'Apollo Pharmacy 24/7', dist: '600m away', addr: 'MG Road, Panaji', phone: '+91 832 242 1100' },
                { name: 'MedPlus Panaji Branch', dist: '1.1 km away', addr: '18th June Road', phone: '+91 832 223 8800' },
                { name: 'Wellness Forever Day & Night', dist: '2.3 km away', addr: 'Miramar Circle', phone: '+91 832 246 5500' },
              ].map((ph, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E7E5E2] flex items-center justify-between">
                  <div>
                    <h4 className="font-instrument text-2xl text-black">{ph.name}</h4>
                    <p className="text-xs text-[#6F6F6F] font-inter">{ph.addr} · {ph.dist}</p>
                  </div>
                  <a href={`tel:${ph.phone}`} className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-medium flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* CATEGORY: EMERGENCY */}
          {activeCategory === 'emergency' && (
            <div className="space-y-5">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <span className="text-[11px] font-mono uppercase text-red-800 font-semibold block mb-1">CURRENT LOCATION COORDINATES</span>
                <p className="text-sm font-mono text-red-950 font-bold">📍 15.4909° N, 73.8278° E — Panaji Waterfront Promenade, North Goa</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'National Emergency Response Helpline', num: '112', type: 'All-in-one Emergency Dispatch' },
                  { name: 'Ambulance & Medical Emergency', num: '108', type: 'Instant Medical Van Dispatch' },
                  { name: 'Tourist Police & Security Assistance', num: '100', type: 'North Goa Tourist Police Division' },
                ].map((em, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-inter text-sm font-semibold text-black">{em.name}</h4>
                      <p className="text-xs text-[#6F6F6F] font-inter">{em.type}</p>
                    </div>
                    <a href={`tel:${em.num}`} className="rounded-full px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call {em.num}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY: RESTAURANTS, HOTELS, ATMS */}
          {(activeCategory === 'restaurants' || activeCategory === 'hotels' || activeCategory === 'atms') && (
            <div className="space-y-4">
              {[
                { name: 'The Black Sheep Bistro', tag: 'Contemporary Goan Fusion', dist: '750m away' },
                { name: 'Mum’s Kitchen', tag: 'Traditional Goan Heritage Recipes', dist: '1.2 km away' },
                { name: 'Viva Panjim', tag: 'Fontainhas Authentic Seafood & Bebinca', dist: '400m away' },
              ].map((place, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E7E5E2] flex items-center justify-between">
                  <div>
                    <h4 className="font-instrument text-2xl text-black">{place.name}</h4>
                    <p className="text-xs text-[#6F6F6F] font-inter">{place.tag} · {place.dist}</p>
                  </div>
                  <button type="button" onClick={() => onRequestRide(place.name)} className="rounded-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-black flex items-center gap-1">
                    <span>Get Ride</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
