import type { Trip, TripDay, Activity, ActivityType, TripStatus, Collaborator, Expense } from './types';
import type { StoredJourney } from '../travelStorage';

export const storedJourneyToTrip = (j: StoredJourney): Trip => {
  const cities: string[] = [];
  if (j.city) cities.push(j.city);
  if (j.destinations && j.destinations.length > 0) {
    j.destinations.forEach((d) => {
      if (d.city && !cities.includes(d.city)) cities.push(d.city);
    });
  }
  if (cities.length === 0) {
    const parts = (j.destination || '')
      .split(/[·→,\-]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) cities.push(...parts);
    else if (j.destination) cities.push(j.destination);
    else cities.push('Destination');
  }

  const days: TripDay[] = (j.itinerary || []).map((day, idx) => ({
    id: `day_${j.id}_${idx + 1}`,
    dayNumber: day.dayNumber || idx + 1,
    date: day.date || `Day ${idx + 1}`,
    city: day.city || cities[0] || 'Destination',
    activities: (day.activities || []).map((act: any, actIdx: number): Activity => {
      if (typeof act === 'string') {
        return {
          id: `act_${j.id}_${idx + 1}_${actIdx + 1}`,
          title: act,
          time: '09:00',
          type: 'activity',
          orderIndex: actIdx,
        };
      }
      return {
        id: act.id || `act_${j.id}_${idx + 1}_${actIdx + 1}`,
        title: act.name || act.title || '',
        time: act.startTime || act.time || '09:00',
        type: (act.type as ActivityType) || 'activity',
        location: act.location,
        notes: act.description || act.notes,
        orderIndex: act.orderIndex ?? actIdx,
      };
    }),
  }));

  // If no itinerary was supplied, generate initial placeholder days from cities
  if (days.length === 0 && cities.length > 0) {
    cities.forEach((cityName, idx) => {
      days.push({
        id: `day_${j.id}_${idx + 1}`,
        dayNumber: idx + 1,
        date: `Day ${idx + 1}`,
        city: cityName,
        activities: [
          {
            id: `act_${j.id}_${idx + 1}_1`,
            title: `Arrival and explore ${cityName}`,
            time: '10:00',
            type: 'activity',
            orderIndex: 0,
          },
          {
            id: `act_${j.id}_${idx + 1}_2`,
            title: `Evening dinner & local experience in ${cityName}`,
            time: '19:00',
            type: 'food',
            orderIndex: 1,
          },
        ],
      });
    });
  }

  let status: TripStatus = 'planning';
  if (j.status === 'Completed') status = 'completed';
  else if (j.status === 'Upcoming') status = 'live';

  const travelType = j.travelType || 'friends';
  const members = j.members && j.members.length > 0
    ? j.members
    : [{ id: 'user_you', name: 'You', role: 'owner' }];

  const collaborators: Collaborator[] = members.map((m) => ({
    userId: m.id,
    name: m.name,
    role: (m.role as any) || 'owner',
    status: 'active',
    invitedAt: j.createdAt || new Date().toISOString(),
    joinedAt: j.createdAt || new Date().toISOString(),
  }));

  const expenses: Expense[] = (j.expenses || []).map((e: any) => ({
    id: e.id || `exp_${Math.random().toString(36).substring(2, 9)}`,
    addedByUserId: e.addedByUserId || 'user_you',
    paidByUserId: e.paidByUserId || 'user_you',
    category: e.category || 'food',
    amount: typeof e.amount === 'number' ? e.amount : Number(e.amount) || 0,
    currency: e.currency || 'INR',
    splitBetweenUserIds: Array.isArray(e.splitBetweenUserIds) ? e.splitBetweenUserIds : [],
    customSplit: e.customSplit,
    date: e.date || new Date().toISOString().slice(0, 10),
    note: e.note,
  }));

  return {
    id: j.id,
    ownerId: 'user_you',
    title: j.destination,
    cities,
    startDate: j.startDate,
    endDate: j.endDate,
    coverImage: j.coverImage,
    status,
    travelType,
    members,
    currency: 'INR',
    budgetTarget: j.budgetValue?.amount ?? (typeof j.budget === 'number' ? j.budget : null),
    createdAt: j.createdAt || new Date().toISOString(),
    updatedAt: j.createdAt || new Date().toISOString(),
    days,
    collaborators,
    expenses,
    bookings: [],
    photos: [],
  };
};

export const tripToStoredJourney = (t: Trip, original?: StoredJourney): StoredJourney => {
  const members = t.collaborators.map((c) => ({
    id: c.userId,
    name: c.name,
    role: c.role,
  }));

  return {
    id: t.id,
    destination: t.title,
    city: t.cities[0],
    budget: t.budgetTarget || original?.budget || 50000,
    travelers: original?.travelers || t.collaborators.length || 2,
    style: original?.style || 'Cultural & Scenic',
    createdAt: t.createdAt,
    status: t.status === 'completed' ? 'Completed' : (t.status === 'live' ? 'Upcoming' : 'Planning'),
    startDate: t.startDate,
    endDate: t.endDate,
    datesDecided: !!t.startDate,
    travelType: t.travelType || original?.travelType || 'friends',
    members,
    expenses: t.expenses || [],
    travellersBreakdown: original?.travellersBreakdown || { adults: 2, children: 0 },
    budgetValue: {
      amount: t.budgetTarget || null,
      label: t.budgetTarget ? `₹${t.budgetTarget.toLocaleString()}` : "I'll decide later",
    },
    interests: original?.interests || ['culture', 'relaxed'],
    pace: original?.pace || 'balanced',
    coverImage: t.coverImage || original?.coverImage,
    itinerary: t.days.map((d) => ({
      dayNumber: d.dayNumber,
      date: d.date || `Day ${d.dayNumber}`,
      city: d.city,
      activities: d.activities.map((a) => ({
        id: a.id,
        name: a.title,
        startTime: a.time || '09:00',
        endTime: '10:30',
        location: a.location || d.city,
        description: a.notes || '',
        cost: 0,
        type: a.type,
      })),
    })),
  };
};
