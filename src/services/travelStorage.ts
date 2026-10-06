import { DestinationInfo, getOrCreateDestination } from './destinations';

export interface ActivityItem {
  id: string;
  name: string;
  startTime: string; // "HH:MM" e.g., "09:00"
  endTime: string;   // "HH:MM" e.g., "10:30"
  location: string;
  cost?: number;
  description?: string;
}

export type ActivityType = string | ActivityItem;

export interface ItineraryDay {
  dayNumber: number;
  date: string; // e.g. "12 Jun" or "Day 1"
  city: string;
  activities: any[];
}

export interface StoredJourney {
  id: string;
  destination: string; // Comma or dot-separated string for compatibility, e.g. "MUMBAI · GOA · JAIPUR"
  budget: number; // For compatibility
  travelers: number; // For compatibility
  style: string; // For compatibility
  createdAt: string;
  status: 'Planning' | 'Upcoming' | 'Completed';
  
  // Expanded fields for the "Plan a New Journey" flow
  destinations?: DestinationInfo[];
  startDate?: string;
  endDate?: string;
  datesDecided?: boolean;
  travellersBreakdown?: {
    adults: number;
    children: number;
  };
  budgetValue?: {
    amount: number | null;
    label: string; // e.g. "₹50,000" or "I'll decide later"
  };
  interests?: string[];
  pace?: string;
  itinerary?: ItineraryDay[];
  coverImage?: string;
  transportation?: StoredTransportItem[];
}

export interface StoredTransportItem {
  id: string;
  type: 'bike' | 'flight';
  title: string;
  subtitle: string;
  route: string;
  dates: string;
  cost: string;
  details: string;
  createdAt: string;
}

export interface StoredNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  location: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  tags: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  passportValidity: string;
  travelStyle: string[];
  savedDestinations: string[];
  currency: string;
  language: string;
}

const JOURNEYS_KEY = 'aethera.journeys';
const NOTIFICATIONS_KEY = 'aethera.notifications';
const JOURNAL_KEY = 'aethera.journal';
const PROFILE_KEY = 'aethera.profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Aravind S.',
  email: 'aravind.s@aethera.travel',
  phone: '+91 98401 23456',
  avatar: 'A',
  bio: 'Architectural writer & slow travel curator based in Chennai. Exploring coastal sanctuaries and heritage corridors.',
  passportValidity: 'Valid until Nov 2031',
  travelStyle: ['Coastal & Heritage', 'Architectural & Art', 'Gastronomy & Local Life', 'Slow Mountain Sanctuaries'],
  savedDestinations: ['Goa', 'Ladakh', 'Kyoto', 'Amalfi Coast', 'Zermatt', 'Udaipur'],
  currency: 'INR (₹)',
  language: 'English',
};

const DEFAULT_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j1',
    title: 'Terracotta Rooflines & The Sound of Sal River',
    location: 'Fontainhas, Goa',
    date: '14 June 2026',
    excerpt: 'Morning light piercing the oyster-shell windows of Rua de 31 de Janeiro while the scent of warm Bebinca drifts across the cobblestones.',
    content: 'Waking up before the heat settles over Panaji. The narrow alleys of the Latin Quarter are quiet except for the bakers delivering crusty Poi on bicycles. We spent two hours sketching the wrought-iron balconies and indigo azulejo tiles before heading south toward the Sal river mouth.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    tags: ['Goa', 'Architecture', 'Morning Walk'],
  },
  {
    id: 'j2',
    title: 'Cobalt Skies Over Thiksey Monastery',
    location: 'Leh Valley, Ladakh',
    date: '02 May 2026',
    excerpt: 'Twelve tiers of whitewashed monastic halls rising like a fortress above the Indus floodplain at 11,800 feet.',
    content: 'The morning puja chants resonate through the prayer hall as butter lamps flicker against centuries-old thangkas. The air is sharp and pure. Standing on the roof terrace, the snow-capped Stok range fills the horizon in breathless clarity.',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop',
    tags: ['Ladakh', 'Monasteries', 'Mountains'],
  },
  {
    id: 'j3',
    title: 'The Art Deco Facades of Oval Maidan',
    location: 'South Mumbai',
    date: '18 March 2026',
    excerpt: 'A seamless transition from Victorian Gothic spires to 1930s nautical streamlined balconies along Maharshi Karve Road.',
    content: 'Mumbai dusk along the perimeter of the Oval Maidan. On one side, the Victorian clock tower casts long shadows across cricket pitches; on the other, the second largest collection of Art Deco apartment blocks in the world begins to glow.',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop',
    tags: ['Mumbai', 'Art Deco', 'Heritage'],
  },
];

const normalizeJourney = (j: any): StoredJourney => {
  if (!j.itinerary) return j;
  return {
    ...j,
    itinerary: j.itinerary.map((day: any) => ({
      ...day,
      activities: (day.activities || []).map((act: any) => {
        if (typeof act === 'string') {
          return {
            id: crypto.randomUUID ? crypto.randomUUID() : `act_${Math.random().toString(36).substr(2, 9)}`,
            name: act,
            startTime: '09:00',
            endTime: '10:30',
            location: day.city || '',
            description: '',
            cost: 0
          };
        }
        return {
          id: act.id || (crypto.randomUUID ? crypto.randomUUID() : `act_${Math.random().toString(36).substr(2, 9)}`),
          name: act.name || '',
          startTime: act.startTime || '09:00',
          endTime: act.endTime || '10:30',
          location: act.location || day.city || '',
          description: act.description || '',
          cost: typeof act.cost === 'number' ? act.cost : 0
        };
      })
    }))
  };
};

const RAW_SEEDED_JOURNEYS = [
  {
    id: '1',
    destination: 'GOA · MUMBAI · DELHI',
    budget: 54800,
    travelers: 4,
    style: 'Coastal · Heritage · Architecture',
    createdAt: '2026-06-01T10:00:00.000Z',
    status: 'Upcoming',
    destinations: [
      getOrCreateDestination('Goa'),
      getOrCreateDestination('Mumbai'),
      getOrCreateDestination('Delhi'),
    ],
    startDate: '2026-06-12',
    endDate: '2026-06-21',
    datesDecided: true,
    travellersBreakdown: { adults: 4, children: 0 },
    budgetValue: { amount: 54800, label: '₹54,800' },
    interests: ['culture', 'food', 'relaxed', 'heritage'],
    pace: 'balanced',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    itinerary: [
      {
        dayNumber: 1,
        date: '12 Jun',
        city: 'Goa',
        activities: [
          'Arrival at Goa Airport & check-in at Panaji Heritage Villa',
          'Evening leisurely stroll through Fontainhas Latin Quarter',
          'Welcome seafood dinner at The Black Sheep Bistro',
        ],
      },
      {
        dayNumber: 2,
        date: '13 Jun',
        city: 'Goa',
        activities: [
          'Old Goa UNESCO churches & Basilica of Bom Jesus walk',
          'Organic spice plantation luncheon & river cruise',
          'Sunset drinks overlooking Miramar beach promontory',
        ],
      },
      {
        dayNumber: 3,
        date: '14 Jun',
        city: 'Goa',
        activities: [
          'Morning private catamaran charter along Baga coast',
          'Artisan pottery workshop in Assagao village',
          'Fort Aguada 17th-century bastion exploration & lighthouse',
          'Anjuna cliffside dinner at sunset',
        ],
      },
      {
        dayNumber: 4,
        date: '15 Jun',
        city: 'Goa → Mumbai',
        activities: [
          'Leisurely breakfast & checkout from heritage estate',
          'Scenic Vande Bharat coastal rail transition to Mumbai',
          'Evening Marine Drive promenade stroll & sea view check-in',
        ],
      },
      {
        dayNumber: 5,
        date: '16 Jun',
        city: 'Mumbai',
        activities: [
          'Kala Ghoda Art precinct gallery walk & boutique shopping',
          'Heritage architectural tour of Victoria Terminus & Fort',
          'Contemporary dinner at Bombay Canteen, Lower Parel',
        ],
      },
      {
        dayNumber: 6,
        date: '17 Jun',
        city: 'Mumbai',
        activities: [
          'Early morning boat excursion to Elephanta Island Caves',
          'Bandra Art Deco bungalow tour & seaside cafe lunch',
          'Sunset cocktail reception overlooking Bandra-Worli Sea Link',
        ],
      },
      {
        dayNumber: 7,
        date: '18 Jun',
        city: 'Mumbai → Delhi',
        activities: [
          'Morning flight to New Delhi & Lutyens check-in',
          'Afternoon garden walk at Humayun’s Tomb gardens',
          'Traditional Mughlai dinner in Sundar Nagar',
        ],
      },
      {
        dayNumber: 8,
        date: '19 Jun',
        city: 'Delhi',
        activities: [
          'Cycle rickshaw heritage food crawl in Old Delhi & Chandni Chowk',
          'Qutub Minar architectural park & Mehrauli ruins',
          'Contemporary Indian dining at Indian Accent',
        ],
      },
      {
        dayNumber: 9,
        date: '20 Jun',
        city: 'Delhi',
        activities: [
          'Lodhi Art District public mural photo excursion',
          'Handicraft and artisan shopping at Dilli Haat',
          'Farewell banquet in Chanakyapuri diplomatic enclave',
        ],
      },
      {
        dayNumber: 10,
        date: '21 Jun',
        city: 'Delhi',
        activities: [
          'Slow morning breakfast & travel journal wrap-up',
          'Airport departure transfers for return voyage',
        ],
      },
    ],
  },
  {
    id: '2',
    destination: 'RAJASTHAN',
    budget: 72000,
    travelers: 3,
    style: 'Heritage · Royal Havelis · Desert',
    createdAt: '2026-06-05T10:00:00.000Z',
    status: 'Planning',
    destinations: [
      getOrCreateDestination('Jaipur'),
      getOrCreateDestination('Udaipur'),
    ],
    startDate: '2026-08-02',
    endDate: '2026-08-11',
    datesDecided: true,
    travellersBreakdown: { adults: 3, children: 0 },
    budgetValue: { amount: 72000, label: '₹72,000' },
    interests: ['heritage', 'culture', 'photography', 'food'],
    pace: 'balanced',
    coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
    itinerary: [
      {
        dayNumber: 1,
        date: '02 Aug',
        city: 'Jaipur',
        activities: [
          'Arrival at Jaipur Pink City Haveli & rose water reception',
          'Golden hour photo walk at Hawa Mahal facade',
          'Rooftop dinner overlooking City Palace',
        ],
      },
      {
        dayNumber: 2,
        date: '03 Aug',
        city: 'Jaipur',
        activities: [
          'Amber Fort morning jeep ascent & Sheesh Mahal mirrored hall',
          'Panna Meena ka Kund ancient stepwell photo study',
          'Traditional block-printing artisan workshop in Bagru',
        ],
      },
      {
        dayNumber: 3,
        date: '04 Aug',
        city: 'Udaipur',
        activities: [
          'Scenic royal highway drive to Lake City Udaipur',
          'Private boat cruise on Lake Pichola around Jag Mandir',
          'Lakeside dining with illuminated palace views',
        ],
      },
    ],
  },
  {
    id: '3',
    destination: 'KERALA',
    budget: 48000,
    travelers: 2,
    style: 'Backwaters · Misted Tea Hills · Wellness',
    createdAt: '2026-06-10T10:00:00.000Z',
    status: 'Planning',
    destinations: [getOrCreateDestination('Kerala')],
    startDate: '2026-09-18',
    endDate: '2026-09-25',
    datesDecided: true,
    travellersBreakdown: { adults: 2, children: 0 },
    budgetValue: { amount: 48000, label: '₹48,000' },
    interests: ['nature', 'wellness', 'relaxed', 'food'],
    pace: 'slow',
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    itinerary: [
      {
        dayNumber: 1,
        date: '18 Sep',
        city: 'Fort Kochi',
        activities: [
          'Check-in at Dutch colonial waterfront boutique retreat',
          'Sunset viewing of Chinese Fishing Nets',
          'Authentic seafood dinner with Malabar spices',
        ],
      },
      {
        dayNumber: 2,
        date: '19 Sep',
        city: 'Alleppey',
        activities: [
          'Boarding private luxury teakwood houseboat in Alleppey',
          'Slow cruise through palm-shaded canals and paddy fields',
          'Ayurvedic herbal massage and herbal oil treatments',
        ],
      },
    ],
  },
  {
    id: '4',
    destination: 'LADAKH',
    budget: 65000,
    travelers: 2,
    style: 'High-Altitude Monasteries · Glacial Valleys',
    createdAt: '2026-06-15T10:00:00.000Z',
    status: 'Planning',
    destinations: [getOrCreateDestination('Srinagar')],
    startDate: '2026-10-05',
    endDate: '2026-10-14',
    datesDecided: true,
    travellersBreakdown: { adults: 2, children: 0 },
    budgetValue: { amount: 65000, label: '₹65,000' },
    interests: ['nature', 'adventure', 'photography', 'culture'],
    pace: 'slow',
    coverImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800&auto=format&fit=crop',
    itinerary: [
      {
        dayNumber: 1,
        date: '05 Oct',
        city: 'Leh',
        activities: [
          'Arrival at Leh Airport (11,500 ft) & gentle acclimation rest',
          'Slow evening herbal tea and sunset at Shanti Stupa',
        ],
      },
      {
        dayNumber: 2,
        date: '06 Oct',
        city: 'Leh',
        activities: [
          'Morning prayer ceremony at Thiksey Monastery',
          'Hemis Gompa ancient museum and sacred courtyards',
          'Stargazing night session under high Himalayan skies',
        ],
      },
    ],
  },
];

const DEFAULT_SEEDED_JOURNEYS: StoredJourney[] = RAW_SEEDED_JOURNEYS.map(normalizeJourney);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const travelStorage = {
  getJourneys: (): StoredJourney[] => {
    const journeys = read<StoredJourney[]>(JOURNEYS_KEY, []);
    if (journeys.length === 0) {
      write(JOURNEYS_KEY, DEFAULT_SEEDED_JOURNEYS);
      return DEFAULT_SEEDED_JOURNEYS.map(normalizeJourney);
    }
    return journeys.map(normalizeJourney);
  },
  getJourneyById: (id: string): StoredJourney | undefined => {
    const journeys = travelStorage.getJourneys();
    return journeys.find((j) => j.id === id);
  },
  saveJourney: (journey: StoredJourney) => {
    const journeys = travelStorage.getJourneys();
    const existsIndex = journeys.findIndex((j) => j.id === journey.id);
    if (existsIndex > -1) {
      journeys[existsIndex] = journey;
      write(JOURNEYS_KEY, journeys);
    } else {
      write(JOURNEYS_KEY, [journey, ...journeys]);
    }
  },
  deleteJourney: (id: string) => {
    const journeys = travelStorage.getJourneys();
    const filtered = journeys.filter((j) => j.id !== id);
    write(JOURNEYS_KEY, filtered);
  },
  duplicateJourney: (id: string): StoredJourney | null => {
    const journeys = travelStorage.getJourneys();
    const target = journeys.find((j) => j.id === id);
    if (!target) return null;
    const duplicated: StoredJourney = {
      ...target,
      id: crypto.randomUUID ? crypto.randomUUID() : `journey_${Date.now()}`,
      destination: `${target.destination} (COPY)`,
      createdAt: new Date().toISOString(),
      status: 'Planning',
    };
    travelStorage.saveJourney(duplicated);
    return duplicated;
  },
  getJournalEntries: (): JournalEntry[] => {
    const entries = read<JournalEntry[]>(JOURNAL_KEY, []);
    if (entries.length === 0) {
      write(JOURNAL_KEY, DEFAULT_JOURNAL_ENTRIES);
      return DEFAULT_JOURNAL_ENTRIES;
    }
    return entries;
  },
  saveJournalEntry: (entry: JournalEntry) => {
    const entries = travelStorage.getJournalEntries();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx > -1) {
      entries[idx] = entry;
      write(JOURNAL_KEY, entries);
    } else {
      write(JOURNAL_KEY, [entry, ...entries]);
    }
  },
  deleteJournalEntry: (id: string) => {
    const entries = travelStorage.getJournalEntries();
    write(JOURNAL_KEY, entries.filter((e) => e.id !== id));
  },
  getProfile: (): UserProfile => {
    return read<UserProfile>(PROFILE_KEY, DEFAULT_PROFILE);
  },
  saveProfile: (profile: UserProfile) => {
    write(PROFILE_KEY, profile);
  },
  getNotifications: (): StoredNotification[] => read<StoredNotification[]>(NOTIFICATIONS_KEY, []),
  addNotification: (notification: StoredNotification) => {
    const notifications = travelStorage.getNotifications();
    write(NOTIFICATIONS_KEY, [notification, ...notifications]);
  },
  addTransportToJourney: (journeyId: string, item: StoredTransportItem) => {
    const journeys = travelStorage.getJourneys();
    const target = journeys.find((j) => j.id === journeyId);
    if (target) {
      const existing = target.transportation || [];
      target.transportation = [item, ...existing];
      travelStorage.saveJourney(target);
    }
  },
  clearSession: () => {
    // Session logout: reset current user session tokens
    window.localStorage.removeItem('aethera.auth_token');
    window.localStorage.removeItem('aethera.session');
  },
};

export const parseBudget = (value: string) => {
  const parsed = Number(value.replace(/[^0-9]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
