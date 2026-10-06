export type CollaboratorRole = 'Owner' | 'Editor' | 'Viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  initials: string;
}

export interface Collaborator {
  userId: string;
  name: string;
  email: string;
  role: CollaboratorRole;
  avatar?: string;
  initials: string;
  isOnline?: boolean;
  joinedAt: string;
}

export interface TripActivity {
  id: string;
  tripId: string;
  userId: string;
  userName: string;
  userInitials: string;
  userAvatar?: string;
  action: string;
  timestamp: string;
  relativeTime?: string;
}

export interface TripInvitation {
  id: string;
  tripId: string;
  tripTitle: string;
  tripDestination: string;
  tripDays: number;
  tripTravelers: number;
  tripImage: string;
  invitedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  invitedEmailOrUser: string;
  role: CollaboratorRole;
  token: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt: string;
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  location: string;
  category: 'Dining' | 'Activity' | 'Heritage' | 'Leisure' | 'Transit';
  completed?: boolean;
  notes?: string;
  addedBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface StoredJourney {
  id: string;
  destination: string;
  title?: string;
  dates: string;
  daysCount: number;
  citiesCount: number;
  travelers: number;
  budget: number;
  style: string;
  image: string;
  tagline: string;
  status: 'Upcoming' | 'Planning' | 'Completed';
  createdAt: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  collaborators: Collaborator[];
  itinerary: Record<string, ItineraryItem[]>;
  activities: TripActivity[];
}

export interface StoredNotification {
  id: string;
  title: string;
  message: string;
  type: 'invite' | 'activity' | 'system';
  tripId?: string;
  tripTitle?: string;
  inviteToken?: string;
  createdAt: string;
  read: boolean;
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user_aravind',
    name: 'Aravind S.',
    email: 'aravind@aethera.travel',
    username: 'aravind',
    initials: 'AS',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'user_naitri',
    name: 'Naitri',
    email: 'naitri@aethera.travel',
    username: 'naitri',
    initials: 'N',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'user_shubham',
    name: 'Shubham',
    email: 'shubham@aethera.travel',
    username: 'shubham',
    initials: 'S',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  },
  {
    id: 'user_meera',
    name: 'Meera K.',
    email: 'meera@aethera.travel',
    username: 'meera',
    initials: 'MK',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
  },
];
