import type {
  Trip,
  Activity,
  Expense,
  Collaborator,
  User,
  AppNotification,
  NewTripInput,
  NewActivityInput,
  NewExpenseInput,
} from './types';

// ---------------------------------------------------------------------------
// Shared helpers (used by every repository implementation)
// ---------------------------------------------------------------------------

/** Collision-resistant id with a readable prefix, e.g. "trip_9f2a1c0b4d7e". */
export const uid = (prefix = 'id'): string => {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `${prefix}_${rand.replace(/-/g, '').slice(0, 12)}`;
};

export const nowISO = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// The single seam between the app and its backend.
//
// localRepository.ts implements this over localStorage today. A future
// supabaseRepository.ts implements the exact same interface over Postgres +
// Realtime + Storage. Swapping is a one-line change in index.ts; no component,
// hook, or context is touched. Every mutation returns the fully-updated Trip so
// the TripContext can apply optimistic updates and roll back on rejection.
// ---------------------------------------------------------------------------
export interface TripRepository {
  // ── trips ───────────────────────────────────────────────────────────────
  listTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | null>;
  createTrip(input: NewTripInput): Promise<Trip>;
  updateTrip(id: string, patch: Partial<Trip>): Promise<Trip>;
  deleteTrip(id: string): Promise<void>;

  // ── itinerary: days & activities (feature H) ─────────────────────────────
  addDay(tripId: string, city: string): Promise<Trip>;
  addActivity(tripId: string, dayId: string, input: NewActivityInput): Promise<Trip>;
  updateActivity(
    tripId: string,
    dayId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Promise<Trip>;
  removeActivity(tripId: string, dayId: string, activityId: string): Promise<Trip>;
  /** Reorder within one day given the new full ordering of activity ids. */
  reorderActivities(tripId: string, dayId: string, orderedActivityIds: string[]): Promise<Trip>;
  /** Move one activity to another day, inserting at toIndex. */
  moveActivity(
    tripId: string,
    fromDayId: string,
    toDayId: string,
    activityId: string,
    toIndex: number,
  ): Promise<Trip>;

  // ── expenses (feature A) ─────────────────────────────────────────────────
  addExpense(tripId: string, input: NewExpenseInput): Promise<Trip>;
  updateExpense(tripId: string, expenseId: string, patch: Partial<Expense>): Promise<Trip>;
  removeExpense(tripId: string, expenseId: string): Promise<Trip>;

  // ── collaborators (feature B, single-device for now) ─────────────────────
  upsertCollaborator(tripId: string, collaborator: Collaborator): Promise<Trip>;
  removeCollaborator(tripId: string, userId: string): Promise<Trip>;

  // ── users / profile (feature F) ──────────────────────────────────────────
  getCurrentUser(): Promise<User>;
  updateCurrentUser(patch: Partial<User>): Promise<User>;
  listUsers(): Promise<User[]>;

  // ── notifications (feature E) ────────────────────────────────────────────
  listNotifications(): Promise<AppNotification[]>;
  addNotification(
    input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> &
      Partial<Pick<AppNotification, 'read'>>,
  ): Promise<AppNotification>;
  markNotificationRead(id: string): Promise<void>;
}
