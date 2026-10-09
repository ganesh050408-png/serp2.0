export interface ResearchItem {
  title: string;
  snippet: string;
  url: string;
  domain: string;
}

export interface TravelResearchDossier {
  query: string;
  intent: 'family' | 'beach' | 'mountain' | 'budget' | 'senior' | 'romantic' | 'adventure' | 'spiritual' | 'specific_destination' | 'general';
  isLiveSearchActive: boolean;
  searchResults: ResearchItem[];
  retrievalTimestamp: string;
  formattedResearchNote: string;
}

// Curated verified travel intelligence by category for grounded fallback
const VERIFIED_CATEGORY_HUBS: Record<string, { destinations: string[]; keyHighlights: string; budgetGuide: string }> = {
  family: {
    destinations: ['Goa (Coastal & Spice Plantations)', 'Jaipur & Udaipur (Royal Heritage)', 'Munnar & Thekkady (Kerala Nature & Wildlife)', 'Andaman Islands (Havelock & Radhanagar Beach)'],
    keyHighlights: 'Child-friendly resorts, calm beaches, scenic tea gardens, elephant sanctuaries, accessible forts, boat cruises.',
    budgetGuide: 'Budget: ₹25k–40k | Mid-Range: ₹50k–75k | Luxury Heritage/Resorts: ₹1L+ for family of 3-4.',
  },
  beach: {
    destinations: ['Goa (Palolem, Morjim, Fontainhas)', 'Gokarna (Om Beach & Kudle Beach, Karnataka)', 'Varkala (Cliff Beach & Mineral Springs, Kerala)', 'Andaman & Nicobar (Havelock & Neil Island)'],
    keyHighlights: 'Pristine coastal stretches, calm swimming coves, cliffside sunset dining, scuba & water sports, slow cafes.',
    budgetGuide: 'Budget: ₹15k–25k | Mid-Range: ₹35k–55k | Luxury Coastal Villas: ₹85k+.',
  },
  mountain: {
    destinations: ['Munnar (Tea Hills, Kerala)', 'Manali & Jibhi (Himachal Valleys)', 'Ooty & Coonoor (Nilgiri Tea & Heritage Rail)', 'Dharamshala & McLeodGanj (Cedar Forests & Tibetan Culture)'],
    keyHighlights: 'Scenic high-altitude viewpoints, peaceful pine forests, cool weather, tea estate walks, budget homestays.',
    budgetGuide: 'Budget: ₹12k–22k | Mid-Range: ₹30k–48k | Luxury Mountain Chalets: ₹70k+.',
  },
  budget: {
    destinations: ['Gokarna (Beach shacks & temple town)', 'Rishikesh (Ganga ghats, yoga & river camps)', 'Hampi (UNESCO boulder ruins & cafe life)', 'Pondicherry (French Quarter walks & Auroville)'],
    keyHighlights: 'Affordable guesthouses, walking-friendly towns, free cultural sites, shared taxis, delicious local street dining.',
    budgetGuide: 'Budget: ₹8k–18k per person for 3-5 days inclusive of transit & stay.',
  },
  senior: {
    destinations: ['Pondicherry (Quiet promenade & flat walking)', 'Udaipur (Lakeside luxury & minimal steps)', 'Coorg (Slow coffee estate retreats)', 'Kovalam (Ayurvedic wellness & beach walks)'],
    keyHighlights: 'Accessible accommodation, gentle terrain, peaceful atmosphere, top medical facility proximity, serene lake views.',
    budgetGuide: 'Mid-Range: ₹40k–65k | Premium Wellness: ₹85k+.',
  },
  romantic: {
    destinations: ['Udaipur (Lake Pichola palace views)', 'Andaman Islands (Secluded white sand coves)', 'Kumarakom (Backwater luxury houseboats)', 'Munnar (Mist-covered mountain villas)'],
    keyHighlights: 'Candlelight waterfront dining, private catamaran sails, heritage palace stays, sunset viewpoints.',
    budgetGuide: 'Mid-Range: ₹45k–70k | Ultra-Luxury: ₹1.2L+.',
  },
  adventure: {
    destinations: ['Rishikesh (White water rafting & bungee)', 'Leh-Ladakh (High altitude passes & mountain biking)', 'Bir Billing (World paragliding capital)', 'Meghalaya (Living root bridges & caving)'],
    keyHighlights: 'Trekking trails, river rapids, cliff jumps, certified outdoor guides, dramatic topography.',
    budgetGuide: 'Budget: ₹18k–30k | Guided Expedition: ₹50k–80k.',
  },
  spiritual: {
    destinations: ['Varanasi (Subah-e-Banaras & Ganga Aarti)', 'Rishikesh & Haridwar (Spiritual ashrams & riverbanks)', 'Tirupati & Madurai (Magnificent temple architecture)', 'Amritsar (Golden Temple & community Langar)'],
    keyHighlights: 'Centuries-old heritage rituals, sacred architecture, soul-stirring music, historic ghats.',
    budgetGuide: 'Budget: ₹10k–20k | Mid-Range: ₹28k–45k.',
  },
};

// Extract concise domain name for clean citation
const extractDomain = (urlString: string): string => {
  try {
    const parsed = new URL(urlString);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
};

// Identify travel intent from natural language
export const detectTravelIntent = (query: string): TravelResearchDossier['intent'] => {
  const q = query.toLowerCase();
  if (q.includes('family') || q.includes('kids') || q.includes('children') || q.includes('parents')) {
    if (q.includes('parent') || q.includes('senior') || q.includes('elder')) return 'senior';
    return 'family';
  }
  if (q.includes('beach') || q.includes('coast') || q.includes('sea') || q.includes('ocean') || q.includes('island')) {
    return 'beach';
  }
  if (q.includes('mountain') || q.includes('hill') || q.includes('himalaya') || q.includes('altitude') || q.includes('trek')) {
    return 'mountain';
  }
  if (q.includes('budget') || q.includes('cheap') || q.includes('affordable') || q.includes('low cost')) {
    return 'budget';
  }
  if (q.includes('romantic') || q.includes('couple') || q.includes('honeymoon')) {
    return 'romantic';
  }
  if (q.includes('adventure') || q.includes('rafting') || q.includes('safari') || q.includes('wildlife')) {
    return 'adventure';
  }
  if (q.includes('spiritual') || q.includes('temple') || q.includes('pilgrimage') || q.includes('ghat')) {
    return 'spiritual';
  }
  if (
    q.includes('goa') ||
    q.includes('mumbai') ||
    q.includes('jaipur') ||
    q.includes('delhi') ||
    q.includes('kerala') ||
    q.includes('munnar') ||
    q.includes('ladakh') ||
    q.includes('manali') ||
    q.includes('andaman') ||
    q.includes('udaipur') ||
    q.includes('varanasi') ||
    q.includes('rishikesh') ||
    q.includes('gokarna') ||
    q.includes('varkala') ||
    q.includes('kyoto') ||
    q.includes('amalfi')
  ) {
    return 'specific_destination';
  }
  return 'general';
};

// Build optimal search query for live research
const buildSearchQuery = (query: string, intent: TravelResearchDossier['intent']): string => {
  const clean = query.replace(/[?.,!]/g, ' ').trim();
  switch (intent) {
    case 'family':
      return `${clean} best family travel destinations attractions budget season travel guide`;
    case 'beach':
      return `${clean} best beach destinations travel guide activities season budget`;
    case 'mountain':
      return `${clean} best mountain hill stations travel guide itinerary budget`;
    case 'budget':
      return `${clean} budget travel destinations cost breakdown itinerary guide`;
    case 'senior':
      return `${clean} peaceful senior friendly accessible travel destinations guide`;
    case 'romantic':
      return `${clean} romantic couple destinations travel guide scenic resorts`;
    case 'adventure':
      return `${clean} top adventure destinations activities trekking safari guide`;
    case 'spiritual':
      return `${clean} spiritual destinations heritage temples ghats guide`;
    case 'specific_destination':
      return `${clean} travel guide top attractions day itinerary budget season`;
    default:
      return `${clean} travel itinerary destination recommendations guide`;
  }
};

export const performTravelResearch = async (userQuery: string): Promise<TravelResearchDossier> => {
  const apiKey = process.env.SERPAPI_KEY?.trim();
  const intent = detectTravelIntent(userQuery);
  const timestamp = new Date().toISOString();
  const verifiedHub = VERIFIED_CATEGORY_HUBS[intent];

  const verifiedHubContext = verifiedHub
    ? `[Curated Verified Intelligence: ${intent.toUpperCase()} TRAVEL]\n• Recommended Hubs: ${verifiedHub.destinations.join(', ')}\n• Key Experiences: ${verifiedHub.keyHighlights}\n• Indicative Budget Benchmarks: ${verifiedHub.budgetGuide}\n`
    : '';

  if (!apiKey) {
    return {
      query: userQuery,
      intent,
      isLiveSearchActive: false,
      searchResults: [],
      retrievalTimestamp: timestamp,
      formattedResearchNote: `[Live Search API is not configured on the server; providing curated verified destination knowledge without live web citations]\n${verifiedHubContext}`,
    };
  }

  const searchQuery = buildSearchQuery(userQuery, intent);
  const searchUrl = new URL('https://serpapi.com/search.json');
  searchUrl.searchParams.set('engine', 'google');
  searchUrl.searchParams.set('q', searchQuery);
  searchUrl.searchParams.set('num', '5');
  searchUrl.searchParams.set('hl', 'en');
  searchUrl.searchParams.set('api_key', apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9500);

  try {
    const res = await fetch(searchUrl, { signal: controller.signal });
    if (!res.ok) {
      console.warn('[Travel Research] SerpApi search returned non-200:', res.status);
      return {
        query: userQuery,
        intent,
        isLiveSearchActive: false,
        searchResults: [],
        retrievalTimestamp: timestamp,
        formattedResearchNote: `[Live web search unavailable (status ${res.status}); using curated verified travel knowledge base]\n${verifiedHubContext}`,
      };
    }

    const data: any = await res.json();
    const rawResults = Array.isArray(data?.organic_results) ? data.organic_results : [];

    const searchResults: ResearchItem[] = rawResults
      .slice(0, 4)
      .map((r: any): ResearchItem => ({
        title: r.title || 'Travel Guide Reference',
        snippet: r.snippet || '',
        url: r.link || '',
        domain: extractDomain(r.link || ''),
      }))
      .filter((r: ResearchItem) => Boolean(r.url && r.snippet));

    let formattedNote = `${verifiedHubContext}\n[Live Web Research Retrieved: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}]\n`;
    if (searchResults.length > 0) {
      formattedNote += searchResults
        .map(
          (r: ResearchItem, i: number) =>
            `Reference ${i + 1} (${r.domain}): "${r.title}"\nKey Findings: ${r.snippet}\nSource URL: ${r.url}`
        )
        .join('\n\n');
    } else {
      formattedNote += '[No direct live search matches returned; rely on verified destination knowledge]';
    }

    return {
      query: userQuery,
      intent,
      isLiveSearchActive: searchResults.length > 0,
      searchResults,
      retrievalTimestamp: timestamp,
      formattedResearchNote: formattedNote,
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    console.warn(`[Travel Research] Live search fallback (${isTimeout ? 'timeout' : err?.message})`);
    return {
      query: userQuery,
      intent,
      isLiveSearchActive: false,
      searchResults: [],
      retrievalTimestamp: timestamp,
      formattedResearchNote: `[Live web search timed out; synthesized using verified travel knowledge base]\n${verifiedHubContext}`,
    };
  } finally {
    clearTimeout(timeout);
  }
};
