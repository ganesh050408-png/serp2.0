import { Country, State, City } from 'country-state-city';
import { DestinationInfo, DESTINATIONS } from './destinations';

export interface LocationCountry {
  code: string;
  name: string;
  flag: string;
}

export interface LocationState {
  code: string;
  name: string;
  countryCode: string;
}

export interface LocationCity {
  name: string;
  stateCode: string;
  countryCode: string;
  latitude?: string | null;
  longitude?: string | null;
}

// Get appropriate administrative division label based on country code
export const getSubdivisionLabel = (countryCode: string): string => {
  switch (countryCode) {
    case 'JP':
      return 'Prefecture';
    case 'CA':
      return 'Province / Territory';
    case 'US':
    case 'IN':
    case 'AU':
    case 'BR':
    case 'MX':
    case 'MY':
    case 'NG':
      return 'State';
    case 'GB':
      return 'Country / Region';
    case 'FR':
    case 'IT':
    case 'ES':
    case 'PT':
    case 'CL':
    case 'PH':
      return 'Region / Province';
    case 'DE':
    case 'AT':
      return 'Federal State';
    case 'CH':
      return 'Canton';
    default:
      return 'State / Province / Region';
  }
};

// Caches for fast repeated access
let cachedCountries: LocationCountry[] | null = null;
const stateCache = new Map<string, LocationState[]>();
const cityCache = new Map<string, LocationCity[]>();

export const getCountries = (): LocationCountry[] => {
  if (cachedCountries) return cachedCountries;
  const raw = Country.getAllCountries();
  cachedCountries = raw.map((c) => ({
    code: c.isoCode,
    name: c.name,
    flag: c.flag,
  }));
  return cachedCountries;
};

export const getStatesForCountry = (countryCode: string): LocationState[] => {
  if (!countryCode) return [];
  if (stateCache.has(countryCode)) {
    return stateCache.get(countryCode)!;
  }
  const raw = State.getStatesOfCountry(countryCode);
  const states = raw.map((s) => ({
    code: s.isoCode,
    name: s.name,
    countryCode: s.countryCode,
  }));
  stateCache.set(countryCode, states);
  return states;
};

export const getCitiesForState = (countryCode: string, stateCode: string): LocationCity[] => {
  if (!countryCode || !stateCode) return [];
  const cacheKey = `${countryCode}_${stateCode}`;
  if (cityCache.has(cacheKey)) {
    return cityCache.get(cacheKey)!;
  }
  const raw = City.getCitiesOfState(countryCode, stateCode);
  const cities = raw.map((c) => ({
    name: c.name,
    stateCode: c.stateCode,
    countryCode: c.countryCode,
    latitude: c.latitude,
    longitude: c.longitude,
  }));
  cityCache.set(cacheKey, cities);
  return cities;
};

// Curated high-resolution fallback image backdrops
const GLOBAL_DESTINATION_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
];

export const createGlobalDestination = (
  countryName: string,
  stateName: string,
  cityName: string,
  lat?: number,
  lng?: number
): DestinationInfo => {
  const cleanCity = cityName.trim();
  const cleanState = stateName.trim();
  const cleanCountry = countryName.trim();

  // Check if predefined in curated DESTINATIONS list
  const existing = DESTINATIONS.find(
    (d) => d.city.toLowerCase() === cleanCity.toLowerCase()
  );
  if (existing) {
    return {
      ...existing,
      country: cleanCountry || existing.country,
      region: cleanState || existing.region,
    };
  }

  const hash = Math.abs(
    cleanCity.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );
  const img1 = GLOBAL_DESTINATION_IMAGES[hash % GLOBAL_DESTINATION_IMAGES.length];
  const img2 = GLOBAL_DESTINATION_IMAGES[(hash + 1) % GLOBAL_DESTINATION_IMAGES.length];

  return {
    city: cleanCity,
    region: cleanState || cleanCountry,
    country: cleanCountry,
    image: img1,
    secondaryImage: img2,
    lat: lat ?? 20.5937,
    lng: lng ?? 78.9629,
    xPercent: 50,
    yPercent: 50,
    recommendedDuration: 3,
    styles: ['culture', 'relaxed', 'food', 'photography', 'heritage'],
    budgetLevel: '$$',
    attractions: [
      `Historic District & Cultural Center in ${cleanCity}`,
      `Scenic Landmarks of ${cleanState || cleanCountry}`,
      `Signature viewpoints & architectural heritage`,
    ],
    activities: [
      { name: `Bespoke city exploration & heritage walk in ${cleanCity}`, styles: ['culture', 'relaxed'] },
      { name: `Traditional culinary and gastronomy tour in ${cleanState || cleanCountry}`, styles: ['food', 'relaxed'] },
      { name: `Artisan craft studio visits and scenic photo walk`, styles: ['photography', 'culture'] },
      { name: `Sunset leisure excursion & boutique retreat`, styles: ['luxury', 'wellness'] },
    ],
  };
};
