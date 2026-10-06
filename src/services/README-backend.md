# Backend architecture — local-first, swap-ready

Aethera's data layer is deliberately decoupled from the rest of the app by a
single interface. Today it runs entirely on `localStorage`; moving to Supabase
(Postgres + Auth + Realtime + Storage) is an **additive, one-line swap** with no
changes to any component, hook, or context.

```
components / pages
        │  (only ever import from `context/TripContext`)
        ▼
  TripContext  ──────────────►  db  (services/db/index.ts)   ◄── THE SWAP POINT
        │                            │
        │                            ├── LocalTripRepository   (today)
        │                            └── SupabaseTripRepository (later)
        ▼
  TripRepository interface (services/db/repository.ts)
```

## The contract

Everything the app can do to trip data is expressed by the `TripRepository`
interface in [`db/repository.ts`](./db/repository.ts). Two rules make the swap
safe:

1. **Nothing outside `services/db` talks to storage.** Components call
   `useTrip()`; the context calls `db`; `db` is the only thing that knows
   whether the backing store is `localStorage` or Postgres.
2. **Every mutation returns the fully-updated `Trip`.** The context applies
   optimistic updates and reconciles against (or rolls back to) whatever the
   repository returns. A network-backed implementation obeys the same contract,
   so optimistic UI keeps working unchanged.

The domain types in [`db/types.ts`](./db/types.ts) were written to mirror the
target Postgres schema 1:1 — the child collections (`days`, `activities`,
`expenses`, …) are embedded on the `Trip` aggregate for local ergonomics, but
each already carries the foreign keys it will need as its own table.

## Doing the swap

1. Add `services/db/supabaseRepository.ts` implementing `TripRepository`.
2. Change the single line in [`db/index.ts`](./db/index.ts):

   ```ts
   // export const db: TripRepository = new LocalTripRepository();
   export const db: TripRepository = new SupabaseTripRepository();
   ```

That's it. `TripContext`, every component, and every call site stay identical.

## Target Postgres schema

Snake-case columns map to the camelCase TypeScript fields; the repository
implementation is where that translation lives.

```sql
-- users -----------------------------------------------------------------------
create table users (
  id          text primary key,              -- or uuid + auth.users FK
  name        text not null,
  email       text,
  phone       text,
  avatar_url  text,
  religion    text,                           -- optional; powers recommendations
  created_at  timestamptz not null default now()
);

-- trips (aggregate root) ------------------------------------------------------
create table trips (
  id            text primary key,
  owner_id      text not null references users(id),
  title         text not null,
  cities        text[] not null default '{}',
  start_date    date,
  end_date      date,
  cover_image   text,
  status        text not null default 'planning',  -- planning | live | completed
  currency      text not null default 'INR',
  budget_target numeric,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- trip_days -------------------------------------------------------------------
create table trip_days (
  id         text primary key,
  trip_id    text not null references trips(id) on delete cascade,
  day_number int  not null,
  date       text,                            -- display-only ("19 Aug")
  city       text not null
);

-- activities ------------------------------------------------------------------
create table activities (
  id          text primary key,
  day_id      text not null references trip_days(id) on delete cascade,
  time        text,                           -- free-form ("09:30", "Morning")
  title       text not null,
  type        text not null,                  -- activity|stay|transport|food|shopping
  location    text,
  notes       text,
  order_index int  not null default 0
);

-- trip_collaborators ----------------------------------------------------------
create table trip_collaborators (
  trip_id    text not null references trips(id) on delete cascade,
  user_id    text not null references users(id),
  name       text not null,
  email      text,
  avatar_url text,
  role       text not null,                   -- owner | editor | viewer
  status     text not null,                   -- active | pending
  invited_at timestamptz not null default now(),
  joined_at  timestamptz,
  primary key (trip_id, user_id)
);

-- expenses --------------------------------------------------------------------
create table expenses (
  id                    text primary key,
  trip_id               text not null references trips(id) on delete cascade,
  added_by_user_id      text not null references users(id),
  paid_by_user_id       text not null references users(id),
  category              text not null,        -- flight|stay|food|transport|activity|shopping
  amount                numeric not null,
  currency              text not null default 'INR',
  split_between_user_ids text[] not null default '{}',  -- empty === "just me"
  date                  date not null,
  note                  text
);

-- bookings --------------------------------------------------------------------
create table bookings (
  id                text primary key,
  trip_id           text not null references trips(id) on delete cascade,
  type              text not null,            -- flight|train|bus|taxi|bike|hotel|hostel|resort
  provider          text not null,
  reference_details jsonb not null default '{}',
  status            text not null,
  cost              numeric not null default 0,
  created_at        timestamptz not null default now()
);

-- trip_photos -----------------------------------------------------------------
create table trip_photos (
  id                 text primary key,
  trip_id            text not null references trips(id) on delete cascade,
  uploaded_by_user_id text not null references users(id),
  url                text not null,           -- Supabase Storage public URL
  caption            text,
  taken_at           timestamptz,
  uploaded_at        timestamptz not null default now()
);

-- notifications ---------------------------------------------------------------
create table notifications (
  id         text primary key,
  trip_id    text not null references trips(id) on delete cascade,
  user_id    text not null references users(id),
  type       text not null,                   -- reminder|weather|booking|collaborator|festival
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
```

### Reading a `Trip` back as an aggregate

The interface hands components a `Trip` with its children embedded. In Postgres,
compose it in one round-trip with nested selects, e.g.:

```ts
const { data } = await supabase
  .from('trips')
  .select(`
    *,
    days:trip_days(*, activities(*)),
    collaborators:trip_collaborators(*),
    expenses(*),
    bookings(*),
    photos:trip_photos(*)
  `)
  .eq('id', tripId)
  .order('order_index', { foreignTable: 'trip_days.activities' })
  .single();
```

then map snake_case → camelCase into the `Trip` shape before returning.

## Implementation notes

- **`reorderActivities` / `moveActivity`** — persist the new `order_index` for
  the affected rows (a single `upsert` of `{id, order_index}` pairs). The
  interface passes the full desired ordering, so you never have to diff.
- **`updateCurrentUser`** — `LocalTripRepository` also copies name/email/avatar
  onto the owner's collaborator rows. With a FK to `users`, that denormalisation
  can go away (join instead), or keep it and update both.
- **Auth** — swap the hard-coded `SEED_CURRENT_USER_ID` for
  `supabase.auth.getUser()`. `getCurrentUser()` is the only place that reads it.
- **Realtime (feature I, collaboration)** — subscribe to `postgres_changes` on
  the child tables and call the same `commitTrip` path the mutations use, so
  remote edits flow through the identical optimistic-reconcile machinery.
- **Row-Level Security** — gate every table on membership:
  `exists (select 1 from trip_collaborators c where c.trip_id = <table>.trip_id
  and c.user_id = auth.uid())`, with writes further restricted to
  `role in ('owner','editor')`.

## Optional: migrating existing local data

`localStorage` keys are versioned and namespaced (`aethera.db.*.v1`). A one-off
importer can read them and push into Supabase:

```ts
const trips = JSON.parse(localStorage.getItem('aethera.db.trips.v1') ?? '[]');
// insert trips, then their days → activities, collaborators, expenses, …
```

Because keys are versioned, the local layer can safely coexist during rollout;
delete the keys once the account is confirmed migrated.
