// ============================================================================
// Aethera data model — local-first, Supabase-swap-ready.
//
// These interfaces mirror the target Postgres schema (spec §2) 1:1, so the
// only thing that changes when we move off localStorage is the repository
// *implementation* (localRepository.ts -> supabaseRepository.ts). Call sites,
// the TripContext, and every component stay identical.
//
// For local-first ergonomics the child collections (days, expenses, ...) are
// embedded on the Trip object. In Supabase these become foreign-key tables
// keyed by trip_id — the shapes below already carry those foreign keys.
// ============================================================================

export type TripStatus = 'planning' | 'live' | 'completed';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type CollaboratorStatus = 'active' | 'pending';
export type ActivityType = 'activity' | 'stay' | 'transport' | 'food' | 'shopping';
export type ExpenseCategory =
  | 'flight'
  | 'stay'
  | 'food'
  | 'transport'
  | 'activity'
  | 'shopping';
export type BookingType =
  | 'flight'
  | 'train'
  | 'bus'
  | 'taxi'
  | 'bike'
  | 'hotel'
  | 'hostel'
  | 'resort';
export type NotificationType =
  | 'reminder'
  | 'weather'
  | 'booking'
  | 'collaborator'
  | 'festival';

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  /** Optional. Powers dietary + cultural-site/festival recommendations only. */
  religion?: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// activities  (belongs to a trip_day)
// ---------------------------------------------------------------------------
export interface Activity {
  id: string;
  /** "09:30" — optional; free-form so it can read "Morning" etc. */
  time?: string;
  title: string;
  type: ActivityType;
  location?: string;
  notes?: string;
  orderIndex: number;
}

// ---------------------------------------------------------------------------
// trip_days  (belongs to a trip)
// ---------------------------------------------------------------------------
export interface TripDay {
  id: string;
  dayNumber: number;
  /** Friendly ("12 Jun") or ISO — display only. */
  date?: string;
  city: string;
  activities: Activity[];
}

// ---------------------------------------------------------------------------
// trip_collaborators
// ---------------------------------------------------------------------------
export interface Collaborator {
  userId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  invitedAt: string;
  joinedAt?: string;
}

// ---------------------------------------------------------------------------
// expenses
// ---------------------------------------------------------------------------
export interface Expense {
  id: string;
  addedByUserId: string;
  paidByUserId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  /** User ids the cost is split evenly across. Empty === "just me". */
  splitBetweenUserIds: string[];
  date: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// bookings
// ---------------------------------------------------------------------------
export interface Booking {
  id: string;
  type: BookingType;
  provider: string;
  referenceDetails: Record<string, unknown>;
  status: string;
  cost: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// trip_photos
// ---------------------------------------------------------------------------
export interface TripPhoto {
  id: string;
  uploadedByUserId: string;
  /** Object/data URL locally; Supabase Storage public URL later. */
  url: string;
  caption?: string;
  takenAt?: string;
  uploadedAt: string;
}

// ---------------------------------------------------------------------------
// trips  (aggregate root)
// ---------------------------------------------------------------------------
export interface Trip {
  id: string;
  ownerId: string;
  title: string;
  cities: string[];
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  status: TripStatus;
  currency: string;
  budgetTarget?: number | null;
  createdAt: string;
  updatedAt: string;

  // Embedded child collections (FK tables in Supabase).
  days: TripDay[];
  collaborators: Collaborator[];
  expenses: Expense[];
  bookings: Booking[];
  photos: TripPhoto[];
}

// ---------------------------------------------------------------------------
// notifications
// ---------------------------------------------------------------------------
export interface AppNotification {
  id: string;
  tripId: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Input payloads (what callers pass; ids/timestamps filled by the repository)
// ---------------------------------------------------------------------------
export interface NewTripInput {
  title: string;
  cities: string[];
  startDate?: string;
  endDate?: string;
  coverImage?: string;
  status?: TripStatus;
  currency?: string;
  budgetTarget?: number | null;
  days?: TripDay[];
}

export interface NewActivityInput {
  title: string;
  type?: ActivityType;
  time?: string;
  location?: string;
  notes?: string;
}

export interface NewExpenseInput {
  addedByUserId: string;
  paidByUserId: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  splitBetweenUserIds: string[];
  date?: string;
  note?: string;
}
