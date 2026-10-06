import type { Trip, TripDay, Activity, User, Expense, Collaborator } from './types';
import { uid } from './repository';

// ============================================================================
// Seed data — a fully-formed demo trip so the app is never empty and every
// flagship feature (itinerary, budget/splitting, weather, festivals, PDF) has
// real data to render on first load. Matches the app's existing narrative:
// "Goa · Mumbai · Delhi", live on Day 4 of 10, four travelling companions.
// ============================================================================

export const SEED_USERS: User[] = [
  {
    id: 'user_aravind',
    name: 'Aravind S.',
    email: 'aravind@aethera.travel',
    avatarUrl: undefined,
    religion: null,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'user_rahul',
    name: 'Rahul M.',
    email: 'rahul@aethera.travel',
    createdAt: '2026-08-01T09:05:00.000Z',
  },
  {
    id: 'user_priya',
    name: 'Priya K.',
    email: 'priya@aethera.travel',
    createdAt: '2026-08-01T09:06:00.000Z',
  },
  {
    id: 'user_arjun',
    name: 'Arjun D.',
    email: 'arjun@aethera.travel',
    createdAt: '2026-08-01T09:07:00.000Z',
  },
];

export const SEED_CURRENT_USER_ID = 'user_aravind';

const COLLABORATORS: Collaborator[] = [
  {
    userId: 'user_aravind',
    name: 'Aravind S.',
    email: 'aravind@aethera.travel',
    role: 'owner',
    status: 'active',
    invitedAt: '2026-08-01T09:00:00.000Z',
    joinedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    userId: 'user_rahul',
    name: 'Rahul M.',
    email: 'rahul@aethera.travel',
    role: 'editor',
    status: 'active',
    invitedAt: '2026-08-02T10:00:00.000Z',
    joinedAt: '2026-08-02T12:30:00.000Z',
  },
  {
    userId: 'user_priya',
    name: 'Priya K.',
    email: 'priya@aethera.travel',
    role: 'editor',
    status: 'active',
    invitedAt: '2026-08-02T10:02:00.000Z',
    joinedAt: '2026-08-02T15:10:00.000Z',
  },
  {
    userId: 'user_arjun',
    name: 'Arjun D.',
    email: 'arjun@aethera.travel',
    role: 'viewer',
    status: 'active',
    invitedAt: '2026-08-02T10:05:00.000Z',
    joinedAt: '2026-08-03T08:00:00.000Z',
  },
];

// Compact day spec -> typed TripDay[]. Each entry: [city, [activity, type, time]].
type ActSpec = [title: string, type: Activity['type'], time: string];
const DAY_SPECS: Array<{ city: string; date: string; acts: ActSpec[] }> = [
  {
    city: 'Goa',
    date: '19 Aug',
    acts: [
      ['Arrival in Goa · boutique check-in at Fontainhas', 'stay', '13:00'],
      ['Private sunset catamaran sail off Panaji', 'activity', '17:30'],
    ],
  },
  {
    city: 'Goa',
    date: '20 Aug',
    acts: [
      ['Heritage walk · Old Goa & Latin Quarter', 'activity', '09:30'],
      ['Organic spice plantation tour & lunch', 'food', '13:00'],
    ],
  },
  {
    city: 'Goa',
    date: '21 Aug',
    acts: [
      ['Scuba diving & watersports at Grande Island', 'activity', '08:00'],
      ['Anjuna flea market browsing', 'shopping', '16:00'],
    ],
  },
  {
    city: 'Goa',
    date: '22 Aug',
    acts: [
      ['Fort Aguada & lighthouse visit', 'activity', '15:30'],
      ['Beach shack seafood dinner at Baga', 'food', '20:00'],
    ],
  },
  {
    city: 'Mumbai',
    date: '23 Aug',
    acts: [
      ['Vande Bharat coastal rail · Goa → Mumbai', 'transport', '07:10'],
      ['Marine Drive promenade at golden hour', 'activity', '18:30'],
    ],
  },
  {
    city: 'Mumbai',
    date: '24 Aug',
    acts: [
      ['Colaba & Kala Ghoda heritage architecture walk', 'activity', '10:00'],
      ['Late-night street food crawl at Chowpatty', 'food', '20:30'],
    ],
  },
  {
    city: 'Mumbai',
    date: '25 Aug',
    acts: [['Art gallery hopping in Fort precinct', 'activity', '11:00']],
  },
  {
    city: 'Delhi',
    date: '26 Aug',
    acts: [
      ['Morning flight · Mumbai → Delhi', 'transport', '08:15'],
      ['India Gate & Lodhi Art District walk', 'activity', '17:00'],
    ],
  },
  {
    city: 'Delhi',
    date: '27 Aug',
    acts: [
      ['Old Delhi street food tour by cycle rickshaw', 'food', '09:30'],
      ["Guided history walk · Humayun's Tomb gardens", 'activity', '15:00'],
    ],
  },
  {
    city: 'Delhi',
    date: '28 Aug',
    acts: [
      ['Handicraft shopping at Dilli Haat', 'shopping', '10:30'],
      ['Departure transfer to IGI Airport', 'transport', '16:00'],
    ],
  },
];

const buildDays = (): TripDay[] =>
  DAY_SPECS.map((spec, i) => ({
    id: uid('day'),
    dayNumber: i + 1,
    date: spec.date,
    city: spec.city,
    activities: spec.acts.map((a, idx) => ({
      id: uid('act'),
      title: a[0],
      type: a[1],
      time: a[2],
      orderIndex: idx,
    })),
  }));

const buildExpenses = (): Expense[] => [
  {
    id: uid('exp'),
    addedByUserId: 'user_rahul',
    paidByUserId: 'user_rahul',
    category: 'stay',
    amount: 24000,
    currency: 'INR',
    splitBetweenUserIds: ['user_aravind', 'user_rahul', 'user_priya', 'user_arjun'],
    date: '2026-08-19',
    note: 'Fontainhas boutique stay · 3 nights',
  },
  {
    id: uid('exp'),
    addedByUserId: 'user_aravind',
    paidByUserId: 'user_aravind',
    category: 'transport',
    amount: 8000,
    currency: 'INR',
    splitBetweenUserIds: ['user_aravind', 'user_rahul', 'user_priya', 'user_arjun'],
    date: '2026-08-19',
    note: 'Airport transfers & local cabs',
  },
  {
    id: uid('exp'),
    addedByUserId: 'user_priya',
    paidByUserId: 'user_priya',
    category: 'food',
    amount: 6400,
    currency: 'INR',
    splitBetweenUserIds: ['user_aravind', 'user_rahul', 'user_priya', 'user_arjun'],
    date: '2026-08-20',
    note: 'Spice plantation lunch',
  },
  {
    id: uid('exp'),
    addedByUserId: 'user_aravind',
    paidByUserId: 'user_aravind',
    category: 'activity',
    amount: 4500,
    currency: 'INR',
    splitBetweenUserIds: ['user_aravind', 'user_rahul'],
    date: '2026-08-21',
    note: 'Scuba diving (Aravind & Rahul)',
  },
  {
    id: uid('exp'),
    addedByUserId: 'user_arjun',
    paidByUserId: 'user_arjun',
    category: 'shopping',
    amount: 3200,
    currency: 'INR',
    splitBetweenUserIds: ['user_arjun'],
    date: '2026-08-21',
    note: 'Anjuna market — personal',
  },
];

export const buildSeedTrip = (): Trip => {
  const days = buildDays();
  return {
    id: 'trip_demo_gmd',
    ownerId: SEED_CURRENT_USER_ID,
    title: 'Goa · Mumbai · Delhi',
    cities: ['Goa', 'Mumbai', 'Delhi'],
    startDate: '2026-08-19',
    endDate: '2026-08-28',
    coverImage:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1200&auto=format&fit=crop',
    status: 'live',
    currency: 'INR',
    budgetTarget: 60000,
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-08-22T06:30:00.000Z',
    days,
    collaborators: COLLABORATORS,
    expenses: buildExpenses(),
    bookings: [],
    photos: [],
  };
};
