import React, { useState } from 'react';
import {
  Plane,
  Train,
  Bus,
  Car,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import {
  StoredJourney,
  StoredBooking,
  BookingType,
  travelStorage,
} from '../../services/travelStorage';
import { FlightSearchModal } from './FlightSearchModal';

interface JourneyBookingsHubProps {
  journey: StoredJourney;
  onUpdateJourney: (updated: StoredJourney) => void;
}

const BOOKING_TYPES: Array<{
  id: BookingType;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'flight', label: 'Flights', icon: Plane },
  { id: 'train', label: 'Trains (IRCTC / Rail)', icon: Train },
  { id: 'bus', label: 'Buses (Intercity)', icon: Bus },
  { id: 'taxi', label: 'Cabs & Transfers', icon: Car },
  { id: 'hotel', label: 'Stays & Hotels', icon: Building },
];

export const JourneyBookingsHub: React.FC<JourneyBookingsHubProps> = ({
  journey,
  onUpdateJourney,
}) => {
  const [activeFilter, setActiveFilter] = useState<BookingType | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFlightSearchOpen, setIsFlightSearchOpen] = useState(false);

  // Form states for manual booking entry
  const [formType, setFormType] = useState<BookingType>('flight');
  const [formTitle, setFormTitle] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formRef, setFormRef] = useState('');
  const [formRoute, setFormRoute] = useState(
    journey.destinations?.map((d) => d.name).join(' → ') || journey.destination || ''
  );
  const [formDepDate, setFormDepDate] = useState(journey.startDate || '');
  const [formRetDate, setFormRetDate] = useState(journey.endDate || '');
  const [formDepTime, setFormDepTime] = useState('10:00');
  const [formArrTime, setFormArrTime] = useState('12:30');
  const [formCost, setFormCost] = useState('');
  const [formStatus, setFormStatus] = useState<'confirmed' | 'pending' | 'saved'>('confirmed');
  const [formUrl, setFormUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const bookings = journey.bookings || [];

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formRoute.trim()) return;

    const newBooking: StoredBooking = {
      id: `bk-${Date.now()}`,
      type: formType,
      title: formTitle.trim(),
      provider: formProvider.trim() || 'Direct Provider',
      bookingReference: formRef.trim() || undefined,
      route: formRoute.trim(),
      departureDate: formDepDate || new Date().toISOString().split('T')[0],
      returnDate: formRetDate || undefined,
      departureTime: formDepTime || undefined,
      arrivalTime: formArrTime || undefined,
      cost: Number(formCost) || 0,
      currency: journey.budgetPlanner?.currency || 'INR',
      status: formStatus,
      bookingUrl: formUrl.trim() || undefined,
      notes: formNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedBookings = [...bookings, newBooking];
    const updatedJourney: StoredJourney = {
      ...journey,
      bookings: updatedBookings,
    };

    travelStorage.saveJourney(updatedJourney);
    onUpdateJourney(updatedJourney);

    // Reset Form
    setFormTitle('');
    setFormProvider('');
    setFormRef('');
    setFormCost('');
    setFormUrl('');
    setFormNotes('');
    setShowAddModal(false);
  };

  const handleDeleteBooking = (id: string) => {
    if (!confirm('Are you sure you want to remove this booking from the journey?')) return;
    const updatedBookings = bookings.filter((b) => b.id !== id);
    const updatedJourney: StoredJourney = {
      ...journey,
      bookings: updatedBookings,
    };
    travelStorage.saveJourney(updatedJourney);
    onUpdateJourney(updatedJourney);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.type === activeFilter;
  });

  const totalBookedCost = bookings.reduce((sum, b) => sum + (b.cost || 0), 0);

  // Suggested providers with dynamic deep links
  const originCity = journey.destinations?.[0]?.name || journey.city || 'Origin';
  const destCity =
    journey.destinations?.[journey.destinations.length - 1]?.name ||
    journey.destination ||
    'Destination';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                TRANSIT & LOGISTICS HUB
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="font-instrument text-3xl sm:text-4xl text-black">
              Bookings & Transit Management
            </h2>
            <p className="text-sm font-inter text-[#6F6F6F] mt-1">
              Manage live flight tickets, train reservations, bus lines, and transfer receipts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsFlightSearchOpen(true)}
              className="px-4 py-2.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Search Flights (SerpApi)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-full bg-[#FAF8F5] border border-[#E7E5E2] text-black text-xs font-mono hover:bg-neutral-100 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Booking / Ticket</span>
            </button>
          </div>
        </div>

        {/* Total Booked Expense Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
          <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4">
            <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
              TOTAL CONFIRMED BOOKINGS
            </span>
            <span className="font-instrument text-2xl text-black">{bookings.length} reservations</span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4">
            <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
              TOTAL BOOKING EXPENDITURE
            </span>
            <span className="font-mono text-xl font-bold text-black">
              {journey.budgetPlanner?.currency === 'USD' ? '$' : '₹'}
              {totalBookedCost.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-4">
            <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
              JOURNEY TRAJECTORY
            </span>
            <span className="font-mono text-xs font-medium text-black truncate block mt-1">
              {journey.destinations?.map((d) => d.name).join(' → ') || journey.destination}
            </span>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-mono transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-black text-white'
                : 'bg-[#FAF8F5] border border-[#E7E5E2] text-[#6F6F6F] hover:text-black'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          {BOOKING_TYPES.map((type) => {
            const Icon = type.icon;
            const count = bookings.filter((b) => b.type === type.id).length;
            const isActive = activeFilter === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setActiveFilter(type.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-[#FAF8F5] border border-[#E7E5E2] text-[#6F6F6F] hover:text-black'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type.label}</span>
                <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Transit Provider Direct Search Hub */}
      <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="font-instrument text-2xl text-black">
          Direct Railway, Bus & Taxi Portals
        </h3>
        <p className="text-xs font-inter text-[#6F6F6F]">
          Quickly launch direct booking portals with pre-matched origin ({originCity}) and destination ({destCity}).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <a
            href={`https://www.irctc.co.in/nget/train-search`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">IRCTC National Rail</h4>
                <span className="text-[10px] font-mono text-[#6F6F6F]">Trains & Tatkal</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </a>

          <a
            href={`https://www.redbus.in/bus-tickets/${encodeURIComponent(originCity.toLowerCase())}-to-${encodeURIComponent(destCity.toLowerCase())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-800 flex items-center justify-center">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">RedBus Express</h4>
                <span className="text-[10px] font-mono text-[#6F6F6F]">Intercity sleeper</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </a>

          <a
            href={`https://m.uber.com/looking`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">Uber / Outstation</h4>
                <span className="text-[10px] font-mono text-[#6F6F6F]">Airport & intercity</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </a>

          <a
            href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destCity)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E5E2] hover:border-black transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-800 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-black">Booking.com Stays</h4>
                <span className="text-[10px] font-mono text-[#6F6F6F]">Hotels & Villas</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
          </a>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#E7E5E2] rounded-3xl p-12 text-center space-y-4">
            <CreditCard className="w-8 h-8 text-neutral-300 mx-auto" />
            <div>
              <h4 className="font-instrument text-2xl text-black">No bookings recorded</h4>
              <p className="text-xs font-mono text-[#6F6F6F] max-w-md mx-auto mt-1">
                Keep all your flight confirmation numbers, train PNRs, bus reservations, and transfer receipts organized in one place.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFlightSearchOpen(true)}
                className="px-4 py-2 bg-black text-white text-xs font-mono rounded-full hover:bg-neutral-800 cursor-pointer"
              >
                Search Flights
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E7E5E2] text-black text-xs font-mono rounded-full hover:bg-neutral-100 cursor-pointer"
              >
                Add Manual Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((b) => {
              const TypeIcon =
                b.type === 'flight'
                  ? Plane
                  : b.type === 'train'
                  ? Train
                  : b.type === 'bus'
                  ? Bus
                  : b.type === 'taxi'
                  ? Car
                  : Building;

              return (
                <div
                  key={b.id}
                  className="bg-white border border-[#E7E5E2] rounded-3xl p-6 hover:border-black transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-black">
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">
                            {b.provider}
                          </span>
                          <h4 className="font-instrument text-2xl text-black leading-tight">
                            {b.title}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-medium ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    {/* Route & Times */}
                    <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono font-medium text-black">
                        <span>{b.route}</span>
                        {b.cost > 0 && (
                          <span className="font-bold">
                            {b.currency === 'USD' ? '$' : '₹'}
                            {b.cost.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[#6F6F6F] text-[11px] font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{b.departureDate}</span>
                        </div>
                        {b.departureTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {b.departureTime}
                              {b.arrivalTime ? ` – ${b.arrivalTime}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reference / PNR */}
                    {b.bookingReference && (
                      <div className="flex items-center justify-between text-xs font-mono px-1">
                        <span className="text-[#6F6F6F]">REF / PNR / TICKET:</span>
                        <span className="font-bold text-black bg-neutral-100 px-2 py-0.5 rounded">
                          {b.bookingReference}
                        </span>
                      </div>
                    )}

                    {b.notes && (
                      <p className="text-xs font-inter text-[#6F6F6F] italic px-1">{b.notes}</p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    {b.bookingUrl ? (
                      <a
                        href={b.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-black hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Provider Portal</span>
                      </a>
                    ) : (
                      <span className="text-[10px] font-mono text-[#6F6F6F]">Manual Entry</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteBooking(b.id)}
                      className="p-1.5 rounded-full text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete booking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Booking Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-rise">
          <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7E5E2] pb-4">
              <div>
                <h3 className="font-instrument text-2xl text-black">Record Booking / Ticket</h3>
                <p className="text-xs font-mono text-[#6F6F6F]">
                  Add flight, train PNR, bus, or accommodation receipt
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-[#6F6F6F] hover:text-black rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Booking Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as BookingType)}
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train / Rail</option>
                    <option value="bus">Bus / Coach</option>
                    <option value="taxi">Cab / Transfer</option>
                    <option value="hotel">Hotel / Stay</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="saved">Saved / Planned</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                  Title / Description
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. IndiGo 6E-204 Flight / Rajdhani Express"
                  className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value)}
                    placeholder="e.g. Air India, IRCTC, RedBus"
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    PNR / Confirmation #
                  </label>
                  <input
                    type="text"
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    placeholder="e.g. W4XYZ8 or 283910283"
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                  Route
                </label>
                <input
                  type="text"
                  value={formRoute}
                  onChange={(e) => setFormRoute(e.target.value)}
                  placeholder="e.g. DEL → BOM"
                  className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    value={formDepDate}
                    onChange={(e) => setFormDepDate(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Return Date
                  </label>
                  <input
                    type="date"
                    value={formRetDate}
                    onChange={(e) => setFormRetDate(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Total Fare ({journey.budgetPlanner?.currency || 'INR'})
                  </label>
                  <input
                    type="number"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="e.g. 4500"
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={formDepTime}
                    onChange={(e) => setFormDepTime(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="time"
                    value={formArrTime}
                    onChange={(e) => setFormArrTime(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                  Provider Link / Ticket URL
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                  Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Seat 14A, baggage 15kg included, terminal 2..."
                  rows={2}
                  className="w-full bg-white border border-[#E7E5E2] rounded-xl px-3 py-2 text-sm text-black focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E5E2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-mono text-[#6F6F6F] hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 cursor-pointer"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flight Search SerpApi Modal */}
      {isFlightSearchOpen && (
        <FlightSearchModal
          isOpen={isFlightSearchOpen}
          onClose={() => setIsFlightSearchOpen(false)}
          defaultOrigin={journey.destinations?.[0]?.name || journey.city || 'DEL'}
          defaultDestination={
            journey.destinations?.[1]?.name ||
            journey.destinations?.[0]?.name ||
            journey.destination ||
            'BOM'
          }
          defaultDepartureDate={journey.startDate}
          defaultReturnDate={journey.endDate}
        />
      )}
    </div>
  );
};
