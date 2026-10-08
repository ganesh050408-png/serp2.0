import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  Search,
  ArrowRight,
  ExternalLink,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { searchFlights, SanitizedFlight } from '../../services/flightService';
import { resolveAirportCode } from '../../services/airportCodes';

export interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrigin?: string;
  defaultDestination?: string;
  defaultDepartureDate?: string;
  defaultReturnDate?: string;
}

export const FlightSearchModal: React.FC<FlightSearchModalProps> = ({
  isOpen,
  onClose,
  defaultOrigin = 'DEL',
  defaultDestination = 'BOM',
  defaultDepartureDate,
  defaultReturnDate,
}) => {
  const [fromCity, setFromCity] = useState(defaultOrigin);
  const [toCity, setToCity] = useState(defaultDestination);
  const [departureDate, setDepartureDate] = useState(
    defaultDepartureDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [returnDate, setReturnDate] = useState(defaultReturnDate || '');
  const [tripType, setTripType] = useState<'oneway' | 'round'>(defaultReturnDate ? 'round' : 'oneway');
  const [adults, setAdults] = useState(1);
  const [travelClass, setTravelClass] = useState<'Economy' | 'Business'>('Economy');
  const [currency, setCurrency] = useState('INR');

  const [flights, setFlights] = useState<SanitizedFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (defaultOrigin) setFromCity(defaultOrigin);
    if (defaultDestination) setToCity(defaultDestination);
  }, [defaultOrigin, defaultDestination]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await searchFlights({
        from: fromCity,
        to: toCity,
        departureDate,
        returnDate: tripType === 'round' ? returnDate : undefined,
        tripType,
        adults,
        travelClass,
        currency,
      });

      if (!res.success && res.error) {
        setError(res.error);
        setFlights([]);
      } else {
        setFlights(res.flights || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to search flights');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const originCode = resolveAirportCode(fromCity) || fromCity.toUpperCase();
  const destCode = resolveAirportCode(toCity) || toCity.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-rise">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="bg-[#FAF8F5] border border-[#E7E5E2] rounded-3xl w-full max-w-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E7E5E2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-instrument text-2xl text-black">Live Flight Search</h3>
              <span className="text-xs font-mono text-[#6F6F6F]">
                Powered by Google Flights & SerpApi engine
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#6F6F6F] hover:text-black rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white border border-[#E7E5E2] rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                From (City / Airport)
              </label>
              <input
                type="text"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="e.g. DEL or Delhi"
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                required
              />
              <span className="text-[10px] font-mono text-[#6F6F6F] mt-1 block">Code: {originCode}</span>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                To (City / Airport)
              </label>
              <input
                type="text"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="e.g. GOI or Goa"
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-black"
                required
              />
              <span className="text-[10px] font-mono text-[#6F6F6F] mt-1 block">Code: {destCode}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Trip Type
              </label>
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as any)}
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
              >
                <option value="oneway">One-Way</option>
                <option value="round">Round Trip</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                Departure Date
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                required
              />
            </div>

            {tripType === 'round' ? (
              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-mono uppercase text-[#6F6F6F] block mb-1">
                  Travel Class
                </label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#E7E5E2] rounded-xl px-3 py-2 text-xs font-mono text-black focus:outline-none"
                >
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
            <div className="flex items-center gap-3 text-xs font-mono">
              <label className="flex items-center gap-1.5 text-[#6F6F6F]">
                <span>Passengers:</span>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-14 bg-[#FAF8F5] border border-[#E7E5E2] rounded px-2 py-1 text-black font-bold"
                />
              </label>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#FAF8F5] border border-[#E7E5E2] rounded px-2 py-1 text-black font-mono text-xs"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-black text-white text-xs font-mono rounded-full hover:bg-neutral-800 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching Flights...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search Live Flights</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="space-y-3">
          {error && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-inter text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Flight Search Notice</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {searched && !loading && flights.length === 0 && !error && (
            <div className="bg-white border border-[#E7E5E2] rounded-3xl p-10 text-center space-y-2">
              <Plane className="w-7 h-7 text-neutral-300 mx-auto" />
              <h4 className="font-instrument text-2xl text-black">No flights found for this query</h4>
              <p className="text-xs font-mono text-[#6F6F6F]">
                Try adjusting the dates or checking another nearby airport code.
              </p>
            </div>
          )}

          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-white border border-[#E7E5E2] rounded-3xl p-5 hover:border-black transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black text-sm">{flight.airline}</span>
                  <span className="text-xs font-mono text-[#6F6F6F] bg-neutral-100 px-2 py-0.5 rounded">
                    {flight.flightNumber}
                  </span>
                  {flight.isBest && (
                    <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Best Value
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-sm font-bold text-black">{flight.departureTime}</span>
                    <span className="text-[10px] text-[#6F6F6F] block">{flight.fromCode}</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#6F6F6F]">{flight.duration}</span>
                    <div className="w-16 h-[1px] bg-neutral-300 relative my-1">
                      <ArrowRight className="w-3 h-3 absolute right-0 -top-1 text-neutral-400" />
                    </div>
                    <span className="text-[9px] text-[#6F6F6F]">{flight.stops}</span>
                  </div>

                  <div>
                    <span className="text-sm font-bold text-black">{flight.arrivalTime}</span>
                    <span className="text-[10px] text-[#6F6F6F] block">{flight.toCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-black">
                    {flight.currency === 'USD' ? '$' : '₹'}
                    {flight.price.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-[#6F6F6F] block">{flight.travelClass}</span>
                </div>

                <a
                  href={flight.bookingUrl || `https://www.google.com/travel/flights`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-black text-white text-xs font-mono rounded-full hover:bg-neutral-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Book</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
