import { DestinationInfo } from './destinations';

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
  city?: string;
  state?: string;
  country?: string;
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
  travelType?: 'friends' | 'family' | 'solo';
  members?: Array<{ id: string; name: string; role?: string }>;
  expenses?: any[];
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
    const raw = read<StoredJourney[]>(JOURNEYS_KEY, []);
    // Filter out old fake/demo seeded mock journeys (e.g. mock ID '1', '2', '3', '4' or hardcoded mock 'GOA · MUMBAI · DELHI')
    const valid = raw.filter(
      (j) =>
        j &&
        j.id &&
        j.id !== '1' &&
        j.id !== '2' &&
        j.id !== '3' &&
        j.id !== '4' &&
        j.destination !== 'GOA · MUMBAI · DELHI'
    );
    return valid.map(normalizeJourney);
  },
  getJourneyById: (id: string): StoredJourney | undefined => {
    const journeys = travelStorage.getJourneys();
    return journeys.find((j) => j.id === id);
  },
  saveJourney: (journey: StoredJourney) => {
    const journeys = travelStorage.getJourneys();
    const existsIndex = journeys.findIndex((j) => j.id === journey.id);
    let updated: StoredJourney[];
    if (existsIndex > -1) {
      journeys[existsIndex] = journey;
      updated = journeys;
    } else {
      updated = [journey, ...journeys];
    }
    write(JOURNEYS_KEY, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aethera:journeys_updated', { detail: updated }));
    }
  },
  deleteJourney: (id: string) => {
    const journeys = travelStorage.getJourneys();
    const filtered = journeys.filter((j) => j.id !== id);
    write(JOURNEYS_KEY, filtered);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aethera:journeys_updated', { detail: filtered }));
    }
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
