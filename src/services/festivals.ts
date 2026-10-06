// ============================================================================
// Festivals & events (feature K) — a curated dataset for the destinations the
// app knows about. Matched against a trip's cities and dates so travellers see
// "what's on while I'm there", with a one-tap "add to itinerary".
//
// Dates are approximate (many Indian festivals follow lunar calendars); `month`
// drives date-overlap matching and `approxDates` is the human-facing hint.
// ============================================================================

export type FestivalType = 'religious' | 'cultural' | 'music' | 'food' | 'seasonal' | 'art';

export interface Festival {
  id: string;
  name: string;
  /** Matching city names, or ['*'] for nationwide. */
  cities: string[];
  /** Primary month, 1–12. */
  month: number;
  approxDates: string;
  type: FestivalType;
  description: string;
  emoji: string;
}

export interface FestivalMatch extends Festival {
  /** 'during' = coincides with the trip dates/month; 'city' = in a trip city. */
  relevance: 'during' | 'city';
}

export const FESTIVALS: Festival[] = [
  // Nationwide
  {
    id: 'independence-day',
    name: 'Independence Day',
    cities: ['*'],
    month: 8,
    approxDates: '15 Aug',
    type: 'cultural',
    description: 'Flag hoisting, parades and cultural programs across every city.',
    emoji: '🇮🇳',
  },
  {
    id: 'diwali',
    name: 'Diwali · Festival of Lights',
    cities: ['*'],
    month: 11,
    approxDates: 'Oct–Nov',
    type: 'religious',
    description: 'Lamps, fireworks and sweets light up streets and homes nationwide.',
    emoji: '🪔',
  },
  {
    id: 'holi',
    name: 'Holi · Festival of Colours',
    cities: ['*'],
    month: 3,
    approxDates: 'March',
    type: 'cultural',
    description: 'Exuberant colour-throwing celebrations welcoming spring.',
    emoji: '🎨',
  },
  {
    id: 'navratri',
    name: 'Navratri',
    cities: ['*'],
    month: 10,
    approxDates: 'Sep–Oct',
    type: 'religious',
    description: 'Nine nights of dance, music and devotion; spectacular garba evenings.',
    emoji: '💃',
  },

  // Goa
  {
    id: 'goa-carnival',
    name: 'Goa Carnival',
    cities: ['Goa'],
    month: 2,
    approxDates: 'February',
    type: 'cultural',
    description: 'Floats, parades and street parties led by King Momo.',
    emoji: '🎭',
  },
  {
    id: 'sunburn',
    name: 'Sunburn Festival',
    cities: ['Goa'],
    month: 12,
    approxDates: 'December',
    type: 'music',
    description: "Asia's largest electronic dance music festival on the coast.",
    emoji: '🎧',
  },
  {
    id: 'shigmo',
    name: 'Shigmo Spring Festival',
    cities: ['Goa'],
    month: 3,
    approxDates: 'March',
    type: 'cultural',
    description: 'Folk dances and vividly costumed street processions.',
    emoji: '🌸',
  },
  {
    id: 'bonderam',
    name: 'Bonderam Flag Festival',
    cities: ['Goa'],
    month: 8,
    approxDates: 'Late August',
    type: 'cultural',
    description: 'Divar Island’s lively flag festival with floats and mock battles.',
    emoji: '🚩',
  },

  // Mumbai
  {
    id: 'ganesh-chaturthi',
    name: 'Ganesh Chaturthi',
    cities: ['Mumbai'],
    month: 9,
    approxDates: 'Aug–Sep',
    type: 'religious',
    description: 'The city’s grandest festival — elaborate pandals and seafront processions.',
    emoji: '🐘',
  },
  {
    id: 'kala-ghoda',
    name: 'Kala Ghoda Arts Festival',
    cities: ['Mumbai'],
    month: 2,
    approxDates: 'February',
    type: 'art',
    description: 'Nine days of installations, theatre and street art in the Fort precinct.',
    emoji: '🎨',
  },
  {
    id: 'elephanta-festival',
    name: 'Elephanta Festival',
    cities: ['Mumbai'],
    month: 2,
    approxDates: 'February',
    type: 'music',
    description: 'Classical music and dance staged near the Elephanta caves.',
    emoji: '🎶',
  },

  // Delhi
  {
    id: 'qutub-festival',
    name: 'Qutub Festival',
    cities: ['Delhi'],
    month: 11,
    approxDates: 'Nov–Dec',
    type: 'music',
    description: 'Sufi and classical performances against the floodlit Qutub Minar.',
    emoji: '🎶',
  },
  {
    id: 'phoolwalon-ki-sair',
    name: 'Phool Walon Ki Sair',
    cities: ['Delhi'],
    month: 10,
    approxDates: 'October',
    type: 'cultural',
    description: 'Centuries-old flower-sellers’ procession celebrating communal harmony.',
    emoji: '🌺',
  },
  {
    id: 'surajkund-mela',
    name: 'Surajkund Crafts Mela',
    cities: ['Delhi'],
    month: 2,
    approxDates: 'February',
    type: 'art',
    description: 'Vast handicrafts and folk-culture fair on Delhi’s southern edge.',
    emoji: '🧶',
  },

  // Jaipur
  {
    id: 'jaipur-lit-fest',
    name: 'Jaipur Literature Festival',
    cities: ['Jaipur'],
    month: 1,
    approxDates: 'January',
    type: 'cultural',
    description: 'The world’s largest free literary gathering.',
    emoji: '📚',
  },
  {
    id: 'teej',
    name: 'Teej Festival',
    cities: ['Jaipur'],
    month: 8,
    approxDates: 'Aug',
    type: 'cultural',
    description: 'Monsoon festival with processions of the goddess Parvati.',
    emoji: '🌦️',
  },
  {
    id: 'kite-festival',
    name: 'Makar Sankranti Kite Festival',
    cities: ['Jaipur'],
    month: 1,
    approxDates: '14 Jan',
    type: 'seasonal',
    description: 'Skies fill with kites across the Pink City.',
    emoji: '🪁',
  },

  // Kerala
  {
    id: 'onam',
    name: 'Onam Harvest Festival',
    cities: ['Kerala'],
    month: 8,
    approxDates: 'Aug–Sep',
    type: 'cultural',
    description: 'Flower carpets, feasts and snake-boat races welcome the harvest.',
    emoji: '🌼',
  },
  {
    id: 'nehru-trophy',
    name: 'Nehru Trophy Boat Race',
    cities: ['Kerala'],
    month: 8,
    approxDates: 'August',
    type: 'seasonal',
    description: 'Thunderous snake-boat racing on the Alleppey backwaters.',
    emoji: '🚣',
  },

  // Udaipur / Srinagar
  {
    id: 'mewar-festival',
    name: 'Mewar Festival',
    cities: ['Udaipur'],
    month: 4,
    approxDates: 'Mar–Apr',
    type: 'cultural',
    description: 'Lakeside processions and folk performances welcoming spring.',
    emoji: '🛶',
  },
  {
    id: 'tulip-festival',
    name: 'Srinagar Tulip Festival',
    cities: ['Srinagar'],
    month: 4,
    approxDates: 'April',
    type: 'seasonal',
    description: 'Asia’s largest tulip garden blooms below the Zabarwan range.',
    emoji: '🌷',
  },
];

const norm = (s: string) => s.toLowerCase().trim();

/** Months a trip touches (inclusive). Empty if dates unknown. */
function tripMonths(startDate?: string, endDate?: string): Set<number> {
  const months = new Set<number>();
  if (!startDate) return months;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  if (Number.isNaN(start.getTime())) return months;
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    months.add(cur.getMonth() + 1);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

/**
 * Festivals relevant to a trip: those in a trip city (or nationwide), ranked so
 * ones coinciding with the trip's months come first.
 */
export function getFestivalsForTrip(
  cities: string[],
  startDate?: string,
  endDate?: string,
): FestivalMatch[] {
  const cityset = new Set(cities.map(norm));
  const months = tripMonths(startDate, endDate);

  const matches: FestivalMatch[] = [];
  for (const f of FESTIVALS) {
    const nationwide = f.cities.includes('*');
    const inCity = nationwide || f.cities.some((c) => cityset.has(norm(c)));
    if (!inCity) continue;
    const during = months.size > 0 && months.has(f.month);
    // Nationwide events only surface when they coincide with the trip, to avoid
    // burying the city-specific recommendations.
    if (nationwide && !during) continue;
    matches.push({ ...f, relevance: during ? 'during' : 'city' });
  }

  return matches.sort((a, b) => {
    if (a.relevance !== b.relevance) return a.relevance === 'during' ? -1 : 1;
    return a.month - b.month;
  });
}
