// ============================================================================
// Data layer entry point.
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  THE SWAP POINT                                                           │
// │                                                                           │
// │  Today `db` is a LocalTripRepository (localStorage). To move the whole    │
// │  app onto a real backend, implement SupabaseTripRepository against the    │
// │  same TripRepository interface and change the one line below:             │
// │                                                                           │
// │      export const db: TripRepository = new SupabaseTripRepository();      │
// │                                                                           │
// │  No component, hook, or context changes. See repository.ts for the        │
// │  interface and services/README-backend.md for the Supabase migration.     │
// └─────────────────────────────────────────────────────────────────────────┘
// ============================================================================

import { type TripRepository } from './repository';
import { LocalTripRepository } from './localRepository';

export const db: TripRepository = new LocalTripRepository();

export * from './types';
export { uid, nowISO } from './repository';
export type { TripRepository } from './repository';
