import type {
  Trip,
  Activity,
  User,
  AppNotification,
  TripDay,
  NewTripInput,
  NewActivityInput,
  NewExpenseInput,
  Expense,
  Collaborator,
} from './types';
import { type TripRepository, uid, nowISO } from './repository';
import { buildSeedTrip, SEED_USERS, SEED_CURRENT_USER_ID } from './seed';

// Versioned keys, namespaced away from the legacy travelStorage keys so the
// two layers coexist during the migration.
const K_TRIPS = 'aethera.db.trips.v1';
const K_USERS = 'aethera.db.users.v1';
const K_CURRENT_USER = 'aethera.db.currentUser.v1';
const K_NOTIFICATIONS = 'aethera.db.notifications.v1';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

const readRaw = <T>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeRaw = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded / unavailable — best-effort only */
  }
};

/**
 * localStorage-backed TripRepository. Synchronous under the hood but presents
 * an async surface so a future SupabaseTripRepository is a drop-in replacement.
 */
export class LocalTripRepository implements TripRepository {
  // ── seeding ──────────────────────────────────────────────────────────────
  private ensureSeeded(): void {
    if (localStorage.getItem(K_TRIPS) == null) writeRaw(K_TRIPS, [buildSeedTrip()]);
    if (localStorage.getItem(K_USERS) == null) writeRaw(K_USERS, SEED_USERS);
    if (localStorage.getItem(K_CURRENT_USER) == null)
      writeRaw(K_CURRENT_USER, SEED_CURRENT_USER_ID);
  }

  private loadTrips(): Trip[] {
    this.ensureSeeded();
    return readRaw<Trip[]>(K_TRIPS, []);
  }

  private saveTrips(trips: Trip[]): void {
    writeRaw(K_TRIPS, trips);
  }

  /** Find one trip, mutate a clone of it, bump updatedAt, persist, return it. */
  private async mutate(tripId: string, fn: (trip: Trip) => void): Promise<Trip> {
    const trips = this.loadTrips();
    const idx = trips.findIndex((t) => t.id === tripId);
    if (idx === -1) throw new Error(`Trip "${tripId}" not found`);
    const trip = clone(trips[idx]);
    fn(trip);
    trip.updatedAt = nowISO();
    trips[idx] = trip;
    this.saveTrips(trips);
    return clone(trip);
  }

  private findDay(trip: Trip, dayId: string): TripDay {
    const d = trip.days.find((x) => x.id === dayId);
    if (!d) throw new Error(`Day "${dayId}" not found`);
    return d;
  }

  private reindex(day: TripDay): void {
    day.activities.forEach((a, i) => (a.orderIndex = i));
  }

  // ── trips ──────────────────────────────────────────────────────────────
  async listTrips(): Promise<Trip[]> {
    return clone(this.loadTrips());
  }

  async getTrip(id: string): Promise<Trip | null> {
    const t = this.loadTrips().find((x) => x.id === id);
    return t ? clone(t) : null;
  }

  async createTrip(input: NewTripInput): Promise<Trip> {
    const ts = nowISO();
    const currentUserId = readRaw<string>(K_CURRENT_USER, SEED_CURRENT_USER_ID);
    const users = readRaw<User[]>(K_USERS, SEED_USERS);
    const me = users.find((u) => u.id === currentUserId);
    const owner: Collaborator = {
      userId: currentUserId,
      name: me?.name ?? 'You',
      email: me?.email,
      avatarUrl: me?.avatarUrl,
      role: 'owner',
      status: 'active',
      invitedAt: ts,
      joinedAt: ts,
    };
    const trip: Trip = {
      id: uid('trip'),
      ownerId: currentUserId,
      title: input.title,
      cities: input.cities,
      startDate: input.startDate,
      endDate: input.endDate,
      coverImage: input.coverImage,
      status: input.status ?? 'planning',
      currency: input.currency ?? 'INR',
      budgetTarget: input.budgetTarget ?? null,
      createdAt: ts,
      updatedAt: ts,
      days: input.days ?? [],
      collaborators: [owner],
      expenses: [],
      bookings: [],
      photos: [],
    };
    this.saveTrips([trip, ...this.loadTrips()]);
    return clone(trip);
  }

  async updateTrip(id: string, patch: Partial<Trip>): Promise<Trip> {
    return this.mutate(id, (t) => {
      Object.assign(t, patch, { id: t.id });
    });
  }

  async deleteTrip(id: string): Promise<void> {
    this.saveTrips(this.loadTrips().filter((t) => t.id !== id));
  }

  // ── itinerary: days & activities ─────────────────────────────────────────
  async addDay(tripId: string, city: string): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const dayNumber = t.days.length + 1;
      t.days.push({
        id: uid('day'),
        dayNumber,
        city,
        date: `Day ${dayNumber}`,
        activities: [],
      });
    });
  }

  async addActivity(tripId: string, dayId: string, input: NewActivityInput): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const day = this.findDay(t, dayId);
      day.activities.push({
        id: uid('act'),
        title: input.title,
        type: input.type ?? 'activity',
        time: input.time,
        location: input.location,
        notes: input.notes,
        orderIndex: day.activities.length,
      });
    });
  }

  async updateActivity(
    tripId: string,
    dayId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const day = this.findDay(t, dayId);
      const a = day.activities.find((x) => x.id === activityId);
      if (!a) throw new Error(`Activity "${activityId}" not found`);
      Object.assign(a, patch, { id: a.id });
    });
  }

  async removeActivity(tripId: string, dayId: string, activityId: string): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const day = this.findDay(t, dayId);
      day.activities = day.activities.filter((x) => x.id !== activityId);
      this.reindex(day);
    });
  }

  async reorderActivities(
    tripId: string,
    dayId: string,
    orderedActivityIds: string[],
  ): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const day = this.findDay(t, dayId);
      const byId = new Map(day.activities.map((a) => [a.id, a]));
      const next: Activity[] = [];
      orderedActivityIds.forEach((id) => {
        const a = byId.get(id);
        if (a) next.push(a);
      });
      // Preserve any activity not named in the ordering (defensive).
      day.activities.forEach((a) => {
        if (!orderedActivityIds.includes(a.id)) next.push(a);
      });
      day.activities = next;
      this.reindex(day);
    });
  }

  async moveActivity(
    tripId: string,
    fromDayId: string,
    toDayId: string,
    activityId: string,
    toIndex: number,
  ): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const from = this.findDay(t, fromDayId);
      const to = this.findDay(t, toDayId);
      const i = from.activities.findIndex((a) => a.id === activityId);
      if (i === -1) throw new Error(`Activity "${activityId}" not found`);
      const [act] = from.activities.splice(i, 1);
      const clamped = Math.max(0, Math.min(toIndex, to.activities.length));
      to.activities.splice(clamped, 0, act);
      this.reindex(from);
      this.reindex(to);
    });
  }

  // ── expenses ─────────────────────────────────────────────────────────────
  async addExpense(tripId: string, input: NewExpenseInput): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const expense: Expense = {
        id: uid('exp'),
        addedByUserId: input.addedByUserId,
        paidByUserId: input.paidByUserId,
        category: input.category,
        amount: input.amount,
        currency: input.currency ?? t.currency ?? 'INR',
        splitBetweenUserIds: input.splitBetweenUserIds,
        date: input.date ?? nowISO().slice(0, 10),
        note: input.note,
      };
      t.expenses.push(expense);
    });
  }

  async updateExpense(tripId: string, expenseId: string, patch: Partial<Expense>): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const e = t.expenses.find((x) => x.id === expenseId);
      if (!e) throw new Error(`Expense "${expenseId}" not found`);
      Object.assign(e, patch, { id: e.id });
    });
  }

  async removeExpense(tripId: string, expenseId: string): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      t.expenses = t.expenses.filter((x) => x.id !== expenseId);
    });
  }

  // ── collaborators ────────────────────────────────────────────────────────
  async upsertCollaborator(tripId: string, collaborator: Collaborator): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      const i = t.collaborators.findIndex((x) => x.userId === collaborator.userId);
      if (i === -1) t.collaborators.push(collaborator);
      else t.collaborators[i] = { ...t.collaborators[i], ...collaborator };
    });
  }

  async removeCollaborator(tripId: string, userId: string): Promise<Trip> {
    return this.mutate(tripId, (t) => {
      t.collaborators = t.collaborators.filter((x) => x.userId !== userId);
    });
  }

  // ── users / profile ──────────────────────────────────────────────────────
  async getCurrentUser(): Promise<User> {
    this.ensureSeeded();
    const id = readRaw<string>(K_CURRENT_USER, SEED_CURRENT_USER_ID);
    const users = readRaw<User[]>(K_USERS, SEED_USERS);
    return clone(users.find((u) => u.id === id) ?? users[0] ?? SEED_USERS[0]);
  }

  async updateCurrentUser(patch: Partial<User>): Promise<User> {
    this.ensureSeeded();
    const id = readRaw<string>(K_CURRENT_USER, SEED_CURRENT_USER_ID);
    const users = readRaw<User[]>(K_USERS, SEED_USERS);
    const i = users.findIndex((u) => u.id === id);
    if (i === -1) throw new Error('Current user not found');
    users[i] = { ...users[i], ...patch, id: users[i].id };
    writeRaw(K_USERS, users);

    // Keep the owner's collaborator card in sync across trips.
    if (patch.name || patch.email || patch.avatarUrl) {
      const trips = this.loadTrips();
      let changed = false;
      trips.forEach((t) => {
        const c = t.collaborators.find((x) => x.userId === id);
        if (c) {
          if (patch.name) c.name = patch.name;
          if (patch.email) c.email = patch.email;
          if (patch.avatarUrl) c.avatarUrl = patch.avatarUrl;
          changed = true;
        }
      });
      if (changed) this.saveTrips(trips);
    }
    return clone(users[i]);
  }

  async listUsers(): Promise<User[]> {
    this.ensureSeeded();
    return clone(readRaw<User[]>(K_USERS, SEED_USERS));
  }

  // ── notifications ──────────────────────────────────────────────────────
  async listNotifications(): Promise<AppNotification[]> {
    return clone(readRaw<AppNotification[]>(K_NOTIFICATIONS, []));
  }

  async addNotification(
    input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> &
      Partial<Pick<AppNotification, 'read'>>,
  ): Promise<AppNotification> {
    const n: AppNotification = {
      id: uid('ntf'),
      createdAt: nowISO(),
      read: input.read ?? false,
      tripId: input.tripId,
      userId: input.userId,
      type: input.type,
      message: input.message,
    };
    writeRaw(K_NOTIFICATIONS, [n, ...readRaw<AppNotification[]>(K_NOTIFICATIONS, [])]);
    return clone(n);
  }

  async markNotificationRead(id: string): Promise<void> {
    const list = readRaw<AppNotification[]>(K_NOTIFICATIONS, []);
    const i = list.findIndex((x) => x.id === id);
    if (i !== -1) {
      list[i].read = true;
      writeRaw(K_NOTIFICATIONS, list);
    }
  }
}
