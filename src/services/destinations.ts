export interface DestinationInfo {
  city: string;
  country: string;
  region: string;
  image: string;
  secondaryImage?: string;
  lat: number;
  lng: number;
  xPercent: number; // for custom map visualizations
  yPercent: number;
  attractions: string[];
  activities: { name: string; styles: string[] }[];
  recommendedDuration: number; // in days
  styles: string[];
  budgetLevel: '$$$' | '$$' | '$';
}

export const DESTINATIONS: DestinationInfo[] = [
  {
    city: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=800&auto=format&fit=crop',
    lat: 18.9220,
    lng: 72.8347,
    xPercent: 28,
    yPercent: 48,
    recommendedDuration: 3,
    styles: ['culture', 'food', 'heritage', 'nightlife', 'luxury'],
    budgetLevel: '$$$',
    attractions: ['Gateway of India', 'Marine Drive Promenade', 'Kala Ghoda Art Precinct', 'Colaba Causeway', 'Chhatrapati Shivaji Terminus'],
    activities: [
      { name: 'Heritage architectural walk in Colaba', styles: ['heritage', 'culture', 'photography'] },
      { name: 'Late-night street food crawl at Chowpatty', styles: ['food', 'relaxed'] },
      { name: 'Sunset drive along the Bandra-Worli Sea Link', styles: ['relaxed', 'photography'] },
      { name: 'Art gallery hopping in Fort & Kala Ghoda', styles: ['culture', 'luxury'] },
      { name: 'Early morning harbor boat excursion', styles: ['adventure', 'nature'] }
    ]
  },
  {
    city: 'Goa',
    region: 'Goa',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?q=80&w=800&auto=format&fit=crop',
    lat: 15.2993,
    lng: 74.1240,
    xPercent: 32,
    yPercent: 68,
    recommendedDuration: 4,
    styles: ['relaxed', 'adventure', 'food', 'nature', 'nightlife', 'wellness'],
    budgetLevel: '$$',
    attractions: ['Basilica of Bom Jesus', 'Anjuna Flea Market', 'Dudhsagar Waterfalls', 'Fontainhas Latin Quarter', 'Palolem Beach Coves'],
    activities: [
      { name: 'Private sunset catamaran sail', styles: ['luxury', 'relaxed', 'photography'] },
      { name: 'Heritage walking tour in Old Goa & Fontainhas', styles: ['heritage', 'culture'] },
      { name: 'Organic spice plantation tour & lunch', styles: ['nature', 'food', 'relaxed'] },
      { name: 'Scuba diving & water sports at Grande Island', styles: ['adventure'] },
      { name: 'Ayurvedic wellness massage & yoga session', styles: ['wellness', 'relaxed'] }
    ]
  },
  {
    city: 'Jaipur',
    region: 'Rajasthan',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop',
    lat: 26.9124,
    lng: 75.7873,
    xPercent: 35,
    yPercent: 28,
    recommendedDuration: 3,
    styles: ['culture', 'heritage', 'photography', 'luxury', 'budget'],
    budgetLevel: '$$',
    attractions: ['Hawa Mahal Palace of Winds', 'Amber Fort & Sheesh Mahal', 'City Palace Museum', 'Jantar Mantar Observatory', 'Patrika Gate'],
    activities: [
      { name: 'Golden hour photography at Hawa Mahal', styles: ['photography', 'culture'] },
      { name: 'Jeep safari & fort exploration at Amber Fort', styles: ['adventure', 'heritage'] },
      { name: 'Traditional Rajasthani Thali culinary tasting', styles: ['food', 'culture'] },
      { name: 'Bazaar walking tour for block-printed textiles', styles: ['budget', 'culture'] },
      { name: 'Stargazing dinner at Nahargarh Fort overlooking city', styles: ['luxury', 'relaxed'] }
    ]
  },
  {
    city: 'Delhi',
    region: 'Delhi NCR',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?q=80&w=800&auto=format&fit=crop',
    lat: 28.6139,
    lng: 77.2090,
    xPercent: 42,
    yPercent: 20,
    recommendedDuration: 3,
    styles: ['culture', 'food', 'heritage', 'photography', 'budget'],
    budgetLevel: '$$',
    attractions: ['Humayun’s Tomb', 'Qutub Minar Complex', 'Red Fort', 'India Gate', 'Lodhi Art District'],
    activities: [
      { name: 'Old Delhi street food tour by cycle rickshaw', styles: ['food', 'culture', 'budget'] },
      { name: 'Guided history walk at Humayun’s Tomb gardens', styles: ['heritage', 'culture', 'photography'] },
      { name: 'Murals and street art photo walk in Lodhi District', styles: ['photography', 'culture'] },
      { name: 'Fine-dining luxury experience in Chanakyapuri', styles: ['luxury', 'food'] },
      { name: 'Shopping for Indian handicrafts at Dilli Haat', styles: ['budget', 'culture'] }
    ]
  },
  {
    city: 'Kerala',
    region: 'Kerala',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop',
    lat: 9.9312,
    lng: 76.2673,
    xPercent: 55,
    yPercent: 88,
    recommendedDuration: 4,
    styles: ['relaxed', 'nature', 'wellness', 'culture'],
    budgetLevel: '$$',
    attractions: ['Fort Kochi Chinese Fishing Nets', 'Munnar Tea Estates', 'Alleppey Backwaters', 'Periyar Wildlife Sanctuary'],
    activities: [
      { name: 'Overnight luxury houseboat cruise in Alleppey', styles: ['relaxed', 'nature', 'luxury'] },
      { name: 'Ayurvedic rejuvenation massage & spa treatment', styles: ['wellness', 'relaxed'] },
      { name: 'Traditional Kathakali theater performance', styles: ['culture', 'heritage'] },
      { name: 'Misty sunrise hike in Munnar tea plantations', styles: ['nature', 'adventure', 'photography'] },
      { name: 'Fort Kochi history & colonial harbor walk', styles: ['heritage', 'culture'] }
    ]
  },
  {
    city: 'Bengaluru',
    region: 'Karnataka',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop',
    lat: 12.9716,
    lng: 77.5946,
    xPercent: 50,
    yPercent: 78,
    recommendedDuration: 2,
    styles: ['food', 'nightlife', 'relaxed', 'nature'],
    budgetLevel: '$$$',
    attractions: ['Bangalore Palace', 'Cubbon Park Botanical Sanctuary', 'Lalbagh Glass House', 'Nandi Hills Summit'],
    activities: [
      { name: 'Craft microbrewery hopping in Indiranagar', styles: ['nightlife', 'food'] },
      { name: 'Early morning coffee & cycling in Cubbon Park', styles: ['nature', 'relaxed'] },
      { name: 'Palace architectural tour & history walk', styles: ['heritage', 'culture'] },
      { name: 'Sunrise excursion climb up Nandi Hills', styles: ['adventure', 'photography'] }
    ]
  },
  {
    city: 'Srinagar',
    region: 'Jammu & Kashmir',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
    lat: 34.0837,
    lng: 74.7973,
    xPercent: 38,
    yPercent: 10,
    recommendedDuration: 4,
    styles: ['nature', 'relaxed', 'photography', 'adventure', 'wellness'],
    budgetLevel: '$$$',
    attractions: ['Dal Lake Houseboats', 'Shalimar Bagh Mughal Gardens', 'Nishat Bagh', 'Gulmarg Meadow of Flowers'],
    activities: [
      { name: 'Sunrise Shikara boat ride on Dal Lake', styles: ['relaxed', 'photography', 'nature'] },
      { name: 'Overnight stay in a cedarwood luxury houseboat', styles: ['luxury', 'relaxed'] },
      { name: 'Guided alpine flora walk in Shalimar Gardens', styles: ['nature', 'wellness'] },
      { name: 'High-altitude Gondola cable car ride in Gulmarg', styles: ['adventure', 'nature'] }
    ]
  },
  {
    city: 'Udaipur',
    region: 'Rajasthan',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=800&auto=format&fit=crop',
    lat: 24.5854,
    lng: 73.7125,
    xPercent: 31,
    yPercent: 35,
    recommendedDuration: 3,
    styles: ['culture', 'heritage', 'photography', 'luxury', 'relaxed'],
    budgetLevel: '$$$',
    attractions: ['Udaipur City Palace', 'Lake Pichola & Lake Palace', 'Sajjangarh Monsoon Palace', 'Jag Mandir Island'],
    activities: [
      { name: 'Lakeside sunset cruise on Lake Pichola', styles: ['relaxed', 'luxury', 'photography'] },
      { name: 'Traditional Dharohar folk puppet & music show', styles: ['culture', 'heritage'] },
      { name: 'Fine dining lakeside rooftop overlooking the palace', styles: ['food', 'luxury'] },
      { name: 'Hillside drive to Sajjangarh Monsoon Palace', styles: ['adventure', 'nature'] }
    ]
  },
  {
    city: 'Ladakh',
    region: 'Ladakh',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop',
    lat: 34.1526,
    lng: 77.5771,
    xPercent: 40,
    yPercent: 8,
    recommendedDuration: 5,
    styles: ['adventure', 'nature', 'photography', 'culture'],
    budgetLevel: '$$$',
    attractions: ['Pangong Tso Turquoise Lake', 'Thiksey & Hemis Gompas', 'Nubra Valley Sand Dunes', 'Khardung La Pass (17,982 ft)', 'Shanti Stupa'],
    activities: [
      { name: 'Sunrise reflection photography at Pangong Lake', styles: ['photography', 'nature'] },
      { name: 'Monastic dawn chanting ceremony at Thiksey Gompa', styles: ['culture', 'heritage'] },
      { name: 'Double-humped camel safari across Hunder dunes', styles: ['adventure', 'nature'] },
      { name: 'High-altitude stargazing under Milky Way dark skies', styles: ['photography', 'luxury'] },
      { name: 'Mountain pass crossing over Khardung La', styles: ['adventure'] }
    ]
  },
  {
    city: 'Rajasthan',
    region: 'Rajasthan',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1200&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=800&auto=format&fit=crop',
    lat: 26.9124,
    lng: 75.7873,
    xPercent: 35,
    yPercent: 28,
    recommendedDuration: 6,
    styles: ['heritage', 'culture', 'photography', 'luxury', 'food'],
    budgetLevel: '$$$',
    attractions: ['Amber Fort & Sheesh Mahal', 'Udaipur Lake Palace & Pichola', 'Jodhpur Mehrangarh Fort', 'Jaisalmer Golden Sand Dunes', 'Hawa Mahal'],
    activities: [
      { name: 'Royal heritage palace stay & bespoke dining', styles: ['luxury', 'heritage'] },
      { name: 'Sunset desert tent camp & traditional folk dance', styles: ['culture', 'adventure'] },
      { name: 'Private vintage boat charter on Lake Pichola', styles: ['relaxed', 'luxury'] },
      { name: 'Artisan textile block-printing & gem craft tour', styles: ['culture', 'photography'] }
    ]
  }
];

// Helper to search and filter cities
export const searchCities = (query: string): DestinationInfo[] => {
  if (!query) return [];
  const cleanQuery = query.toLowerCase().trim();
  return DESTINATIONS.filter(d => 
    d.city.toLowerCase().includes(cleanQuery) || 
    d.region.toLowerCase().includes(cleanQuery) || 
    d.country.toLowerCase().includes(cleanQuery)
  );
};

// Fallback generator for custom input cities
export const getOrCreateDestination = (cityName: string): DestinationInfo => {
  const match = DESTINATIONS.find(d => d.city.toLowerCase() === cityName.toLowerCase().trim());
  if (match) return match;

  // Otherwise create a structured fallback destination
  const formattedName = cityName.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    city: formattedName,
    region: 'India',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
    secondaryImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
    lat: 20.5937,
    lng: 78.9629,
    xPercent: 50,
    yPercent: 50,
    recommendedDuration: 2,
    styles: ['relaxed', 'culture', 'food'],
    budgetLevel: '$$',
    attractions: [`Scenic viewpoints in ${formattedName}`, `Local heritage district`, `Signature landmarks`],
    activities: [
      { name: `Explore ${formattedName} highlights & sights`, styles: ['culture', 'relaxed'] },
      { name: `Dine on traditional local dishes in ${formattedName}`, styles: ['food'] },
      { name: `Walking street bazaar exploration`, styles: ['budget', 'culture'] }
    ]
  };
};
