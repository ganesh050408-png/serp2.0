import { DestinationInfo } from './destinations';

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';

export interface JourneyCollaborator {
  id: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'invited';
}

export type ExpenseCategory =
  | 'transport'
  | 'accommodation'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'rentals'
  | 'emergency'
  | 'other';

export interface JourneyExpense {
  id: string;
  title?: string;
  description?: string;
  amount: number;
  category: ExpenseCategory | string;
  date: string;
  paidBy?: string;
  splitAmong?: string[];
  notes?: string;
}

export interface JourneyBudgetPlanner {
  totalBudget: number;
  currency: string;
  travelersCount: number;
  categories: Record<ExpenseCategory, number>;
  expenses: JourneyExpense[];
}

export type BookingType = 'flight' | 'train' | 'bus' | 'taxi' | 'hotel' | 'activity';

export interface StoredBooking {
  id: string;
  type: BookingType;
  title: string;
  provider: string;
  bookingReference?: string;
  route: string;
  departureDate: string;
  returnDate?: string;
  departureTime?: string;
  arrivalTime?: string;
  cost: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'saved';
  bookingUrl?: string;
  notes?: string;
  createdAt: string;
}

export type PlaceCategory = 'hotel' | 'hostel' | 'resort' | 'club' | 'shopping' | 'restaurant' | 'activity';

export interface SavedPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  city?: string;
  address: string;
  rating?: number;
  priceLevel?: number | '$' | '$$' | '$$$' | '$$$$';
  image?: string;
  lat?: number;
  lng?: number;
  distance?: string;
  openingHours?: string;
  bookingUrl?: string;
  phone?: string;
  website?: string;
  savedAt?: string;
  notes?: string;
}

export interface NearbyHospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  emergency?: boolean;
}

export type NotificationType = 'trip' | 'weather' | 'budget' | 'flight' | 'train' | 'collaborator' | 'reminder' | 'emergency' | 'departure';

export interface StoredNotification {
  id: string;
  journeyId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}

export interface JourneyShareSettings {
  isPublic: boolean;
  shareToken: string;
  allowedSections: {
    itinerary: boolean;
    dates: boolean;
    budget: boolean;
    hotels: boolean;
    transport: boolean;
    activities: boolean;
    bookings: boolean;
    notes: boolean;
    collaborators: boolean;
  };
}

export interface ActivityItem {
  id: string;
  name: string;
  startTime?: string; // "HH:MM" e.g., "09:00"
  endTime?: string;   // "HH:MM" e.g., "10:30"
  location?: string;
  cost?: number;
  description?: string;
}

export type ActivityType = string | ActivityItem;

export interface ItineraryDay {
  dayNumber: number;
  date: string; // e.g. "12 Jun" or "Day 1"
  city: string;
  activities: Array<string | ActivityItem>;
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
  updatedAt?: string;
  status: 'Planning' | 'Upcoming' | 'Completed';
  
  // Expanded unified data fields
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
  budgetPlanner?: JourneyBudgetPlanner;
  interests?: string[];
  pace?: string;
  travelType?: 'friends' | 'family' | 'solo';
  collaborators?: JourneyCollaborator[];
  members?: Array<{ id: string; name: string; role?: string }>;
  expenses?: JourneyExpense[];
  itinerary?: ItineraryDay[];
  coverImage?: string;
  transportation?: StoredTransportItem[];
  bookings?: StoredBooking[];
  savedPlaces?: SavedPlace[];
  notifications?: StoredNotification[];
  shareSettings?: JourneyShareSettings;
  notes?: string;
}

export interface StoredTransportItem {
  id: string;
  type: 'bike' | 'flight' | 'train' | 'car' | 'bus' | 'taxi';
  title: string;
  subtitle: string;
  route: string;
  dates: string;
  cost: string;
  details: string;
  createdAt: string;
  bookingUrl?: string;
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
  // Sensitive profile field with strict privacy defaults
  religion?: string;
  religionPrivate?: boolean;
  allowReligiousRecommendations?: boolean;
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
  religion: 'Prefer not to say',
  religionPrivate: true,
  allowReligiousRecommendations: false,
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
];

const normalizeJourney = (j: any): StoredJourney => {
  if (!j) return j;
  
  const totalBudgetValue = j.budgetValue?.amount ?? (typeof j.budget === 'number' ? j.budget : 50000);
  const currencySymbol = '₹';

  // Ensure budget planner exists
  const budgetPlanner: JourneyBudgetPlanner = j.budgetPlanner || {
    totalBudget: totalBudgetValue,
    currency: currencySymbol,
    travelersCount: j.travelers || 2,
    categories: {
      transport: Math.round(totalBudgetValue * 0.25),
      accommodation: Math.round(totalBudgetValue * 0.35),
      food: Math.round(totalBudgetValue * 0.18),
      activities: Math.round(totalBudgetValue * 0.12),
      shopping: Math.round(totalBudgetValue * 0.05),
      rentals: 0,
      emergency: Math.round(totalBudgetValue * 0.05),
      other: 0,
    },
    expenses: j.expenses || [],
  };

  // Ensure default collaborators include owner
  const collaborators: JourneyCollaborator[] = j.collaborators && j.collaborators.length > 0
    ? j.collaborators
    : [
        {
          id: 'collab_owner',
          name: 'You (Owner)',
          email: 'you@aethera.travel',
          role: 'owner',
          avatar: 'Y',
          joinedAt: j.createdAt || new Date().toISOString(),
          status: 'active',
        },
      ];

  // Ensure share settings
  const shareSettings: JourneyShareSettings = j.shareSettings || {
    isPublic: false,
    shareToken: crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `share_${Date.now().toString(36)}`,
    allowedSections: {
      itinerary: true,
      dates: true,
      budget: false,
      hotels: true,
      transport: true,
      activities: true,
      bookings: false,
      notes: false,
      collaborators: false,
    },
  };

  return {
    ...j,
    budgetPlanner,
    collaborators,
    shareSettings,
    bookings: j.bookings || [],
    savedPlaces: j.savedPlaces || [],
    notifications: j.notifications || [],
    itinerary: (j.itinerary || []).map((day: any) => ({
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
            cost: 0,
          };
        }
        return {
          id: act.id || (crypto.randomUUID ? crypto.randomUUID() : `act_${Math.random().toString(36).substr(2, 9)}`),
          name: act.name || '',
          startTime: act.startTime || '09:00',
          endTime: act.endTime || '10:30',
          location: act.location || day.city || '',
          description: act.description || '',
          cost: typeof act.cost === 'number' ? act.cost : 0,
        };
      }),
    })),
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
    const updatedJourney: StoredJourney = {
      ...journey,
      updatedAt: new Date().toISOString(),
    };
    const existsIndex = journeys.findIndex((j) => j.id === journey.id);
    let updated: StoredJourney[];
    if (existsIndex > -1) {
      journeys[existsIndex] = updatedJourney;
      updated = journeys;
    } else {
      updated = [updatedJourney, ...journeys];
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
      updatedAt: new Date().toISOString(),
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aethera:profile_updated', { detail: profile }));
    }
  },
  getNotifications: (journeyId?: string): StoredNotification[] => {
    const all = read<StoredNotification[]>(NOTIFICATIONS_KEY, []);
    if (!journeyId) return all;
    return all.filter((n) => !n.journeyId || n.journeyId === journeyId);
  },
  addNotification: (notification: StoredNotification) => {
    const notifications = read<StoredNotification[]>(NOTIFICATIONS_KEY, []);
    const updated = [notification, ...notifications];
    write(NOTIFICATIONS_KEY, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aethera:notifications_updated', { detail: updated }));
    }
  },
  markNotificationAsRead: (id: string) => {
    const notifications = read<StoredNotification[]>(NOTIFICATIONS_KEY, []);
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    write(NOTIFICATIONS_KEY, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aethera:notifications_updated', { detail: updated }));
    }
  },
  clearNotifications: (journeyId?: string) => {
    if (journeyId) {
      const notifications = read<StoredNotification[]>(NOTIFICATIONS_KEY, []);
      const updated = notifications.filter((n) => n.journeyId !== journeyId);
      write(NOTIFICATIONS_KEY, updated);
    } else {
      write(NOTIFICATIONS_KEY, []);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aethera:notifications_updated', { detail: [] }));
    }
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
  addBookingToJourney: (journeyId: string, booking: StoredBooking) => {
    const journeys = travelStorage.getJourneys();
    const target = journeys.find((j) => j.id === journeyId);
    if (target) {
      const existing = target.bookings || [];
      target.bookings = [booking, ...existing];
      travelStorage.saveJourney(target);
    }
  },
  addSavedPlaceToJourney: (journeyId: string, place: SavedPlace) => {
    const journeys = travelStorage.getJourneys();
    const target = journeys.find((j) => j.id === journeyId);
    if (target) {
      const existing = target.savedPlaces || [];
      if (!existing.some((p) => p.id === place.id || p.name === place.name)) {
        target.savedPlaces = [place, ...existing];
        travelStorage.saveJourney(target);
      }
    }
  },
  removeSavedPlaceFromJourney: (journeyId: string, placeId: string) => {
    const journeys = travelStorage.getJourneys();
    const target = journeys.find((j) => j.id === journeyId);
    if (target && target.savedPlaces) {
      target.savedPlaces = target.savedPlaces.filter((p) => p.id !== placeId);
      travelStorage.saveJourney(target);
    }
  },
  clearSession: () => {
    window.localStorage.removeItem('aethera.auth_token');
    window.localStorage.removeItem('aethera.session');
  },
};

export const parseBudget = (value: string) => {
  const parsed = Number(value.replace(/[^0-9]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
