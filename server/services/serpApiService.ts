import { ApiError } from '../errors.js';
import type { DestinationSearchResult } from '../types/destinations.js';

const SERP_API_URL = 'https://serpapi.com/search.json';
const PROVIDER_TIMEOUT_MS = 8_000;

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null;

const getString = (record: JsonRecord, ...keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const getNumber = (value: unknown): number | null => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

const getCoordinates = (record: JsonRecord): { lat: number; lng: number } | null => {
  const nested = isRecord(record.gps_coordinates) ? record.gps_coordinates : undefined;
  const lat = getNumber(record.latitude ?? record.lat ?? nested?.latitude);
  const lng = getNumber(record.longitude ?? record.lng ?? nested?.longitude);

  return lat !== null && lng !== null ? { lat, lng } : null;
};

const getAddressParts = (address: string): string[] =>
  address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const normalizeProviderResult = (
  raw: JsonRecord,
  query: string,
  index: number
): DestinationSearchResult | null => {
  const coordinates = getCoordinates(raw);
  if (!coordinates) return null;

  const name = getString(raw, 'title', 'name') || query;
  const formattedAddress = getString(raw, 'address', 'description');
  const addressParts = getAddressParts(formattedAddress);
  const city = getString(raw, 'city', 'locality') || addressParts[0] || name;
  const country = getString(raw, 'country') || addressParts[addressParts.length - 1] || '';
  const region =
    getString(raw, 'state', 'region', 'administrative_area') ||
    (addressParts.length > 2 ? addressParts[addressParts.length - 2] : '');
  const placeId = getString(raw, 'place_id', 'placeId') || undefined;
  const id = placeId
    ? `serpapi:${placeId}`
    : `serpapi:${city.toLowerCase()}:${coordinates.lat.toFixed(5)}:${coordinates.lng.toFixed(5)}:${index}`;

  return {
    id,
    name,
    city,
    country,
    region,
    formattedAddress: formattedAddress || [city, region, country].filter(Boolean).join(', '),
    lat: coordinates.lat,
    lng: coordinates.lng,
    placeId,
    source: 'live',
  };
};

export const searchSerpApiDestinations = async (
  query: string
): Promise<DestinationSearchResult[]> => {
  const apiKey = process.env.SERPAPI_KEY?.trim();
  if (!apiKey) {
    throw new ApiError(
      503,
      'Destination search is not configured on the server.',
      'DESTINATION_SEARCH_NOT_CONFIGURED'
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const url = new URL(SERP_API_URL);
  url.searchParams.set('engine', 'google_maps');
  url.searchParams.set('type', 'search');
  url.searchParams.set('q', query);
  url.searchParams.set('hl', 'en');
  url.searchParams.set('api_key', apiKey);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const payload = (await response.json().catch(() => ({}))) as unknown;

    if (!response.ok || (isRecord(payload) && typeof payload.error === 'string')) {
      console.error('Destination provider request failed.', { status: response.status });
      throw new ApiError(
        502,
        'Destination search is temporarily unavailable.',
        'DESTINATION_PROVIDER_ERROR'
      );
    }

    const localResults = isRecord(payload) && Array.isArray(payload.local_results)
      ? payload.local_results
      : [];

    return localResults
      .filter(isRecord)
      .map((result, index) => normalizeProviderResult(result, query, index))
      .filter((result): result is DestinationSearchResult => result !== null)
      .slice(0, 8);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error('Destination provider request failed.', {
      reason: isTimeout ? 'timeout' : 'network',
    });
    throw new ApiError(
      504,
      isTimeout
        ? 'Destination search took too long to respond.'
        : 'Destination search is temporarily unavailable.',
      isTimeout ? 'DESTINATION_PROVIDER_TIMEOUT' : 'DESTINATION_PROVIDER_ERROR'
    );
  } finally {
    clearTimeout(timeout);
  }
};
