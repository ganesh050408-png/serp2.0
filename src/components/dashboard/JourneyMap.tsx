import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, Compass, Plus } from 'lucide-react';
import L from 'leaflet';
import { StoredJourney } from '../../services/travelStorage';
import { DESTINATIONS } from '../../services/destinations';
import { City } from 'country-state-city';

export interface StopDetail {
  city: string;
  code: string;
  journeyId?: string;
  country?: string;
  region?: string;
  days: string;
  activities: number;
  cost: string;
  highlights: string;
  lat: number;
  lng: number;
  index: number;
}

interface JourneyMapProps {
  journey?: StoredJourney | null;
  journeys?: StoredJourney[];
  onSelectCity?: (city: string, journeyId?: string) => void;
  onOpenLiveMap?: () => void;
  onPlanNew?: () => void;
}

// Global & Indian Airport / City 3-letter IATA code lookup
const CITY_CODE_MAP: Record<string, string> = {
  // India
  ahmedabad: 'AMD',
  mumbai: 'BOM',
  delhi: 'DEL',
  'new delhi': 'DEL',
  bengaluru: 'BLR',
  bangalore: 'BLR',
  goa: 'GOI',
  kolkata: 'CCU',
  chennai: 'MAA',
  hyderabad: 'HYD',
  pune: 'PNQ',
  jaipur: 'JAI',
  kochi: 'COK',
  cochin: 'COK',
  varanasi: 'VNS',
  agra: 'AGR',
  amritsar: 'ATQ',
  udaipur: 'UDR',
  srinagar: 'SXR',
  shimla: 'SLV',
  manali: 'KUU',
  leh: 'IXL',
  ladakh: 'IXL',
  rajasthan: 'JAI',
  jodhpur: 'JDH',
  jaisalmer: 'JSA',
  mysuru: 'MYQ',
  mysore: 'MYQ',
  thiruvananthapuram: 'TRV',
  trivandrum: 'TRV',
  bhubaneswar: 'BBI',
  chandigarh: 'IXC',
  guwahati: 'GAU',
  surat: 'STV',
  vadodara: 'BDQ',
  rajkot: 'RAJ',
  indore: 'IDR',
  bhopal: 'BHO',
  lucknow: 'LKO',
  dehradun: 'DED',
  rishikesh: 'DED',
  patna: 'PAT',
  ranchi: 'IXR',
  madurai: 'IXM',
  coimbatore: 'CJB',
  visakhapatnam: 'VTZ',
  mangalore: 'IXE',
  // International
  paris: 'CDG',
  london: 'LHR',
  tokyo: 'HND',
  kyoto: 'KIX',
  osaka: 'KIX',
  'new york': 'JFK',
  nyc: 'JFK',
  'san francisco': 'SFO',
  'los angeles': 'LAX',
  dubai: 'DXB',
  rome: 'FCO',
  florence: 'FLR',
  venice: 'VCE',
  bangkok: 'BKK',
  singapore: 'SIN',
  sydney: 'SYD',
  melbourne: 'MEL',
  berlin: 'BER',
  amsterdam: 'AMS',
  barcelona: 'BCN',
  madrid: 'MAD',
  lisbon: 'LIS',
  toronto: 'YYZ',
  vancouver: 'YVR',
  seoul: 'ICN',
  bali: 'DPS',
  zurich: 'ZRH',
  geneva: 'GVA',
  vienna: 'VIE',
  cairo: 'CAI',
  istanbul: 'IST',
  doha: 'DOH',
  auckland: 'AKL',
};

// Helper to get 3-letter city code
function getCityCode(cityName: string): string {
  const clean = cityName.trim().toLowerCase();
  if (CITY_CODE_MAP[clean]) {
    return CITY_CODE_MAP[clean];
  }
  for (const [key, code] of Object.entries(CITY_CODE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }
  return cityName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'DST';
}

// In-memory cache for coordinates
const coordCache = new Map<string, { lat: number; lng: number }>();

// Helper to find coordinates for any city worldwide (No SerpApi / No paid keys)
function resolveCoordinates(cityName: string, defaultLat?: number, defaultLng?: number): { lat: number; lng: number } {
  if (defaultLat !== undefined && defaultLng !== undefined && defaultLat !== 0 && defaultLng !== 0) {
    return { lat: defaultLat, lng: defaultLng };
  }
  const clean = cityName.trim().toLowerCase();
  if (coordCache.has(clean)) {
    return coordCache.get(clean)!;
  }

  // Check curated DESTINATIONS list
  const inCurated = DESTINATIONS.find((d) => d.city.toLowerCase() === clean);
  if (inCurated && inCurated.lat && inCurated.lng) {
    const res = { lat: inCurated.lat, lng: inCurated.lng };
    coordCache.set(clean, res);
    return res;
  }

  // Lookup in country-state-city database
  try {
    const allCities = City.getAllCities();
    const match = allCities.find((c) => c.name.toLowerCase() === clean);
    if (match && match.latitude && match.longitude) {
      const res = { lat: parseFloat(match.latitude), lng: parseFloat(match.longitude) };
      coordCache.set(clean, res);
      return res;
    }
  } catch (e) {
    // ignore
  }

  // Fallback hash-based coordinates within subcontinent
  const hash = Math.abs(clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
  const lat = 15 + (hash % 14);
  const lng = 73 + ((hash * 7) % 12);
  const fallback = { lat, lng };
  coordCache.set(clean, fallback);
  return fallback;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  journey,
  journeys = [],
  onSelectCity,
  onOpenLiveMap,
  onPlanNew,
}) => {
  // If multiple journeys exist, allow switching between them
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(journey?.id || null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number>(0);

  // Map DOM container ref & Leaflet map instance ref
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (journey?.id) {
      setSelectedJourneyId(journey.id);
    } else if (journeys.length > 0 && !selectedJourneyId) {
      setSelectedJourneyId(journeys[0].id);
    }
  }, [journey, journeys, selectedJourneyId]);

  const activeJourney = useMemo(() => {
    if (selectedJourneyId && journeys.length > 0) {
      const found = journeys.find((j) => j.id === selectedJourneyId);
      if (found) return found;
    }
    return journey || (journeys.length > 0 ? journeys[0] : null);
  }, [selectedJourneyId, journeys, journey]);

  // Extract real dynamic stops from active journey
  const dynamicStops = useMemo<StopDetail[]>(() => {
    if (!activeJourney) return [];

    let rawDestinations: Array<{
      city: string;
      country?: string;
      region?: string;
      lat?: number;
      lng?: number;
      attractions?: string[];
      activities?: any[];
      recommendedDuration?: number;
    }> = [];

    if (activeJourney.destinations && activeJourney.destinations.length > 0) {
      rawDestinations = activeJourney.destinations;
    } else if (activeJourney.destination) {
      // Parse multi-city string e.g. "Ahmedabad · Mumbai · Goa"
      const cityNames = activeJourney.destination
        .split(/[·•,\-\/>]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      rawDestinations = cityNames.map((cName) => {
        const curated = DESTINATIONS.find((d) => d.city.toLowerCase() === cName.toLowerCase());
        if (curated) return curated;
        return {
          city: cName.charAt(0).toUpperCase() + cName.slice(1),
          country: activeJourney.country || 'India',
          region: activeJourney.state || '',
          attractions: [`Scenic highlights in ${cName}`, `Historic center`, `Local culinary trails`],
          activities: [{ name: `Explore ${cName} curated sights` }],
        };
      });
    } else if (activeJourney.city) {
      rawDestinations = [
        {
          city: activeJourney.city,
          country: activeJourney.country || 'India',
          region: activeJourney.state || '',
        },
      ];
    }

    if (rawDestinations.length === 0) return [];

    const totalBudget = activeJourney.budgetValue?.amount ?? (typeof activeJourney.budget === 'number' ? activeJourney.budget : 45000);
    const stopCount = rawDestinations.length;
    const perStopBudget = Math.round(totalBudget / Math.max(1, stopCount));

    return rawDestinations.map((d, idx) => {
      const coords = resolveCoordinates(d.city, d.lat, d.lng);

      // Calculate days spent in this city from journey itinerary
      let daysCount = 0;
      if (activeJourney.itinerary && activeJourney.itinerary.length > 0) {
        daysCount = activeJourney.itinerary.filter(
          (day) => day.city && day.city.toLowerCase() === d.city.toLowerCase()
        ).length;
      }
      if (daysCount === 0) {
        daysCount = d.recommendedDuration || Math.max(1, Math.round(7 / stopCount));
      }

      const daysLabel = idx === 0 && stopCount > 1 ? `Day 1 (${daysCount} Days)` : `${daysCount} Days`;

      // Count activities in this city
      let activityCount = 0;
      if (activeJourney.itinerary) {
        const cityDays = activeJourney.itinerary.filter(
          (day) => day.city && day.city.toLowerCase() === d.city.toLowerCase()
        );
        activityCount = cityDays.reduce((acc, itDay) => acc + (itDay.activities?.length || 0), 0);
      }
      if (activityCount === 0) {
        activityCount = d.activities?.length || (d.attractions?.length ? d.attractions.length + 1 : 4);
      }

      // Format highlights
      let highlights = '';
      if (d.attractions && d.attractions.length > 0) {
        highlights = d.attractions.slice(0, 3).join(', ') + ' & local heritage sights.';
      } else if (d.activities && d.activities.length > 0) {
        highlights = d.activities.map((a) => (typeof a === 'string' ? a : a.name)).slice(0, 2).join(' · ');
      } else {
        highlights = `Bespoke architectural trails, scenic viewpoints, and authentic gastronomy in ${d.city}.`;
      }

      return {
        city: d.city,
        code: getCityCode(d.city),
        journeyId: activeJourney.id,
        country: d.country,
        region: d.region,
        days: daysLabel,
        activities: activityCount,
        cost: `₹${perStopBudget.toLocaleString('en-IN')}`,
        highlights: highlights,
        lat: coords.lat,
        lng: coords.lng,
        index: idx,
      };
    });
  }, [activeJourney]);

  // Reset selected stop when stops change
  useEffect(() => {
    setSelectedStopIndex(0);
  }, [dynamicStops.length, selectedJourneyId]);

  const selectedStop = dynamicStops[selectedStopIndex] || dynamicStops[0] || null;

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (dynamicStops.length === 0) return;

    // Destroy existing map if any to prevent duplicate initialization
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center to first stop or center of subcontinent
    const initialCenter: [number, number] = [
      dynamicStops[0]?.lat || 20.5937,
      dynamicStops[0]?.lng || 78.9629,
    ];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 6,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    // Clean OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Create custom luxury HTML markers for each stop
    const latLngs: L.LatLngExpression[] = [];

    dynamicStops.forEach((stop, idx) => {
      const isSelected = selectedStopIndex === idx;
      latLngs.push([stop.lat, stop.lng]);

      const markerHtml = `
        <div class="aethera-map-marker group relative cursor-pointer flex flex-col items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 shadow-md ${
            isSelected
              ? 'bg-black text-white ring-4 ring-black/20 scale-125'
              : 'bg-white text-black border border-neutral-300 hover:scale-110 hover:border-black'
          }">
            ${idx + 1}
          </div>
          <div class="mt-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] whitespace-nowrap shadow-sm transition-all ${
            isSelected
              ? 'bg-black text-white font-semibold'
              : 'bg-white/95 text-neutral-800 border border-neutral-200'
          }">
            ${stop.city} (${stop.code})
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-aethera-marker',
        html: markerHtml,
        iconSize: [80, 50],
        iconAnchor: [40, 20],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedStopIndex(idx);
      });
      markersLayer.addLayer(marker);
    });

    // Draw route Polyline connecting stops in sequence
    if (latLngs.length > 1) {
      // Glow polyline
      L.polyline(latLngs, {
        color: '#000000',
        weight: 6,
        opacity: 0.1,
        lineCap: 'round',
      }).addTo(markersLayer);

      // Crisp dashed main polyline
      const polyline = L.polyline(latLngs, {
        color: '#000000',
        weight: 3,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(markersLayer);

      polylineRef.current = polyline;
    }

    // Auto-fit bounds so all destination markers are clearly visible
    if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 12,
        animate: false,
      });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 9);
    }

    mapInstanceRef.current = map;

    // Trigger invalidateSize after slight delay to ensure rendering in responsive container
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [dynamicStops, selectedJourneyId]);

  // Pan to selected stop when user clicks breadcrumb or stop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedStop) return;
    mapInstanceRef.current.panTo([selectedStop.lat, selectedStop.lng], {
      animate: true,
      duration: 0.8,
    });
  }, [selectedStopIndex, selectedStop]);

  const handleExplore = () => {
    if (!selectedStop) return;
    if (onSelectCity) {
      onSelectCity(selectedStop.city, selectedStop.journeyId);
    } else if (onOpenLiveMap) {
      onOpenLiveMap();
    }
  };

  // Empty state if no journeys or 0 stops
  if (!activeJourney || dynamicStops.length === 0) {
    return (
      <section id="map-section" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-2">
              GEOGRAPHIC TRAJECTORY
            </span>
            <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
              Follow the journey.
            </h2>
            <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-md">
              The spatial narrative mapping your route across your curated destinations.
            </p>
          </div>
        </div>

        {/* Empty state container */}
        <div className="relative bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] overflow-hidden p-8 sm:p-16 shadow-sm min-h-[420px] flex flex-col items-center justify-center text-center">
          <div
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#000000 0.75px, transparent 0.75px)`,
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 max-w-md flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white border border-[#E7E5E2] flex items-center justify-center mb-6 shadow-sm">
              <Compass className="w-7 h-7 text-[#000000] stroke-[1.5]" />
            </div>

            <h3 className="font-instrument text-3xl sm:text-4xl text-[#000000] mb-3">
              Your route will appear here
            </h3>
            <p className="font-inter text-xs sm:text-sm text-[#6F6F6F] leading-relaxed mb-8">
              Add destinations to your journey to see your dynamic geographic trajectory, live OpenStreetMap routing, and location dossiers rendered here.
            </p>

            {onPlanNew && (
              <button
                type="button"
                onClick={onPlanNew}
                className="flex items-center gap-2 rounded-full px-6 py-3 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Plan a New Journey</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="map-section" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t border-[#E7E5E2]">
      {/* Header section with Dynamic Journey Title and Route Breadcrumbs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block">
              GEOGRAPHIC TRAJECTORY
            </span>

            {/* Journey selector pills if multiple journeys exist */}
            {journeys.length > 1 && (
              <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-full text-[11px] font-mono">
                {journeys.map((j) => {
                  const isCur = j.id === activeJourney.id;
                  const label = j.destination ? j.destination.split(/[·•,]/)[0].trim() : 'Trip';
                  return (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => setSelectedJourneyId(j.id)}
                      className={`px-3 py-0.5 rounded-full transition-all cursor-pointer ${
                        isCur
                          ? 'bg-white text-black shadow-sm font-semibold'
                          : 'text-[#6F6F6F] hover:text-black'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl text-[#000000] tracking-headline leading-none">
            Follow the journey.
          </h2>
          <p className="font-inter text-sm sm:text-base text-[#6F6F6F] mt-4 max-w-lg">
            {dynamicStops.length > 1
              ? `The spatial narrative mapping your route across ${dynamicStops.map((s) => s.city).join(' → ')}.`
              : `The spatial narrative and location dossier for ${dynamicStops[0]?.city}.`}
          </p>
        </div>

        {/* Dynamic Route breadcrumbs */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#6F6F6F] overflow-x-auto pb-2 max-w-full">
          {dynamicStops.map((s, idx) => {
            const isSelected = selectedStopIndex === idx;
            return (
              <div key={`${s.code}-${idx}`} className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedStopIndex(idx)}
                  className={`transition-all cursor-pointer px-2 py-1 rounded ${
                    isSelected
                      ? 'text-[#000000] font-bold bg-neutral-200/60 underline underline-offset-4'
                      : 'hover:text-[#000000] hover:bg-neutral-100'
                  }`}
                >
                  <span className="text-[10px] text-[#8F8F8F] mr-1">0{idx + 1}.</span>
                  {s.city.toUpperCase()}
                </button>
                {idx < dynamicStops.length - 1 && <span className="text-neutral-300 font-bold">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Map Canvas Container */}
      <div className="relative bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] overflow-hidden p-6 sm:p-10 shadow-sm min-h-[520px] flex flex-col lg:flex-row gap-8 items-stretch justify-between">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(#000000 0.75px, transparent 0.75px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Left Real Leaflet Map Canvas */}
        <div className="relative z-10 w-full lg:w-3/5 h-[420px] sm:h-[480px] min-h-[420px] rounded-2xl overflow-hidden border border-[#E7E5E2] shadow-inner bg-[#EFECE6]">
          {/* Leaflet Map Target DOM Node */}
          <div
            ref={mapContainerRef}
            className="w-full h-full z-10"
            style={{ minHeight: '420px', width: '100%', height: '100%' }}
          />

          {/* Map Top Floating Overlay Info */}
          <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-200 shadow-sm flex items-center gap-2 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">{dynamicStops.length} Destinations</span>
            <span className="text-neutral-400">|</span>
            <span className="text-neutral-600">Live Spatial Trajectory</span>
          </div>
        </div>

        {/* Right Info Box: Location Dossier for Selected Marker */}
        {selectedStop && (
          <div className="relative z-10 w-full lg:w-2/5 bg-white border border-[#E7E5E2] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                    LOCATION DOSSIER
                  </span>
                  <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                    STOP {selectedStop.index + 1} OF {dynamicStops.length}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-[#000000] text-white px-2.5 py-1 rounded">
                  {selectedStop.code}
                </span>
              </div>

              <h3 className="font-instrument text-4xl text-[#000000] leading-none mb-1">
                {selectedStop.city}
              </h3>
              <span className="text-xs font-mono text-neutral-500 block mb-4">
                {selectedStop.days} · {selectedStop.activities} Curated Stops {selectedStop.country ? `· ${selectedStop.country}` : ''}
              </span>

              <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter leading-relaxed mb-6">
                {selectedStop.highlights}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 mt-4">
              <div>
                <span className="block text-[10px] font-mono text-[#6F6F6F] uppercase">
                  Allocated Budget
                </span>
                <span className="font-instrument text-2xl text-[#000000]">
                  {selectedStop.cost}
                </span>
              </div>

              <button
                type="button"
                onClick={handleExplore}
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                <span>Explore {selectedStop.city}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
