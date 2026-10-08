import { Router } from 'express';
const photosRouter = Router();
/**
 * GET /api/photos/location
 * Query params:
 * - q: location or landmark name (e.g. "Goa beaches", "Jaipur Palace")
 * - data_id: Google Maps data ID (if available, uses google_maps_photos engine)
 * - engine: 'google_images' | 'google_maps_photos' (defaults to 'google_images')
 */
photosRouter.get('/location', async (req, res) => {
    const query = req.query.q?.trim() || 'Goa travel scenic';
    const dataId = req.query.data_id?.trim();
    const engineParam = req.query.engine?.trim();
    const apiKey = process.env.SERPAPI_KEY?.trim();
    if (!apiKey) {
        return res.status(503).json({
            success: false,
            error: 'SerpApi is not configured. Please configure SERPAPI_KEY in backend .env',
            photos: [],
        });
    }
    try {
        let serpApiUrl;
        if (dataId || engineParam === 'google_maps_photos') {
            // 1. Google Maps Photos Engine
            const params = new URLSearchParams({
                engine: 'google_maps_photos',
                data_id: dataId || query,
                api_key: apiKey,
            });
            serpApiUrl = `https://serpapi.com/search?${params.toString()}`;
        }
        else {
            // 2. Google Images Engine
            const searchTerms = `${query} travel aesthetic 4k`;
            const params = new URLSearchParams({
                engine: 'google_images',
                q: searchTerms,
                api_key: apiKey,
                num: '20',
            });
            serpApiUrl = `https://serpapi.com/search?${params.toString()}`;
        }
        const response = await fetch(serpApiUrl, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('SerpApi Photos error:', response.status, errorText);
            return res.status(response.status).json({
                success: false,
                error: `SerpApi Photos failed with status ${response.status}`,
                photos: [],
            });
        }
        const data = await response.json();
        const photos = [];
        // Parse Google Maps Photos engine output
        if (data.photos && Array.isArray(data.photos)) {
            data.photos.forEach((item, idx) => {
                if (item.image || item.thumbnail) {
                    photos.push({
                        id: `photo_map_${idx}`,
                        title: item.title || query,
                        url: item.image || item.thumbnail,
                        thumbnail: item.thumbnail || item.image,
                        source: 'Google Maps Photos',
                    });
                }
            });
        }
        // Parse Google Images engine output
        if (data.images_results && Array.isArray(data.images_results)) {
            data.images_results.forEach((item, idx) => {
                if (item.original || item.thumbnail) {
                    photos.push({
                        id: `photo_img_${idx}`,
                        title: item.title || query,
                        url: item.original || item.thumbnail,
                        thumbnail: item.thumbnail || item.original,
                        source: item.source || 'Google Images',
                        width: item.original_width,
                        height: item.original_height,
                    });
                }
            });
        }
        return res.json({
            success: true,
            query,
            count: photos.length,
            photos,
        });
    }
    catch (err) {
        console.error('Error fetching SerpApi photos:', err);
        return res.status(500).json({
            success: false,
            error: err?.message || 'Failed to fetch location photos.',
            photos: [],
        });
    }
});
export default photosRouter;
//# sourceMappingURL=photos.js.map