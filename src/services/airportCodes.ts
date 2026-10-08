// Comprehensive Airport and City IATA codes mapping for Google Flights search

export interface AirportInfo {
  code: string;
  city: string;
  name: string;
  country: string;
}

export const AIRPORT_DATABASE: Record<string, AirportInfo> = {
  // India - Major
  amd: { code: 'AMD', city: 'Ahmedabad (Gujarat)', name: 'Sardar Vallabhbhai Patel International Airport', country: 'India' },
  bom: { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
  del: { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  goi: { code: 'GOI', city: 'Goa (Dabolim)', name: 'Dabolim Airport', country: 'India' },
  gox: { code: 'GOX', city: 'Goa (Mopa)', name: 'Manohar International Airport', country: 'India' },
  blr: { code: 'BLR', city: 'Bengaluru / Bangalore', name: 'Kempegowda International Airport', country: 'India' },
  maa: { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India' },
  ccu: { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose International Airport', country: 'India' },
  hyd: { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India' },
  pnq: { code: 'PNQ', city: 'Pune', name: 'Pune International Airport', country: 'India' },
  jai: { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport', country: 'India' },
  cok: { code: 'COK', city: 'Kochi', name: 'Cochin International Airport', country: 'India' },
  vns: { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri Airport', country: 'India' },
  agr: { code: 'AGR', city: 'Agra', name: 'Agra Airport', country: 'India' },
  atq: { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee International Airport', country: 'India' },
  udr: { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport', country: 'India' },
  sxr: { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport', country: 'India' },
  ixc: { code: 'IXC', city: 'Chandigarh', name: 'Shaheed Bhagat Singh International Airport', country: 'India' },
  lko: { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International Airport', country: 'India' },
  pat: { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan Airport', country: 'India' },
  stv: { code: 'STV', city: 'Surat', name: 'Surat International Airport', country: 'India' },
  bdq: { code: 'BDQ', city: 'Vadodara', name: 'Vadodara Airport', country: 'India' },
  raj: { code: 'RAJ', city: 'Rajkot', name: 'Rajkot International Airport', country: 'India' },
  idr: { code: 'IDR', city: 'Indore', name: 'Devi Ahilyabai Holkar Airport', country: 'India' },
  bho: { code: 'BHO', city: 'Bhopal', name: 'Raja Bhoj Airport', country: 'India' },
  ded: { code: 'DED', city: 'Dehradun', name: 'Jolly Grant Airport', country: 'India' },
  gau: { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport', country: 'India' },
  ixl: { code: 'IXL', city: 'Leh', name: 'Kushok Bakula Rimpochee Airport', country: 'India' },
  trv: { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport', country: 'India' },
  cjb: { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International Airport', country: 'India' },
  vtz: { code: 'VTZ', city: 'Visakhapatnam', name: 'Visakhapatnam International Airport', country: 'India' },
  ixe: { code: 'IXE', city: 'Mangalore', name: 'Mangalore International Airport', country: 'India' },
  jdh: { code: 'JDH', city: 'Jodhpur', name: 'Jodhpur Airport', country: 'India' },
  jsa: { code: 'JSA', city: 'Jaisalmer', name: 'Jaisalmer Airport', country: 'India' },
  myq: { code: 'MYQ', city: 'Mysuru', name: 'Mysore Airport', country: 'India' },
  bbi: { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik Airport', country: 'India' },
  ixb: { code: 'IXB', city: 'Bagdogra / Siliguri', name: 'Bagdogra Airport', country: 'India' },
  ixj: { code: 'IXJ', city: 'Jammu', name: 'Jammu Airport', country: 'India' },
  ixr: { code: 'IXR', city: 'Ranchi', name: 'Birsa Munda Airport', country: 'India' },
  ixu: { code: 'IXU', city: 'Aurangabad', name: 'Chhatrapati Sambhajinagar Airport', country: 'India' },
  vga: { code: 'VGA', city: 'Vijayawada', name: 'Vijayawada International Airport', country: 'India' },
  tir: { code: 'TIR', city: 'Tirupati', name: 'Tirupati Airport', country: 'India' },
  trz: { code: 'TRZ', city: 'Tiruchirappalli', name: 'Tiruchirappalli International Airport', country: 'India' },
  ixm: { code: 'IXM', city: 'Madurai', name: 'Madurai Airport', country: 'India' },
  cnn: { code: 'CNN', city: 'Kannur', name: 'Kannur International Airport', country: 'India' },
  ccj: { code: 'CCJ', city: 'Kozhikode / Calicut', name: 'Calicut International Airport', country: 'India' },
  rpr: { code: 'RPR', city: 'Raipur', name: 'Swami Vivekananda Airport', country: 'India' },

  // International - Major
  dxb: { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates' },
  lhr: { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
  cdg: { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
  jfk: { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'United States' },
  sfo: { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'United States' },
  lax: { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'United States' },
  sin: { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
  bkk: { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
  hnd: { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
  nrt: { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
  kix: { code: 'KIX', city: 'Osaka', name: 'Kansai International Airport', country: 'Japan' },
  syd: { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
  mel: { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
  fco: { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci Airport', country: 'Italy' },
  zrh: { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  fra: { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  ams: { code: 'AMS', city: 'Amsterdam', name: 'Amsterdam Airport Schiphol', country: 'Netherlands' },
  bcn: { code: 'BCN', city: 'Barcelona', name: 'Josep Tarradellas Barcelona-El Prat Airport', country: 'Spain' },
  doh: { code: 'DOH', city: 'Doha', name: 'Hamad International Airport', country: 'Qatar' },
  yyz: { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada' },
  icn: { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },
  dps: { code: 'DPS', city: 'Bali', name: 'Ngurah Rai International Airport', country: 'Indonesia' },
};

/**
 * Common state, union territory, and regional mappings to primary hub airports
 */
const REGIONAL_PRIMARY_AIRPORTS: Record<string, string> = {
  gujarat: 'AMD',
  kerala: 'COK',
  rajasthan: 'JAI',
  karnataka: 'BLR',
  'tamil nadu': 'MAA',
  tamilnadu: 'MAA',
  maharashtra: 'BOM',
  'west bengal': 'CCU',
  bengal: 'CCU',
  'uttar pradesh': 'LKO',
  up: 'LKO',
  ladakh: 'IXL',
  kashmir: 'SXR',
  jammu: 'IXJ',
  'jammu and kashmir': 'SXR',
  uttarakhand: 'DED',
  'himachal pradesh': 'IXC',
  himachal: 'IXC',
  punjab: 'ATQ',
  haryana: 'DEL',
  odisha: 'BBI',
  orissa: 'BBI',
  assam: 'GAU',
  bihar: 'PAT',
  'madhya pradesh': 'BHO',
  mp: 'BHO',
  telangana: 'HYD',
  'andhra pradesh': 'VTZ',
  andhra: 'VTZ',
  goa: 'GOI',
};

/**
 * Check if a 3-letter code is a known IATA airport in our database
 */
export function isKnownAirportCode(code: string): boolean {
  if (!code) return false;
  return Boolean(AIRPORT_DATABASE[code.toLowerCase()]);
}

/**
 * Resolve a city name, state, airport name, or code string into a valid 3-letter IATA code.
 * E.g. "Gujarat" -> "AMD", "Ahmedabad" -> "AMD", "Goa" -> "GOI", "DEL" -> "DEL"
 */
export function resolveAirportCode(input: string): string {
  if (!input) return '';
  const clean = input.trim();
  const directKey = clean.toLowerCase();

  // 1. Check if string contains bracketed code e.g. "Ahmedabad (AMD)"
  const bracketMatch = clean.match(/\(([A-Z]{3})\)/i);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1].toUpperCase();
  }

  // 2. Check if clean string is already a known 3-letter IATA code
  if (AIRPORT_DATABASE[directKey]) {
    return AIRPORT_DATABASE[directKey].code;
  }

  // 3. Check regional and state mappings (e.g. "Gujarat" -> "AMD", "Kerala" -> "COK")
  for (const [region, code] of Object.entries(REGIONAL_PRIMARY_AIRPORTS)) {
    if (directKey === region || directKey.includes(region) || region.includes(directKey)) {
      return code;
    }
  }

  // 4. Special city aliases
  if (directKey.includes('delhi') || directKey.includes('new delhi')) return 'DEL';
  if (directKey.includes('mumbai') || directKey.includes('bombay')) return 'BOM';
  if (directKey.includes('bangalore') || directKey.includes('bengaluru')) return 'BLR';
  if (directKey.includes('calcutta') || directKey.includes('kolkata')) return 'CCU';
  if (directKey.includes('madras') || directKey.includes('chennai')) return 'MAA';
  if (directKey.includes('cochin') || directKey.includes('kochi')) return 'COK';
  if (directKey.includes('goa')) return 'GOI';
  if (directKey.includes('ahmedabad')) return 'AMD';
  if (directKey.includes('jaipur')) return 'JAI';

  // 5. Search database by city name or airport name
  for (const info of Object.values(AIRPORT_DATABASE)) {
    if (
      info.city.toLowerCase() === directKey ||
      directKey.includes(info.city.toLowerCase()) ||
      info.city.toLowerCase().includes(directKey) ||
      info.name.toLowerCase().includes(directKey)
    ) {
      return info.code;
    }
  }

  // 6. If the user explicitly typed a 3-letter string (e.g. "JFK", "DXB"), return it uppercase
  if (/^[a-zA-Z]{3}$/.test(clean)) {
    return clean.toUpperCase();
  }

  // 7. Fallback: return uppercase of first 3 alpha chars, or clean uppercase
  const alphaOnly = clean.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
  return alphaOnly || clean.toUpperCase();
}

/**
 * Search the airport database for matching airports (autocomplete)
 */
export function searchAirports(query: string, limit = 6): AirportInfo[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();
  const results: AirportInfo[] = [];

  // Exact code match first
  if (AIRPORT_DATABASE[q]) {
    results.push(AIRPORT_DATABASE[q]);
  }

  for (const info of Object.values(AIRPORT_DATABASE)) {
    if (results.some((r) => r.code === info.code)) continue;
    if (
      info.code.toLowerCase().startsWith(q) ||
      info.city.toLowerCase().includes(q) ||
      info.name.toLowerCase().includes(q) ||
      info.country.toLowerCase().includes(q)
    ) {
      results.push(info);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Get readable display name for an airport code or city
 */
export function getAirportDisplayName(codeOrCity: string): string {
  const code = resolveAirportCode(codeOrCity);
  const info = AIRPORT_DATABASE[code.toLowerCase()];
  if (info) {
    return `${info.city} (${info.code})`;
  }
  return codeOrCity;
}
