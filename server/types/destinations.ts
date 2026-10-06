export interface DestinationSearchResult {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId?: string;
  source: 'live';
}
