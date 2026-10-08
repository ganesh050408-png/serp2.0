import { resolveAirportCode } from './airportCodes';

export interface FlightSearchParams {
  from: string;
  to: string;
  departureDate: string; // YYYY-MM-DD
  returnDate?: string;   // YYYY-MM-DD
  tripType: 'oneway' | 'round';
  adults?: number;
  children?: number;
  travelClass?: 'Economy' | 'Premium Economy' | 'Business' | 'First Class';
  currency?: string;
}

export interface SanitizedFlight {
  id: string;
  airline: string;
  airlineLogo?: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departureTime: string;
  arrivalTime: string;
  departureDate?: string;
  arrivalDate?: string;
  duration: string;
  stops: string;
  stopsCount: number;
  price: number;
  currency: string;
  travelClass: string;
  bookingUrl: string;
  baggage?: string;
  airplane?: string;
  isBest?: boolean;
}

export interface FlightSearchResponse {
  success: boolean;
  flights: SanitizedFlight[];
  error?: string;
  searchUrl?: string;
  originCode?: string;
  destinationCode?: string;
}

/**
 * Call the backend /api/flights/search endpoint to search real flights via SerpApi Google Flights.
 * Note: SerpApi API key is stored strictly on the backend and NEVER exposed to frontend code.
 */
export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResponse> {
  const depCode = resolveAirportCode(params.from);
  const arrCode = resolveAirportCode(params.to);

  if (!depCode || !arrCode) {
    return {
      success: false,
      flights: [],
      error: 'Please specify valid origin and destination cities or airport codes.',
    };
  }

  if (!params.departureDate) {
    return {
      success: false,
      flights: [],
      error: 'Please select a departure date.',
    };
  }

  const query = new URLSearchParams({
    departure_id: depCode,
    arrival_id: arrCode,
    outbound_date: params.departureDate,
    trip_type: params.tripType === 'round' ? '1' : '2',
    adults: String(params.adults || 1),
    currency: params.currency || 'INR',
  });

  if (params.tripType === 'round' && params.returnDate) {
    query.set('return_date', params.returnDate);
  }

  if (params.travelClass) {
    // 1: Economy, 2: Premium Economy, 3: Business, 4: First
    const classMap: Record<string, string> = {
      Economy: '1',
      'Premium Economy': '2',
      Business: '3',
      'First Class': '4',
    };
    query.set('travel_class', classMap[params.travelClass] || '1');
  }

  try {
    const response = await fetch(`/api/flights/search?${query.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        flights: [],
        error: errorData.error || `Unable to search flights (Status ${response.status}).`,
        originCode: depCode,
        destinationCode: arrCode,
      };
    }

    const data: FlightSearchResponse = await response.json();
    return {
      ...data,
      originCode: depCode,
      destinationCode: arrCode,
    };
  } catch (err: any) {
    const isNetworkErr =
      err?.name === 'TypeError' ||
      err?.message === 'Failed to fetch' ||
      err?.message?.toLowerCase().includes('fetch');
    const msg = isNetworkErr
      ? 'Unable to reach the flight search server. Please make sure the server is running on http://localhost:5173 and try again.'
      : err?.message || 'Unable to connect to flight search service right now.';

    return {
      success: false,
      flights: [],
      error: msg,
      originCode: depCode,
      destinationCode: arrCode,
    };
  }
}

