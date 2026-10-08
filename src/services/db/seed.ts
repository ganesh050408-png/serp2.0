import type { User } from './types';

export const SEED_USERS: User[] = [
  {
    id: 'user_aravind',
    name: 'Aravind S.',
    email: 'aravind@adhira.travel',
    avatarUrl: undefined,
    religion: null,
    createdAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'user_rahul',
    name: 'Rahul M.',
    email: 'rahul@adhira.travel',
    createdAt: '2026-08-01T09:05:00.000Z',
  },
  {
    id: 'user_priya',
    name: 'Priya K.',
    email: 'priya@adhira.travel',
    createdAt: '2026-08-01T09:06:00.000Z',
  },
  {
    id: 'user_arjun',
    name: 'Arjun D.',
    email: 'arjun@adhira.travel',
    createdAt: '2026-08-01T09:07:00.000Z',
  },
];

export const SEED_CURRENT_USER_ID = 'user_aravind';
