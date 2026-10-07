import https from 'node:https';
import url from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
// Load .env on module init
dotenv.config();
function formatDuration(minutes) {
    if (!minutes || minutes <= 0)
        return 'Direct';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0)
        return `${mins}m`;
    if (mins === 0)
        return `${hrs}h`;
    return `${hrs}h ${mins}m`;
}
function formatTimeString(isoOrTimeStr) {
    if (!isoOrTimeStr)
        return '--:--';
    if (isoOrTimeStr.includes(' ')) {
        const parts = isoOrTimeStr.split(' ');
        return parts[1] || isoOrTimeStr;
    }
    if (isoOrTimeStr.includes('T')) {
        const parts = isoOrTimeStr.split('T');
        return parts[1]?.slice(0, 5) || isoOrTimeStr;
    }
    return isoOrTimeStr;
}
/**
 * Dynamically get the current SerpApi key from process.env or direct .env file read.
 * This ensures hot-reloading of .env without needing manual server restarts.
 */
export function getBackendSerpApiKey() {
    // 1. Check process.env first
    let key = process.env.SERPAPI_KEY || process.env.SERP_API_KEY || process.env.SERPAPI_API_KEY || '';
    // 2. Read directly from root .env file on disk to catch live edits immediately
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const raw = fs.readFileSync(envPath, 'utf8');
            const parsed = dotenv.parse(raw);
            if (parsed.SERPAPI_KEY) {
                key = parsed.SERPAPI_KEY;
            }
            else if (parsed.SERP_API_KEY) {
                key = parsed.SERP_API_KEY;
            }
            else if (parsed.SERPAPI_API_KEY) {
                key = parsed.SERPAPI_API_KEY;
            }
        }
    }
    catch (e) {
        // Ignore read errors
    }
    // Clean key (remove surrounding quotes, whitespace)
    const cleanKey = key.trim().replace(/^["']|["']$/g, '').trim();
    // Log status only (never log the actual secret key)
    const isLoaded = Boolean(cleanKey && cleanKey !== 'your_key_here' && cleanKey !== 'your_serpapi_key_here');
    console.log('[Aethera Backend] SerpApi key loaded:', isLoaded);
    return cleanKey;
}
function fetchJson(targetUrl) {
    return new Promise((resolve, reject) => {
        https
            .get(targetUrl, (res) => {
            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(rawData);
                    resolve(parsed);
                }
                catch (e) {
                    reject(new Error(`Failed to parse SerpApi response: ${rawData.slice(0, 150)}`));
                }
            });
        })
            .on('error', (err) => {
            reject(err);
        });
    });
}
/**
 * Handle /api/flights/search requests on the backend
 */
export async function handleFlightSearchRequest(req, res, apiKeyOverride) {
    // Enable CORS headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }
    try {
        const parsedUrl = url.parse(req.url || '', true);
        const query = parsedUrl.query;
        const departureId = typeof query.departure_id === 'string' ? query.departure_id.trim().toUpperCase() : '';
        const arrivalId = typeof query.arrival_id === 'string' ? query.arrival_id.trim().toUpperCase() : '';
        const outboundDate = typeof query.outbound_date === 'string' ? query.outbound_date.trim() : '';
        const returnDate = typeof query.return_date === 'string' ? query.return_date.trim() : '';
        const tripType = query.trip_type === '1' ? '1' : '2'; // 1 = round trip, 2 = one way
        const adults = typeof query.adults === 'string' ? query.adults : '1';
        const travelClass = typeof query.travel_class === 'string' ? query.travel_class : '1';
        const currency = typeof query.currency === 'string' ? query.currency.trim().toUpperCase() : 'INR';
        if (!departureId || !arrivalId || !outboundDate) {
            res.statusCode = 400;
            res.end(JSON.stringify({
                success: false,
                error: 'Missing required search parameters: departure_id, arrival_id, or outbound_date.',
                flights: [],
            }));
            return;
        }
        // Resolve API key
        const apiKey = (apiKeyOverride || getBackendSerpApiKey()).trim();
        // 1. Check if key is completely missing
        if (!apiKey || apiKey === 'your_key_here' || apiKey === 'your_serpapi_key_here') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: false,
                error: 'Flight search authentication failed: SERPAPI_KEY is not configured in backend .env. Please add your SerpApi API key from https://serpapi.com/manage-api-key to SERPAPI_KEY in .env.',
                authError: true,
                flights: [],
            }));
            return;
        }
        // 2. Check if key is erroneously a URL instead of a secret key
        if (apiKey.startsWith('http://') || apiKey.startsWith('https://')) {
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: false,
                error: 'Flight search authentication failed: Invalid API key format. You entered a URL instead of your secret API key. Please copy your actual API key from https://serpapi.com/manage-api-key into SERPAPI_KEY in .env.',
                authError: true,
                flights: [],
            }));
            return;
        }
        // Build SerpApi Google Flights parameters
        const serpParams = new URLSearchParams({
            engine: 'google_flights',
            departure_id: departureId,
            arrival_id: arrivalId,
            outbound_date: outboundDate,
            type: tripType,
            adults: adults,
            travel_class: travelClass,
            currency: currency,
            hl: 'en',
            api_key: apiKey,
        });
        if (tripType === '1' && returnDate) {
            serpParams.set('return_date', returnDate);
        }
        const serpApiUrl = `https://serpapi.com/search.json?${serpParams.toString()}`;
        // Call SerpApi backend-to-backend
        const serpData = await fetchJson(serpApiUrl);
        // Handle SerpApi specific errors with accurate distinction
        if (serpData.error) {
            const errMsg = String(serpData.error);
            const isAuthErr = errMsg.toLowerCase().includes('api key') ||
                errMsg.toLowerCase().includes('unauthorized') ||
                errMsg.toLowerCase().includes('account');
            let userFacingError = errMsg;
            if (isAuthErr) {
                userFacingError = 'Flight search authentication failed: Invalid SerpApi API key. Please check your API key at https://serpapi.com/manage-api-key.';
            }
            else if (errMsg.toLowerCase().includes('departure_id') || errMsg.toLowerCase().includes('arrival_id')) {
                userFacingError = `Invalid flight route: ${errMsg}`;
            }
            else if (errMsg.toLowerCase().includes('date')) {
                userFacingError = `Invalid flight date: ${errMsg}`;
            }
            res.statusCode = 200;
            res.end(JSON.stringify({
                success: false,
                error: userFacingError,
                authError: isAuthErr,
                flights: [],
            }));
            return;
        }
        // Combine best_flights and other_flights
        const bestFlights = Array.isArray(serpData.best_flights) ? serpData.best_flights : [];
        const otherFlights = Array.isArray(serpData.other_flights) ? serpData.other_flights : [];
        const allRawOptions = [
            ...bestFlights.map((f) => ({ ...f, isBest: true })),
            ...otherFlights.map((f) => ({ ...f, isBest: false })),
        ];
        const fallbackBookingUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${arrivalId}%20from%20${departureId}%20on%20${outboundDate}`;
        // Sanitize and format flight options
        const sanitizedFlights = allRawOptions.map((opt, idx) => {
            const segments = opt.flights || [];
            const firstSegment = segments[0] || {};
            const lastSegment = segments[segments.length - 1] || firstSegment;
            const airline = segments
                .map((s) => s.airline)
                .filter(Boolean)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(' / ') || 'Commercial Airline';
            const flightNumber = segments.map((s) => s.flight_number).filter(Boolean).join(', ') || 'Scheduled Flight';
            const airlineLogo = opt.airline_logo || firstSegment.airline_logo || undefined;
            const fromAirport = firstSegment.departure_airport?.name || departureId;
            const fromCode = firstSegment.departure_airport?.id || departureId;
            const toAirport = lastSegment.arrival_airport?.name || arrivalId;
            const toCode = lastSegment.arrival_airport?.id || arrivalId;
            const depTime = formatTimeString(firstSegment.departure_airport?.time);
            const arrTime = formatTimeString(lastSegment.arrival_airport?.time);
            const durationMinutes = opt.total_duration || segments.reduce((sum, s) => sum + (s.duration || 0), 0);
            const durationStr = formatDuration(durationMinutes);
            const stopsCount = Math.max(0, segments.length - 1);
            let stopsLabel = 'Non-stop';
            if (stopsCount === 1) {
                const layoverCode = segments[0]?.arrival_airport?.id || '1 Stop';
                stopsLabel = `1 Stop (${layoverCode})`;
            }
            else if (stopsCount > 1) {
                stopsLabel = `${stopsCount} Stops`;
            }
            const price = typeof opt.price === 'number' ? opt.price : 0;
            const travelClassLabel = firstSegment.travel_class || 'Economy';
            // SerpApi direct link or Google Flights booking link
            const bookingUrl = serpData.search_metadata?.google_flights_url || fallbackBookingUrl;
            const baggage = opt.extensions?.find((e) => e.toLowerCase().includes('bag') || e.toLowerCase().includes('carry-on')) ||
                'Standard baggage policy applies';
            return {
                id: `flight_${idx}_${Date.now()}`,
                airline,
                airlineLogo,
                flightNumber,
                from: fromAirport,
                fromCode,
                to: toAirport,
                toCode,
                departureTime: depTime,
                arrivalTime: arrTime,
                duration: durationStr,
                stops: stopsLabel,
                stopsCount,
                price,
                currency,
                travelClass: travelClassLabel,
                bookingUrl,
                baggage,
                airplane: firstSegment.airplane,
                isBest: opt.isBest,
            };
        });
        res.statusCode = 200;
        res.end(JSON.stringify({
            success: true,
            flights: sanitizedFlights,
            searchUrl: serpData.search_metadata?.google_flights_url || fallbackBookingUrl,
            originCode: departureId,
            destinationCode: arrivalId,
        }));
    }
    catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({
            success: false,
            error: error?.message || 'Server error while processing flight search.',
            flights: [],
        }));
    }
}
//# sourceMappingURL=flightApiHandler.js.map