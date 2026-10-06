import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { db } from '../services/db';
import type {
  Trip,
  User,
  Activity,
  Expense,
  Collaborator,
  AppNotification,
  NewTripInput,
  NewActivityInput,
  NewExpenseInput,
} from '../services/db';

// ============================================================================
// TripContext — the app's single source of truth for trip data.
//
// Every mutation goes through db (the swap-ready repository) and updates React
// state from the fully-updated Trip the repository returns. Drag interactions
// (reorder / move) apply an optimistic transform first for zero-latency feel,
// then reconcile with the authoritative result and roll back on error.
// ============================================================================

interface TripContextValue {
  // data
  trips: Trip[];
  activeTrip: Trip | null;
  currentUser: User | null;
  users: User[];
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  // selection
  setActiveTripId: (id: string) => void;
  refresh: () => Promise<void>;

  // trips
  createTrip: (input: NewTripInput) => Promise<Trip>;
  updateActiveTrip: (patch: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  // itinerary (feature H)
  addDay: (city: string) => Promise<void>;
  addActivity: (dayId: string, input: NewActivityInput) => Promise<void>;
  updateActivity: (dayId: string, activityId: string, patch: Partial<Activity>) => Promise<void>;
  removeActivity: (dayId: string, activityId: string) => Promise<void>;
  reorderActivities: (dayId: string, orderedActivityIds: string[]) => Promise<void>;
  moveActivity: (
    fromDayId: string,
    toDayId: string,
    activityId: string,
    toIndex: number,
  ) => Promise<void>;

  // expenses (feature A)
  addExpense: (input: NewExpenseInput) => Promise<void>;
  updateExpense: (expenseId: string, patch: Partial<Expense>) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;

  // collaborators (feature B)
  upsertCollaborator: (collaborator: Collaborator) => Promise<void>;
  removeCollaborator: (userId: string) => Promise<void>;

  // profile (feature F)
  updateCurrentUser: (patch: Partial<User>) => Promise<void>;

  // notifications (feature E)
  addNotification: (
    input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> &
      Partial<Pick<AppNotification, 'read'>>,
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | null>(null);

const cloneTrip = (t: Trip): Trip => JSON.parse(JSON.stringify(t)) as Trip;

/** Pick which trip is "active" by default: the live one, else the most recent. */
const pickDefaultTrip = (trips: Trip[]): Trip | null => {
  if (trips.length === 0) return null;
  return trips.find((t) => t.status === 'live') ?? trips[0];
};

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripIdState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId) ?? null,
    [trips, activeTripId],
  );

  // Ref mirror so mutation helpers never read a stale active trip in closures.
  const activeTripRef = useRef<Trip | null>(null);
  activeTripRef.current = activeTrip;

  // ── initial load ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    try {
      const [allTrips, user, allUsers, notifs] = await Promise.all([
        db.listTrips(),
        db.getCurrentUser(),
        db.listUsers(),
        db.listNotifications(),
      ]);
      setTrips(allTrips);
      setCurrentUser(user);
      setUsers(allUsers);
      setNotifications(notifs);
      setActiveTripIdState((prev) =>
        prev && allTrips.some((t) => t.id === prev) ? prev : (pickDefaultTrip(allTrips)?.id ?? null),
      );
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ── mutation plumbing ───────────────────────────────────────────────────
  /** Replace one trip everywhere it's held in state. */
  const commitTrip = useCallback((updated: Trip) => {
    setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }, []);

  /**
   * Run a trip mutation. If `optimistic` is provided, apply it to a clone of the
   * current active trip immediately, then reconcile with the repository result
   * and roll back on error. Otherwise just await + commit (localStorage is fast;
   * add/remove ops generate ids server-side so optimistic would flicker).
   */
  const runTripMutation = useCallback(
    async (
      dbCall: (tripId: string) => Promise<Trip>,
      optimistic?: (trip: Trip) => void,
    ): Promise<void> => {
      const snapshot = activeTripRef.current;
      if (!snapshot) {
        setError('No active trip');
        return;
      }
      if (optimistic) {
        const draft = cloneTrip(snapshot);
        optimistic(draft);
        commitTrip(draft);
      }
      try {
        const updated = await dbCall(snapshot.id);
        commitTrip(updated);
        setError(null);
      } catch (e) {
        if (optimistic) commitTrip(snapshot); // roll back
        setError(e instanceof Error ? e.message : 'Update failed');
      }
    },
    [commitTrip],
  );

  // ── selection ─────────────────────────────────────────────────────────────
  const setActiveTripId = useCallback((id: string) => setActiveTripIdState(id), []);

  // ── trips ────────────────────────────────────────────────────────────────
  const createTrip = useCallback(async (input: NewTripInput): Promise<Trip> => {
    const trip = await db.createTrip(input);
    setTrips((prev) => [trip, ...prev]);
    setActiveTripIdState(trip.id);
    return trip;
  }, []);

  const updateActiveTrip = useCallback(
    (patch: Partial<Trip>) => runTripMutation((id) => db.updateTrip(id, patch)),
    [runTripMutation],
  );

  const deleteTrip = useCallback(async (id: string) => {
    await db.deleteTrip(id);
    setTrips((prev) => {
      const next = prev.filter((t) => t.id !== id);
      setActiveTripIdState((cur) => (cur === id ? (pickDefaultTrip(next)?.id ?? null) : cur));
      return next;
    });
  }, []);

  // ── itinerary ──────────────────────────────────────────────────────────────
  const addDay = useCallback(
    (city: string) => runTripMutation((id) => db.addDay(id, city)),
    [runTripMutation],
  );

  const addActivity = useCallback(
    (dayId: string, input: NewActivityInput) =>
      runTripMutation((id) => db.addActivity(id, dayId, input)),
    [runTripMutation],
  );

  const updateActivity = useCallback(
    (dayId: string, activityId: string, patch: Partial<Activity>) =>
      runTripMutation(
        (id) => db.updateActivity(id, dayId, activityId, patch),
        (trip) => {
          const a = trip.days.find((d) => d.id === dayId)?.activities.find((x) => x.id === activityId);
          if (a) Object.assign(a, patch, { id: a.id });
        },
      ),
    [runTripMutation],
  );

  const removeActivity = useCallback(
    (dayId: string, activityId: string) =>
      runTripMutation(
        (id) => db.removeActivity(id, dayId, activityId),
        (trip) => {
          const day = trip.days.find((d) => d.id === dayId);
          if (day) {
            day.activities = day.activities.filter((x) => x.id !== activityId);
            day.activities.forEach((a, i) => (a.orderIndex = i));
          }
        },
      ),
    [runTripMutation],
  );

  const reorderActivities = useCallback(
    (dayId: string, orderedActivityIds: string[]) =>
      runTripMutation(
        (id) => db.reorderActivities(id, dayId, orderedActivityIds),
        (trip) => {
          const day = trip.days.find((d) => d.id === dayId);
          if (!day) return;
          const byId = new Map(day.activities.map((a) => [a.id, a]));
          const next: Activity[] = [];
          orderedActivityIds.forEach((aid) => {
            const a = byId.get(aid);
            if (a) next.push(a);
          });
          day.activities.forEach((a) => {
            if (!orderedActivityIds.includes(a.id)) next.push(a);
          });
          day.activities = next;
          day.activities.forEach((a, i) => (a.orderIndex = i));
        },
      ),
    [runTripMutation],
  );

  const moveActivity = useCallback(
    (fromDayId: string, toDayId: string, activityId: string, toIndex: number) =>
      runTripMutation(
        (id) => db.moveActivity(id, fromDayId, toDayId, activityId, toIndex),
        (trip) => {
          const from = trip.days.find((d) => d.id === fromDayId);
          const to = trip.days.find((d) => d.id === toDayId);
          if (!from || !to) return;
          const i = from.activities.findIndex((a) => a.id === activityId);
          if (i === -1) return;
          const [act] = from.activities.splice(i, 1);
          const clamped = Math.max(0, Math.min(toIndex, to.activities.length));
          to.activities.splice(clamped, 0, act);
          from.activities.forEach((a, idx) => (a.orderIndex = idx));
          to.activities.forEach((a, idx) => (a.orderIndex = idx));
        },
      ),
    [runTripMutation],
  );

  // ── expenses ───────────────────────────────────────────────────────────────
  const addExpense = useCallback(
    (input: NewExpenseInput) => runTripMutation((id) => db.addExpense(id, input)),
    [runTripMutation],
  );
  const updateExpense = useCallback(
    (expenseId: string, patch: Partial<Expense>) =>
      runTripMutation((id) => db.updateExpense(id, expenseId, patch)),
    [runTripMutation],
  );
  const removeExpense = useCallback(
    (expenseId: string) => runTripMutation((id) => db.removeExpense(id, expenseId)),
    [runTripMutation],
  );

  // ── collaborators ────────────────────────────────────────────────────────
  const upsertCollaborator = useCallback(
    (collaborator: Collaborator) =>
      runTripMutation((id) => db.upsertCollaborator(id, collaborator)),
    [runTripMutation],
  );
  const removeCollaborator = useCallback(
    (userId: string) => runTripMutation((id) => db.removeCollaborator(id, userId)),
    [runTripMutation],
  );

  // ── profile ────────────────────────────────────────────────────────────────
  const updateCurrentUser = useCallback(async (patch: Partial<User>) => {
    try {
      const updated = await db.updateCurrentUser(patch);
      setCurrentUser(updated);
      // collaborator cards may have been synced across trips — reload them.
      setTrips(await db.listTrips());
      setUsers(await db.listUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile update failed');
    }
  }, []);

  // ── notifications ────────────────────────────────────────────────────────
  const addNotification = useCallback<TripContextValue['addNotification']>(async (input) => {
    const n = await db.addNotification(input);
    setNotifications((prev) => [n, ...prev]);
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await db.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => db.markNotificationRead(n.id)));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<TripContextValue>(
    () => ({
      trips,
      activeTrip,
      currentUser,
      users,
      notifications,
      unreadCount,
      loading,
      error,
      setActiveTripId,
      refresh,
      createTrip,
      updateActiveTrip,
      deleteTrip,
      addDay,
      addActivity,
      updateActivity,
      removeActivity,
      reorderActivities,
      moveActivity,
      addExpense,
      updateExpense,
      removeExpense,
      upsertCollaborator,
      removeCollaborator,
      updateCurrentUser,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      trips,
      activeTrip,
      currentUser,
      users,
      notifications,
      unreadCount,
      loading,
      error,
      setActiveTripId,
      refresh,
      createTrip,
      updateActiveTrip,
      deleteTrip,
      addDay,
      addActivity,
      updateActivity,
      removeActivity,
      reorderActivities,
      moveActivity,
      addExpense,
      updateExpense,
      removeExpense,
      upsertCollaborator,
      removeCollaborator,
      updateCurrentUser,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

/** Access the trip store. Throws if used outside <TripProvider>. */
export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within a <TripProvider>');
  return ctx;
}
