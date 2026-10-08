import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navigation,
  CheckCircle2,
  ExternalLink,
  Car,
  AlertCircle,
  RefreshCw,
  Clock,
  Compass,
  KeyRound,
  Crosshair,
  Maximize2,
} from 'lucide-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useJourneys } from '../../context/useJourneys';

interface LiveLocationMapProps {
  onRequestRide?: (name: string) => void;
}

interface GeocodedStop {
  id: string;
  name: string;
  dayNumber?: number;
  lat: number;
  lng: number;
  completed: boolean;
  isNext: boolean;
}

const AETHERA_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#fbf9f5' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#555555' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }, { weight: 2 }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#aaaaaa' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f0ede6' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e8ece5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e6e3dc' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#777777' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#eae6dd' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#444444' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f0ece3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbe5ec' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8899a6' }] },
];

export const LiveLocationMap = ({ onRequestRide }: LiveLocationMapProps) => {
  const { activeJourney } = useJourneys();

  // API & Map State
  const [mapStatus, setMapStatus] = useState<'loading' | 'missing_key' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapFocusMode, setMapFocusMode] = useState<'destination' | 'overview'>('destination');

  // Live GPS State
  const [gpsStatus, setGpsStatus] = useState<string>('GPS: Searching...');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  // Real Itinerary Stops & Directions
  const [stops, setStops] = useState<GeocodedStop[]>([]);
  const [completedStopIds, setCompletedStopIds] = useState<Set<string>>(new Set());
  const [nextStop, setNextStop] = useState<GeocodedStop | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceText: string; durationText: string } | null>(null);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const stopMarkersRef = useRef<google.maps.Marker[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastGeocodedLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Helper: Haversine distance between two points in km
  const getDistanceKm = useCallback((a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLng = Math.sin(dLng / 2);
    const h = sinDLat * sinDLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinDLng * sinDLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Reverse geocode user position (throttled when moving > 80m)
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) return;

    if (lastGeocodedLocationRef.current) {
      const prev = lastGeocodedLocationRef.current;
      const dist = Math.hypot(prev.lat - lat, prev.lng - lng) * 111000;
      if (dist < 80) return; // Skip if user moved less than 80m
    }

    lastGeocodedLocationRef.current = { lat, lng };
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const place = results[0];
        const sublocality = place.address_components.find((c) =>
          c.types.includes('sublocality') || c.types.includes('neighborhood')
        )?.long_name;
        const locality = place.address_components.find((c) => c.types.includes('locality'))?.long_name;
        const formatted = sublocality && locality ? `${sublocality}, ${locality}` : place.formatted_address.split(',')[0];
        setUserAddress(formatted || place.formatted_address);
      }
    });
  }, []);

  // Initialize and load Google Maps API
  const initGoogleMap = useCallback(async () => {
    if (!apiKey || apiKey.startsWith('your_')) {
      setMapStatus('missing_key');
      return;
    }

    setMapStatus('loading');
    setErrorMessage(null);

    try {
      setOptions({
        key: apiKey,
        v: 'weekly',
      });

      await importLibrary('maps');
      await importLibrary('routes');
      await importLibrary('geocoding');

      if (!mapContainerRef.current) return;

      const defaultCenter = {
        lat: activeJourney?.destinations?.[0]?.lat || 15.2993,
        lng: activeJourney?.destinations?.[0]?.lng || 74.1240,
      };

      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        styles: AETHERA_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      });

      mapInstanceRef.current = map;

      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#000000',
          strokeOpacity: 0.85,
          strokeWeight: 4,
        },
      });
      directionsRendererRef.current = directionsRenderer;

      setMapStatus('ready');
    } catch (err: any) {
      setMapStatus('error');
      setErrorMessage(err?.message || 'Unable to load Google Maps.');
    }
  }, [apiKey, activeJourney]);

  // Request & Watch User GPS
  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS: Unsupported');
      return;
    }

    setGpsStatus('GPS: Searching...');
    setPermissionDenied(false);

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const acc = pos.coords.accuracy;
        setUserLocation(coords);
        setGpsStatus(`GPS: ±${Math.round(acc)} m`);
        reverseGeocode(coords.lat, coords.lng);

        if (mapInstanceRef.current) {
          // Update or create live user pulsing marker
          if (!userMarkerRef.current) {
            userMarkerRef.current = new google.maps.Marker({
              position: coords,
              map: mapInstanceRef.current,
              title: 'Your Current Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2.5,
              },
            });
          } else {
            userMarkerRef.current.setPosition(coords);
          }

          // Accuracy Circle
          if (!accuracyCircleRef.current) {
            accuracyCircleRef.current = new google.maps.Circle({
              map: mapInstanceRef.current,
              center: coords,
              radius: acc,
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
              strokeColor: '#2563eb',
              strokeOpacity: 0.25,
              strokeWeight: 1,
            });
          } else {
            accuracyCircleRef.current.setCenter(coords);
            accuracyCircleRef.current.setRadius(acc);
          }
        }
      },
      (err) => {
        if (err.code === 1) {
          setPermissionDenied(true);
          setGpsStatus('GPS: Permission denied');
        } else {
          setGpsStatus('GPS: Unavailable');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );

    watchIdRef.current = id;
  }, [reverseGeocode]);

  // Extract and geocode real stops from active journey
  useEffect(() => {
    if (mapStatus !== 'ready' || typeof google === 'undefined' || !activeJourney) {
      setStops([]);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    const extractedStops: { name: string; dayNumber?: number }[] = [];

    // Extract stops from journey's real itinerary
    if (Array.isArray(activeJourney.itinerary)) {
      activeJourney.itinerary.forEach((day) => {
        if (Array.isArray(day.activities)) {
          day.activities.forEach((act) => {
            if (typeof act === 'string' && act.trim()) {
              extractedStops.push({ name: act.trim(), dayNumber: day.dayNumber });
            }
          });
        }
      });
    }

    // If no activities, extract from destinations
    if (extractedStops.length === 0 && Array.isArray(activeJourney.destinations)) {
      activeJourney.destinations.forEach((dest) => {
        if (Array.isArray(dest.attractions)) {
          dest.attractions.forEach((attr) => {
            extractedStops.push({ name: `${attr}, ${dest.city}` });
          });
        }
      });
    }

    // Limit to max 8 stops for clean map rendering
    const stopsToGeocode = extractedStops.slice(0, 8);
    if (stopsToGeocode.length === 0) {
      setStops([]);
      return;
    }

    const cityContext = activeJourney.city || activeJourney.destinations?.[0]?.city || '';
    const countryContext = activeJourney.country || activeJourney.destinations?.[0]?.country || '';
    const destLat = activeJourney.destinations?.[0]?.lat;
    const destLng = activeJourney.destinations?.[0]?.lng;

    // Build a region bias bounds around the destination (±1° ~110km box)
    const regionBias = (destLat && destLng)
      ? new google.maps.LatLngBounds(
          new google.maps.LatLng(destLat - 1, destLng - 1),
          new google.maps.LatLng(destLat + 1, destLng + 1)
        )
      : undefined;

    // Sequential geocoding with delay to avoid OVER_QUERY_LIMIT
    const geocodeSequentially = async (): Promise<GeocodedStop[]> => {
      const results: GeocodedStop[] = [];

      for (let index = 0; index < stopsToGeocode.length; index++) {
        const stopItem = stopsToGeocode[index];
        // Build a well-qualified search query: "Stop Name, City, Country"
        let query = stopItem.name;
        if (cityContext && !stopItem.name.toLowerCase().includes(cityContext.toLowerCase())) {
          query = `${stopItem.name}, ${cityContext}`;
        }
        if (countryContext && !query.toLowerCase().includes(countryContext.toLowerCase())) {
          query = `${query}, ${countryContext}`;
        }

        const geocoded = await new Promise<GeocodedStop>((resolve) => {
          geocoder.geocode(
            {
              address: query,
              ...(regionBias ? { bounds: regionBias } : {}),
            },
            (geoResults, status) => {
              if (status === google.maps.GeocoderStatus.OK && geoResults && geoResults[0]) {
                const loc = geoResults[0].geometry.location;
                resolve({
                  id: `stop_${index}`,
                  name: stopItem.name,
                  dayNumber: stopItem.dayNumber,
                  lat: loc.lat(),
                  lng: loc.lng(),
                  completed: false,
                  isNext: index === 0,
                });
              } else {
                // Tight cluster fallback around destination center (small random offsets)
                const baseLat = destLat || 15.2993;
                const baseLng = destLng || 74.1240;
                const angle = (index / stopsToGeocode.length) * 2 * Math.PI;
                const radius = 0.008 + index * 0.003; // ~1-3km offsets in a circle
                resolve({
                  id: `stop_${index}`,
                  name: stopItem.name,
                  dayNumber: stopItem.dayNumber,
                  lat: baseLat + Math.cos(angle) * radius,
                  lng: baseLng + Math.sin(angle) * radius,
                  completed: false,
                  isNext: index === 0,
                });
              }
            }
          );
        });

        results.push(geocoded);

        // Small delay between requests to avoid rate limiting
        if (index < stopsToGeocode.length - 1) {
          await new Promise((r) => setTimeout(r, 150));
        }
      }

      return results;
    };

    geocodeSequentially().then((geocodedList) => {
      setStops(geocodedList);
    });
  }, [mapStatus, activeJourney]);

  // Update stop markers and calculate real directions
  useEffect(() => {
    if (mapStatus !== 'ready' || !mapInstanceRef.current || typeof google === 'undefined') return;

    // Clear old stop markers
    stopMarkersRef.current.forEach((m) => m.setMap(null));
    stopMarkersRef.current = [];

    const map = mapInstanceRef.current;
    const stopsBounds = new google.maps.LatLngBounds();

    // Determine next upcoming stop
    const firstUncompleted = stops.find((s) => !completedStopIds.has(s.id)) || null;
    setNextStop(firstUncompleted);

    // Calculate the center of all stops for distance checks
    let stopsCenterLat = 0;
    let stopsCenterLng = 0;
    if (stops.length > 0) {
      stops.forEach((s) => { stopsCenterLat += s.lat; stopsCenterLng += s.lng; });
      stopsCenterLat /= stops.length;
      stopsCenterLng /= stops.length;
    }

    // Check if user is near the destination area (within 100km)
    const userIsNearDestination = userLocation && stops.length > 0
      ? getDistanceKm(userLocation, { lat: stopsCenterLat, lng: stopsCenterLng }) < 100
      : false;

    stops.forEach((stop, index) => {
      const isDone = completedStopIds.has(stop.id);
      const isCurrentNext = firstUncompleted?.id === stop.id;

      const marker = new google.maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        title: stop.name,
        zIndex: isCurrentNext ? 1000 : isDone ? 1 : 500,
        label: {
          text: `${index + 1}`,
          color: isDone ? '#999999' : isCurrentNext ? '#ffffff' : '#000000',
          fontSize: '11px',
          fontWeight: '600',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isCurrentNext ? 16 : 12,
          fillColor: isDone ? '#f5f5f5' : isCurrentNext ? '#000000' : '#ffffff',
          fillOpacity: 1,
          strokeColor: isCurrentNext ? '#000000' : isDone ? '#d4d4d4' : '#000000',
          strokeWeight: isCurrentNext ? 3 : 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px 10px; font-family: 'Inter', sans-serif; min-width: 140px;">
            <div style="font-size: 9px; font-family: monospace; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Stop ${index + 1}${stop.dayNumber ? ` · Day ${stop.dayNumber}` : ''}</div>
            <div style="font-weight: 600; font-size: 13px; color: #000; margin-top: 3px;">${stop.name}</div>
            ${isDone ? '<div style="font-size: 10px; color: #059669; font-weight: 500; margin-top: 4px;">✓ Completed</div>' : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      stopMarkersRef.current.push(marker);
      stopsBounds.extend(new google.maps.LatLng(stop.lat, stop.lng));
    });

    // Draw real route between user (or origin) and next stop
    if (firstUncompleted && directionsRendererRef.current) {
      const directionsService = new google.maps.DirectionsService();
      const origin = userLocation
        ? new google.maps.LatLng(userLocation.lat, userLocation.lng)
        : stops[0]
        ? new google.maps.LatLng(stops[0].lat, stops[0].lng)
        : null;

      if (origin) {
        directionsService.route(
          {
            origin,
            destination: new google.maps.LatLng(firstUncompleted.lat, firstUncompleted.lng),
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (res, status) => {
            if (status === google.maps.DirectionsStatus.OK && res) {
              directionsRendererRef.current?.setDirections(res);
              const leg = res.routes[0]?.legs[0];
              if (leg) {
                setRouteInfo({
                  distanceText: leg.distance?.text || '',
                  durationText: leg.duration?.text || '',
                });
              }
            } else {
              directionsRendererRef.current?.setDirections({ routes: [] } as any);
              setRouteInfo(null);
            }
          }
        );
      }
    }

    // Smart bounds fitting based on focus mode and user distance
    if (stops.length > 0) {
      if (mapFocusMode === 'destination' || !userIsNearDestination) {
        // Focus on destination stops only — don't zoom out to include far-away user
        if (!stopsBounds.isEmpty()) {
          map.fitBounds(stopsBounds, { top: 50, right: 50, bottom: 50, left: 50 });
          // Prevent excessive zoom-in when stops are very close together
          const listener = google.maps.event.addListenerOnce(map, 'idle', () => {
            if ((map.getZoom() || 0) > 16) map.setZoom(16);
          });
          // Clean up listener after a short timeout
          setTimeout(() => google.maps.event.removeListener(listener), 2000);
        }
      } else {
        // Overview: include both user and all stops
        const overviewBounds = new google.maps.LatLngBounds();
        if (userLocation) {
          overviewBounds.extend(new google.maps.LatLng(userLocation.lat, userLocation.lng));
        }
        stops.forEach((s) => overviewBounds.extend(new google.maps.LatLng(s.lat, s.lng)));
        if (!overviewBounds.isEmpty()) {
          map.fitBounds(overviewBounds, { top: 50, right: 50, bottom: 50, left: 50 });
        }
      }
    } else if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  }, [stops, userLocation, completedStopIds, mapStatus, mapFocusMode, getDistanceKm]);

  // Toggle stop completed
  const handleToggleStop = (stopId: string) => {
    setCompletedStopIds((prev) => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
      } else {
        next.add(stopId);
      }
      return next;
    });
  };

  // Recenter map on user location
  const handleRecenter = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(userLocation);
      mapInstanceRef.current.setZoom(15);
    } else {
      startWatchingLocation();
    }
  };

  // Mount on first render
  useEffect(() => {
    initGoogleMap();
    startWatchingLocation();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [initGoogleMap, startWatchingLocation]);

  // Computed route progress
  const totalStops = stops.length;
  const completedCount = stops.filter((s) => completedStopIds.has(s.id)).length;

  const directionsUrl = nextStop
    ? userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(nextStop.name)}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(nextStop.name)}&travelmode=driving`
    : '#';

  return (
    <section id="live-map" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-1">
            REAL-TIME LIVE GPS & ROUTE
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-headline leading-none">
            Live Journey Radar
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-2">
            {activeJourney
              ? `Live GPS tracking for ${activeJourney.destination || activeJourney.city || 'your current journey'}.`
              : 'Live situational GPS and interactive waypoint navigator.'}
          </p>
        </div>

        {/* GPS Status Indicator & Recenter Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-neutral-100 border border-[#E7E5E2] text-xs font-mono text-black">
            <span
              className={`w-2 h-2 rounded-full ${
                permissionDenied
                  ? 'bg-red-500'
                  : userLocation
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-400 animate-spin'
              }`}
            />
            <span>{gpsStatus}</span>
          </div>

          <button
            type="button"
            onClick={handleRecenter}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-mono transition-all cursor-pointer shadow-xs"
            title="Locate me and recenter"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Locate Me</span>
          </button>
        </div>
      </div>

      {/* Main Map Card */}
      <div className="bg-white border border-[#E7E5E2] rounded-[32px] p-4 sm:p-6 shadow-sm overflow-hidden flex flex-col space-y-6">
        {/* Map Container View */}
        <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden bg-[#F5F4F0] border border-[#E7E5E2]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[320px] sm:min-h-[420px]" />

          {/* Missing Google Maps API Key State */}
          {mapStatus === 'missing_key' && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
              <KeyRound className="w-10 h-10 text-neutral-400 mb-3 stroke-[1.5]" />
              <h3 className="font-instrument text-2xl text-black mb-1">Google Maps Key Required</h3>
              <p className="text-xs font-inter text-neutral-600 max-w-md mb-4 leading-relaxed">
                Connect the Google Maps API to enable the live map. Set <code className="bg-neutral-100 px-2 py-0.5 rounded text-black font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in your environment.
              </p>
              <span className="text-[11px] font-mono text-neutral-500">
                APIs required: Maps JavaScript API, Places API, Directions API
              </span>
            </div>
          )}

          {/* Map Loading State */}
          {mapStatus === 'loading' && (
            <div className="absolute inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center gap-3 z-20">
              <RefreshCw className="w-7 h-7 animate-spin text-black stroke-[1.5]" />
              <span className="font-mono text-xs text-neutral-600">Loading map…</span>
            </div>
          )}

          {/* Map Error State */}
          {mapStatus === 'error' && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center z-20">
              <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
              <h4 className="font-instrument text-xl text-black">Unable to load the map.</h4>
              <p className="text-xs text-neutral-600 mt-1 mb-4">{errorMessage || 'Check network connection or API quota.'}</p>
              <button
                type="button"
                onClick={initGoogleMap}
                className="px-4 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Retry Map
              </button>
            </div>
          )}

          {/* Real Live Geocoded "YOU ARE HERE" Banner Overlay */}
          {userLocation && (
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-[#E7E5E2] rounded-2xl px-3.5 py-2 shadow-xs flex items-center gap-2.5 max-w-[85%] sm:max-w-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
              <div className="text-left overflow-hidden">
                <span className="text-[9px] font-mono uppercase text-neutral-500 tracking-wider block">YOU ARE HERE</span>
                <span className="text-xs font-inter font-semibold text-black truncate block">
                  {userAddress || `${userLocation.lat.toFixed(4)}°, ${userLocation.lng.toFixed(4)}°`}
                </span>
              </div>
            </div>
          )}

          {/* Focus Toggle Button */}
          {stops.length > 0 && (
            <button
              type="button"
              onClick={() => setMapFocusMode((m) => (m === 'destination' ? 'overview' : 'destination'))}
              className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#E7E5E2] rounded-full px-3 py-1.5 shadow-xs text-[10px] font-mono text-black hover:bg-black hover:text-white transition-all cursor-pointer"
              title={mapFocusMode === 'destination' ? 'Show overview with your location' : 'Focus on destination stops'}
            >
              {mapFocusMode === 'destination' ? (
                <><Maximize2 className="w-3 h-3" /><span>Overview</span></>
              ) : (
                <><Crosshair className="w-3 h-3" /><span>Focus Stops</span></>
              )}
            </button>
          )}

          {/* Permission Denied Banner Overlay */}
          {permissionDenied && (
            <div className="absolute bottom-4 left-4 right-4 z-10 bg-amber-50/95 border border-amber-200 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs text-amber-900 font-inter">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Enable location permissions in browser settings to view your live GPS position.</span>
              </div>
              <button
                type="button"
                onClick={startWatchingLocation}
                className="ml-2 px-3 py-1 bg-amber-900 text-white rounded-full text-[11px] font-mono shrink-0 hover:bg-black transition-colors"
              >
                Enable
              </button>
            </div>
          )}
        </div>

        {/* Bottom Details & Next Stop Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Real Route Progress & Stops List */}
          <div className="lg:col-span-6 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E2]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">ITINERARY WAYPOINTS</span>
                <h4 className="font-instrument text-xl text-black">
                  Route progress {totalStops > 0 ? `${completedCount} of ${totalStops} done` : 'No stops set'}
                </h4>
              </div>
              {totalStops > 0 && (
                <span className="text-xs font-mono font-bold bg-white border border-neutral-200 px-2.5 py-1 rounded-full">
                  {Math.round((completedCount / totalStops) * 100)}%
                </span>
              )}
            </div>

            {/* Stops Checklist */}
            {stops.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {stops.map((stop, i) => {
                  const isDone = completedStopIds.has(stop.id);
                  const isCurrent = nextStop?.id === stop.id;

                  return (
                    <div
                      key={stop.id}
                      onClick={() => handleToggleStop(stop.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white border-black shadow-xs ring-1 ring-black'
                          : isDone
                          ? 'bg-neutral-100/70 border-neutral-200 opacity-60'
                          : 'bg-white border-[#E7E5E2] hover:border-neutral-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-black text-white'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                        </div>
                        <span className={`text-xs font-inter line-clamp-1 ${isDone ? 'line-through text-neutral-500' : 'text-black font-medium'}`}>
                          {stop.name}
                        </span>
                      </div>

                      {isCurrent && (
                        <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded uppercase shrink-0">
                          Next Up
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-neutral-500 font-inter text-xs">
                <Compass className="w-7 h-7 mx-auto mb-2 text-neutral-400" />
                Add stops to your active itinerary to visualize your live route and waypoints here.
              </div>
            )}
          </div>

          {/* Right Column: Next Stop Card with Real Distance & Directions */}
          <div className="lg:col-span-6 bg-white border border-[#E7E5E2] rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                  NEXT TARGET WAYPOINT
                </span>
                {routeInfo && (
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {routeInfo.distanceText} · {routeInfo.durationText}
                  </span>
                )}
              </div>

              <h3 className="font-instrument text-2xl sm:text-3xl text-black mb-1">
                {nextStop ? nextStop.name : 'All waypoints completed'}
              </h3>

              <p className="text-xs text-neutral-600 font-inter">
                {nextStop
                  ? 'Real-time navigation enabled via Google Maps Directions API.'
                  : 'You have reached or checked off all scheduled waypoints for today.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Live GPS Sync</span>
              </div>

              <div className="flex items-center gap-2">
                {onRequestRide && nextStop && (
                  <button
                    type="button"
                    onClick={() => onRequestRide(nextStop.name)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-300 hover:border-black text-xs font-mono text-black transition-colors cursor-pointer bg-white"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Get Ride</span>
                  </button>
                )}

                {nextStop && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all shadow-xs"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
