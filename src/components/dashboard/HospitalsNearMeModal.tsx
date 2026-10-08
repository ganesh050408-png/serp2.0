import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  ExternalLink,
  AlertCircle,
  Loader2,
  ShieldAlert,
  RefreshCw,
  Search,
} from 'lucide-react';
import L from 'leaflet';
import { NearbyHospital } from '../../services/travelStorage';

interface HospitalsNearMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
  defaultCoordinates?: { lat: number; lng: number };
}

const POPULAR_HUBS = [
  { name: 'Current GPS', isGps: true },
  { name: 'Goa', lat: 15.2993, lng: 74.1240 },
  { name: 'Mumbai', lat: 18.9220, lng: 72.8347 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
];

export const HospitalsNearMeModal: React.FC<HospitalsNearMeModalProps> = ({
  isOpen,
  onClose,
  defaultCity = 'Current Journey Hub',
  defaultCoordinates,
}) => {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLabel, setActiveLabel] = useState(defaultCity);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(() => {
    return defaultCoordinates || { lat: 15.2993, lng: 74.1240 };
  });
  const [selectedHospital, setSelectedHospital] = useState<NearbyHospital | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch hospitals near given lat/lng
  const fetchHospitals = async (lat: number, lng: number, label?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentCoords({ lat, lng });
    if (label) setActiveLabel(label);

    try {
      const res = await fetch(`/api/hospitals/nearby?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
        setHospitals(data.hospitals);
        setSelectedHospital(data.hospitals[0]);
      } else {
        setErrorMessage('Searching nearby health networks...');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connecting to regional health network...');
    } finally {
      setIsLoading(false);
    }
  };

  // Request browser geolocation on user trigger
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
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
          setErrorMessage('Location permission was denied. Select a city or search above.');
        } else {
          setErrorMessage('Unable to determine current GPS position.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
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

  // Trigger search when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (defaultCoordinates?.lat && defaultCoordinates?.lng) {
        fetchHospitals(defaultCoordinates.lat, defaultCoordinates.lng, defaultCity);
      } else if (navigator.geolocation) {
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
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Leaflet Map Initialization & Rendering
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentCoords.lat, currentCoords.lng],
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

    // Add user marker
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

    // Add Hospital markers
    hospitals.forEach((hosp) => {
      boundsLatLngs.push([hosp.lat, hosp.lng]);
      const isSel = selectedHospital?.id === hosp.id;

      const hospHtml = `
        <div class="cursor-pointer flex flex-col items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform ${
            isSel
              ? 'bg-red-600 text-white scale-125 ring-4 ring-red-300'
              : 'bg-white text-red-600 border border-red-200 hover:scale-110'
          }">
            +
          </div>
          <div class="mt-1 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-sm ${
            isSel ? 'bg-black text-white font-semibold' : 'bg-white/95 text-neutral-800 border'
          }">
            ${hosp.name.slice(0, 18)}
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospHtml,
        className: 'hosp-marker',
        iconSize: [70, 45],
        iconAnchor: [35, 20],
      });

      const m = L.marker([hosp.lat, hosp.lng], { icon: hospIcon }).addTo(group);
      m.on('click', () => {
        setSelectedHospital(hosp);
      });
    });

    if (boundsLatLngs.length > 0) {
      map.fitBounds(L.latLngBounds(boundsLatLngs), { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([currentCoords.lat, currentCoords.lng], 13);
    }

    const t = setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(t);
    };
  }, [isOpen, hospitals, selectedHospital?.id, userCoords, currentCoords]);

  // Clean up map when modal unmounts
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 animate-fade-rise">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white border border-[#E7E5E2] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF8F5] border-b border-[#E7E5E2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500 block">
                EMERGENCY MEDICAL LOCATOR · {activeLabel.toUpperCase()}
              </span>
              <h2 className="font-instrument text-2xl sm:text-3xl text-black">
                Hospitals Near Me
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRequestLocation}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-300 hover:border-black text-xs font-mono text-black transition-all cursor-pointer bg-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Use GPS</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Hub Bar */}
        <div className="px-5 py-3 bg-white border-b border-neutral-100 flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80 flex items-center">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city (e.g. Goa, Mumbai)..."
              className="w-full bg-[#FAF8F5] border border-neutral-200 rounded-full pl-9 pr-16 py-1.5 text-xs font-inter text-black placeholder-neutral-400 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 rounded-full bg-black text-white text-[10px] font-mono hover:bg-neutral-800"
            >
              Find
            </button>
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full scrollbar-none">
            {POPULAR_HUBS.map((hub) => (
              <button
                key={hub.name}
                type="button"
                onClick={() => {
                  if (hub.isGps) {
                    handleRequestLocation();
                  } else if (hub.lat && hub.lng) {
                    fetchHospitals(hub.lat, hub.lng, hub.name);
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono shrink-0 transition-all cursor-pointer border ${
                  activeLabel.includes(hub.name)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-black'
                }`}
              >
                {hub.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Map View */}
          <div className="relative w-full lg:w-3/5 h-64 lg:h-full bg-[#EFECE6] border-b lg:border-b-0 lg:border-r border-[#E7E5E2]">
            <div ref={mapContainerRef} className="w-full h-full min-h-[250px]" />

            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-[500] gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-black stroke-[1.5]" />
                <span className="font-mono text-xs text-neutral-600">Scanning verified medical facilities…</span>
              </div>
            )}
          </div>

          {/* Right: Hospital Cards List */}
          <div className="w-full lg:w-2/5 h-full overflow-y-auto p-5 bg-white flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
              <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">
                {hospitals.length} Verified Facilities
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                Distance Matrix
              </span>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl mb-3 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <div className="space-y-3 flex-1 overflow-y-auto">
              {hospitals.map((hosp) => {
                const isSel = selectedHospital?.id === hosp.id;
                const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${hosp.lat},${hosp.lng}`;

                return (
                  <div
                    key={hosp.id}
                    onClick={() => setSelectedHospital(hosp)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSel
                        ? 'border-black bg-[#FAF8F5] shadow-xs ring-1 ring-black'
                        : 'border-[#E7E5E2] bg-white hover:border-neutral-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-instrument text-lg text-black leading-snug">
                        {hosp.name}
                      </h4>
                      <span className="text-xs font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded shrink-0">
                        {hosp.distanceKm} km
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 font-inter mb-3 line-clamp-2">
                      {hosp.address}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100/80">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                        {hosp.emergency && (
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">
                            24/7 EMERGENCY
                          </span>
                        )}
                        {hosp.rating && <span>★ {hosp.rating}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {hosp.phone && (
                          <a
                            href={`tel:${hosp.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black text-xs transition-colors"
                            title="Call Hospital"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono hover:bg-neutral-800 transition-all"
                        >
                          <span>Directions</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
