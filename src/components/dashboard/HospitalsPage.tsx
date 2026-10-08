import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  MapPin,
  Phone,
  ExternalLink,
  Search,
  Navigation,
  Loader2,
  ArrowLeft,
  AlertCircle,
  Clock,
  Star,
  CheckCircle2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import L from 'leaflet';
import { NearbyHospital } from '../../services/travelStorage';

interface HospitalsPageProps {
  onNavigate: (path: string) => void;
  defaultCity?: string;
}

const POPULAR_HUBS = [
  { name: 'Current GPS', isGps: true },
  { name: 'Goa', lat: 15.2993, lng: 74.1240 },
  { name: 'Mumbai', lat: 18.9220, lng: 72.8347 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673 },
];

export const HospitalsPage: React.FC<HospitalsPageProps> = ({
  onNavigate,
  defaultCity = 'Goa',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLocationLabel, setActiveLocationLabel] = useState(defaultCity);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(15);
  const [statusState, setStatusState] = useState<'idle' | 'loading' | 'success' | 'empty' | 'error' | 'permission_denied'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number }>({
    lat: 15.2993,
    lng: 74.1240,
  });
  const [selectedHospital, setSelectedHospital] = useState<NearbyHospital | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch hospitals near given lat/lng
  const fetchHospitals = async (lat: number, lng: number, label?: string, radius = searchRadiusKm) => {
    setIsLoading(true);
    setStatusState('loading');
    setErrorMessage(null);
    setCurrentCenter({ lat, lng });
    if (label) setActiveLocationLabel(label);

    try {
      const res = await fetch(`/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius * 1000}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.hospitals)) {
        if (data.hospitals.length > 0) {
          setHospitals(data.hospitals);
          setSelectedHospital(data.hospitals[0]);
          setStatusState('success');
        } else {
          setHospitals([]);
          setStatusState('empty');
        }
      } else {
        setErrorMessage(data.error || 'Unable to load nearby hospitals.');
        setStatusState('error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to load nearby hospitals.');
      setStatusState('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Request browser geolocation on user trigger
  const handleRequestGps = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      setStatusState('permission_denied');
      return;
    }

    setIsLoading(true);
    setStatusState('loading');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        fetchHospitals(coords.lat, coords.lng, 'Live GPS Position');
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          setStatusState('permission_denied');
          setErrorMessage('Location permission was denied. Use the search bar below or pick a city to find nearby hospitals.');
        } else {
          setStatusState('error');
          setErrorMessage('Unable to determine your current location. Please check your connection or pick a destination city.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Search Form Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = POPULAR_HUBS.find(
      (h) => !h.isGps && h.name.toLowerCase().includes(query)
    );

    if (match && match.lat && match.lng) {
      fetchHospitals(match.lat, match.lng, match.name);
    } else {
      fetchHospitals(15.2993, 74.1240, searchQuery);
    }
  };

  // Widen search radius
  const handleWidenRadius = () => {
    const nextRadius = searchRadiusKm >= 30 ? 50 : searchRadiusKm + 15;
    setSearchRadiusKm(nextRadius);
    fetchHospitals(currentCenter.lat, currentCenter.lng, activeLocationLabel, nextRadius);
  };

  // Initial load on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          fetchHospitals(coords.lat, coords.lng, 'Your Current Location');
        },
        () => {
          fetchHospitals(15.2993, 74.1240, defaultCity || 'Goa');
        },
        { timeout: 4000 }
      );
    } else {
      fetchHospitals(15.2993, 74.1240, defaultCity || 'Goa');
    }
  }, []);

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCenter.lat, currentCenter.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      markersGroupRef.current = group;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    const group = markersGroupRef.current || L.layerGroup().addTo(map);

    // User location marker
    if (userCoords) {
      const userHtml = `
        <div class="relative flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full border-2 border-white shadow-xl ring-4 ring-blue-500/25">
          <div class="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
      `;
      const userIcon = L.divIcon({
        html: userHtml,
        className: 'user-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(group)
        .bindPopup('<b>Your Current Location</b>');
    }

    const boundsLatLngs: L.LatLngExpression[] = [];
    if (userCoords) boundsLatLngs.push([userCoords.lat, userCoords.lng]);

    // Hospital markers
    hospitals.forEach((hosp) => {
      boundsLatLngs.push([hosp.lat, hosp.lng]);
      const isSel = selectedHospital?.id === hosp.id;

      const hospHtml = `
        <div class="cursor-pointer flex flex-col items-center group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all ${
            isSel
              ? 'bg-red-600 text-white scale-125 ring-4 ring-red-400/40'
              : 'bg-white text-red-600 border border-red-200 hover:scale-110'
          }">
            +
          </div>
          <div class="mt-1 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md ${
            isSel ? 'bg-black text-white font-semibold' : 'bg-white/95 text-neutral-800 border border-neutral-200'
          }">
            ${hosp.name.slice(0, 20)}
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospHtml,
        className: 'hosp-marker',
        iconSize: [80, 48],
        iconAnchor: [40, 24],
      });

      const m = L.marker([hosp.lat, hosp.lng], { icon: hospIcon }).addTo(group);
      m.on('click', () => {
        setSelectedHospital(hosp);
      });
    });

    if (boundsLatLngs.length > 0) {
      map.fitBounds(L.latLngBounds(boundsLatLngs), { padding: [50, 50], maxZoom: 14 });
    } else {
      map.setView([currentCenter.lat, currentCenter.lng], 13);
    }

    const t = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => clearTimeout(t);
  }, [hospitals, selectedHospital?.id, userCoords, currentCenter]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-black font-sans selection:bg-black selection:text-white flex flex-col">
      {/* Top Editorial Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E7E5E2] px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 hover:border-black text-xs font-mono text-neutral-700 hover:text-black transition-all cursor-pointer bg-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <div className="h-4 w-px bg-neutral-200" />
          <div className="flex items-center gap-2">
            <span className="font-instrument text-2xl tracking-tight text-black">Adhira</span>
            <span className="text-[11px] font-mono text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
              Hospitals Near Me
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRequestGps}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-mono transition-all cursor-pointer shadow-xs"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Use My Location</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 space-y-6">
        {/* Search & Location Bar */}
        <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                EMERGENCY MEDICAL NETWORK
              </span>
              <h1 className="font-instrument text-3xl sm:text-4xl text-black">
                Hospitals & Medical Facilities
              </h1>
            </div>

            {/* Focus indicator & Search radius selector */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E7E5E2] px-3.5 py-1.5 rounded-full text-xs font-mono">
                <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500">Radius:</span>
                <select
                  value={searchRadiusKm}
                  onChange={(e) => {
                    const r = Number(e.target.value);
                    setSearchRadiusKm(r);
                    fetchHospitals(currentCenter.lat, currentCenter.lng, activeLocationLabel, r);
                  }}
                  className="bg-transparent text-black font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E7E5E2] px-3.5 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-semibold text-black truncate max-w-[160px]">
                  {activeLocationLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Manual Location Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, landmark, or address (e.g., Goa, Mumbai, Delhi, Ahmedabad)..."
              className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-full pl-11 pr-28 py-3 text-sm font-inter text-black placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Quick Hub Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono uppercase text-neutral-400 shrink-0">Quick Hubs:</span>
            {POPULAR_HUBS.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => {
                  if (hub.isGps) {
                    handleRequestGps();
                  } else if (hub.lat && hub.lng) {
                    fetchHospitals(hub.lat, hub.lng, hub.name);
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-mono shrink-0 transition-all cursor-pointer border ${
                  activeLocationLabel.includes(hub.name)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                }`}
              >
                {hub.isGps ? '📍 Use My Location' : hub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Location Permission Denied State Banner */}
        {statusState === 'permission_denied' && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Location Permission Denied or Unavailable</h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {errorMessage || 'Search by city or address above to view verified medical facilities in that area.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRequestGps}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-900 text-white text-xs font-mono hover:bg-black transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Permission</span>
            </button>
          </div>
        )}

        {/* API Error State Banner */}
        {statusState === 'error' && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-3xl text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Unable to load nearby hospitals.</h4>
                <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                  {errorMessage || 'Check your connection or connect the Google Maps API with GOOGLE_MAPS_API_KEY.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fetchHospitals(currentCenter.lat, currentCenter.lng, activeLocationLabel)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-900 text-white text-xs font-mono hover:bg-black transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Empty State Banner */}
        {statusState === 'empty' && (
          <div className="p-8 bg-white border border-[#E7E5E2] rounded-3xl text-center space-y-3">
            <MapPin className="w-8 h-8 mx-auto text-neutral-400" />
            <h3 className="font-instrument text-2xl text-black">No hospitals found within this area.</h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              No medical facilities were found within {searchRadiusKm} km of {activeLocationLabel}. Try widening the search radius or searching another city.
            </p>
            <button
              type="button"
              onClick={handleWidenRadius}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-colors"
            >
              <span>Widen search radius (+15 km)</span>
            </button>
          </div>
        )}

        {/* Map and Hospital Directory Split View (Responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top on mobile: Leaflet Map Container */}
          <div className="lg:col-span-7 bg-white border border-[#E7E5E2] rounded-3xl overflow-hidden shadow-xs relative min-h-[380px] lg:min-h-[620px] flex flex-col">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#E7E5E2] flex items-center justify-between text-xs font-mono text-neutral-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Live Medical Map</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>You</span>
                <span className="w-2 h-2 rounded-full bg-red-600 ml-2" />
                <span>Hospital</span>
              </div>
            </div>

            <div className="relative flex-1 w-full min-h-[340px]">
              <div ref={mapContainerRef} className="w-full h-full min-h-[340px]" />

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-xs flex flex-col items-center justify-center z-[500] gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-black stroke-[1.5]" />
                  <span className="font-mono text-xs text-neutral-700">Finding hospitals near you…</span>
                </div>
              )}
            </div>
          </div>

          {/* Right / Bottom on mobile: Hospital Directory Cards List */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="bg-white border border-[#E7E5E2] rounded-3xl p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span className="font-instrument text-lg text-black">
                  {hospitals.length} Facilities Found
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
                Live Distance Sorted
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {hospitals.map((hosp) => {
                const isSel = selectedHospital?.id === hosp.id;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`;

                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospital(hosp)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                      isSel
                        ? 'border-black shadow-md ring-2 ring-black/5 bg-[#FAF8F5]'
                        : 'border-[#E7E5E2] hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="font-instrument text-xl text-black leading-snug">
                        {hosp.name}
                      </h3>
                      <span className="text-xs font-mono font-bold bg-neutral-100 text-black px-2.5 py-1 rounded-full shrink-0">
                        {hosp.distanceKm} km
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 font-inter mb-4 leading-relaxed">
                      {hosp.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {hosp.emergency && (
                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          24/7 EMERGENCY
                        </span>
                      )}
                      {hosp.isOpen && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Open Now
                        </span>
                      )}
                      {hosp.rating && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-mono px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {hosp.rating}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                      <div>
                        {hosp.phone ? (
                          <a
                            href={`tel:${hosp.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-700 hover:text-black underline"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{hosp.phone}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] font-mono text-neutral-400">Direct dial on maps</span>
                        )}
                      </div>

                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-mono hover:bg-neutral-800 transition-all shadow-xs"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
