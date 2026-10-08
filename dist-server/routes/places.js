import { Router } from 'express';
import https from 'node:https';
const placesRouter = Router();
const PLACE_IMAGES = {
    hotel: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
    ],
    hostel: [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596178060810-72660e5ff30e?q=80&w=800&auto=format&fit=crop',
    ],
    resort: [
        'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
    ],
    club: [
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1574096079513-d8259312b785?q=80&w=800&auto=format&fit=crop',
    ],
    shopping: [
        'https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=800&auto=format&fit=crop',
    ],
    restaurant: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop',
    ],
    activity: [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop',
    ],
};
function getOverpassCategoryTag(category) {
    switch (category) {
        case 'hotel':
            return '["tourism"="hotel"]';
        case 'hostel':
            return '["tourism"="hostel"]';
        case 'resort':
            return '["tourism"="resort"]';
        case 'club':
            return '["amenity"="nightclub"]';
        case 'shopping':
            return '["shop"]';
        case 'restaurant':
            return '["amenity"="restaurant"]';
        case 'activity':
            return '["tourism"="attraction"]';
        default:
            return '["tourism"]';
    }
}
/**
 * Fetch live hotels using SerpApi Google Hotels engine
 */
async function fetchSerpApiHotels(city, category) {
    const apiKey = process.env.SERPAPI_KEY?.trim();
    if (!apiKey)
        return [];
    const checkIn = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const checkOut = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    const params = new URLSearchParams({
        engine: 'google_hotels',
        q: `${city} ${category}`,
        check_in_date: checkIn,
        check_out_date: checkOut,
        adults: '2',
        currency: 'INR',
        api_key: apiKey,
    });
    try {
        const res = await fetch(`https://serpapi.com/search?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });
        if (!res.ok)
            return [];
        const data = await res.json();
        const properties = data.properties || [];
        const list = [];
        properties.forEach((prop, i) => {
            if (!prop.name)
                return;
            const rate = prop.rate_per_night?.lowest;
            let priceLevel = '$$';
            if (rate) {
                const num = parseFloat(String(rate).replace(/[^0-9.]/g, ''));
                if (num > 15000)
                    priceLevel = '$$$$';
                else if (num > 7000)
                    priceLevel = '$$$';
                else if (num > 3000)
                    priceLevel = '$$';
                else
                    priceLevel = '$';
            }
            list.push({
                id: `serp_hotel_${prop.hotel_id || i}`,
                name: prop.name,
                category,
                city,
                address: prop.description || `${prop.name}, ${city}`,
                rating: prop.overall_rating || 4.5,
                priceLevel,
                image: prop.images?.[0]?.thumbnail ||
                    prop.thumbnail ||
                    PLACE_IMAGES[category]?.[i % (PLACE_IMAGES[category]?.length || 1)] ||
                    PLACE_IMAGES.hotel[0],
                lat: prop.gps_coordinates?.latitude,
                lng: prop.gps_coordinates?.longitude,
                bookingUrl: prop.link || `https://www.google.com/travel/hotels?q=${encodeURIComponent(prop.name + ' ' + city)}`,
                amenities: Array.isArray(prop.amenities) ? prop.amenities.slice(0, 5) : ['Free Wi-Fi', 'Breakfast', 'Pool'],
            });
        });
        return list;
    }
    catch (err) {
        console.error('SerpApi Google Hotels error:', err);
        return [];
    }
}
function fetchOverpassPlaces(lat, lng, category, cityName) {
    return new Promise((resolve) => {
        const tag = getOverpassCategoryTag(category);
        const query = `[out:json][timeout:15];(node${tag}(around:8000,${lat},${lng});way${tag}(around:8000,${lat},${lng}););out center 25;`;
        const encoded = encodeURIComponent(query);
        const url = `https://overpass-api.de/api/interpreter?data=${encoded}`;
        const req = https.get(url, { headers: { 'User-Agent': 'AetheraTravelApp/1.0' } }, (res) => {
            let raw = '';
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => {
                try {
                    const data = JSON.parse(raw);
                    const elements = data.elements || [];
                    const list = [];
                    const images = PLACE_IMAGES[category] || PLACE_IMAGES.hotel;
                    elements.forEach((el, i) => {
                        const elLat = el.lat || el.center?.lat;
                        const elLng = el.lon || el.center?.lon;
                        const tags = el.tags || {};
                        const name = tags.name || tags['name:en'] || tags.operator;
                        if (!name)
                            return;
                        const street = tags['addr:street'] || '';
                        const city = tags['addr:city'] || cityName;
                        const address = [street, city].filter(Boolean).join(', ') || tags['addr:full'] || `${cityName} Area`;
                        const image = images[i % images.length];
                        list.push({
                            id: `place_${el.id || i}`,
                            name,
                            category,
                            city: cityName,
                            address,
                            rating: 4.2 + ((i % 8) * 0.1),
                            priceLevel: (i % 3 === 0 ? '$$$' : i % 3 === 1 ? '$$' : '$'),
                            image,
                            lat: elLat,
                            lng: elLng,
                            openingHours: tags.opening_hours || '10:00 AM – 10:00 PM',
                            bookingUrl: tags.website || `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + cityName)}`,
                        });
                    });
                    resolve(list);
                }
                catch {
                    resolve([]);
                }
            });
        });
        req.on('error', () => resolve([]));
        req.setTimeout(8000, () => {
            req.destroy();
            resolve([]);
        });
    });
}
placesRouter.get('/discover', async (req, res) => {
    const city = req.query.city || 'Goa';
    const category = req.query.category || 'hotel';
    const lat = parseFloat(req.query.lat) || 15.2993;
    const lng = parseFloat(req.query.lng) || 74.1240;
    try {
        let places = [];
        // If querying hotels / resorts / hostels, try SerpApi Google Hotels first
        if (category === 'hotel' || category === 'resort' || category === 'hostel') {
            places = await fetchSerpApiHotels(city, category);
        }
        // If no SerpApi results or non-hotel category, use Overpass spatial places
        if (places.length === 0) {
            places = await fetchOverpassPlaces(lat, lng, category, city);
        }
        return res.json({
            success: true,
            category,
            city,
            count: places.length,
            places,
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            error: err?.message || 'Unable to discover places.',
            places: [],
        });
    }
});
export default placesRouter;
//# sourceMappingURL=places.js.map