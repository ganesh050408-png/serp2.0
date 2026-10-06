import { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Check,
  ExternalLink,
  X,
  Car,
  Copy,
} from 'lucide-react';

interface Waypoint {
  id: string;
  name: string;
  category: string;
  time: string;
  status: 'completed' | 'current' | 'upcoming';
  distance: string;
  eta: string;
  xPercent: number;
  yPercent: number;
  steps: string[];
}

const TODAY_WAYPOINTS: Waypoint[] = [
  {
    id: '1',
    name: 'Heritage Villa (Hotel)',
    category: 'Stay',
    time: '08:30',
    status: 'completed',
    distance: '2.1 km away',
    eta: 'Origin',
    xPercent: 24,
    yPercent: 70,
    steps: [
      'Head east on Rua 31 de Janeiro toward Latin Quarter exit (300 m)',
      'Turn right onto DB Bandodkar Marg (1.8 km)',
      'Arrive at Panaji Waterfront Promenade on the right',
    ],
  },
  {
    id: '2',
    name: 'Baga Beach Catamaran',
    category: 'Activity',
    time: '10:30',
    status: 'completed',
    distance: '3.8 km away',
    eta: '12 min',
    xPercent: 38,
    yPercent: 46,
    steps: [
      'Head north across Mandovi River Bridge (1.2 km)',
      'Continue on Calangute - Baga Rd (2.2 km)',
      'Turn right at Jetty 4 toward Baga Shoreline (400 m)',
    ],
  },
  {
    id: '3',
    name: 'Fisherman’s Wharf (Lunch)',
    category: 'Dining',
    time: '13:00',
    status: 'completed',
    distance: '0.8 km away',
    eta: '3 min',
    xPercent: 50,
    yPercent: 62,
    steps: [
      'Head southwest along waterfront promenade (500 m)',
      'Turn left at Sal River waterfront arcade (300 m)',
      'Arrive at Fisherman’s Wharf dining pavilion on the left',
    ],
  },
  {
    id: '4',
    name: 'Fort Aguada Bastion',
    category: 'Heritage',
    time: '15:30',
    status: 'current',
    distance: '4.2 km away',
    eta: '14 min',
    xPercent: 68,
    yPercent: 38,
    steps: [
      'Head south on Panaji Promenade toward Dayanand Bandodkar Marg (400 m)',
      'Take the Mandovi River Bridge approach toward Betim / Candolim (1.8 km)',
      'Continue onto Aguada-Siolim Rd toward Sinquerim Promontory (1.6 km)',
      'Arrive at Fort Aguada 17th-Century Bastion parking on the left (400 m)',
    ],
  },
  {
    id: '5',
    name: 'Anjuna Sunset Point',
    category: 'Leisure',
    time: '18:30',
    status: 'upcoming',
    distance: '7.8 km away',
    eta: '22 min',
    xPercent: 82,
    yPercent: 25,
    steps: [
      'Head northeast on Aguada - Candolim Rd (2.5 km)',
      'Follow Calangute - Anjuna Highway toward South Anjuna cliff (4.8 km)',
      'Turn left onto Sunset Point cliff trail (500 m)',
    ],
  },
];

interface LiveLocationMapProps {
  onRequestRide?: (name: string) => void;
}

export const LiveLocationMap = ({ onRequestRide }: LiveLocationMapProps) => {
  const [showPermissionDialog, setShowPermissionDialog] = useState<boolean>(false);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint>(TODAY_WAYPOINTS[3]); // Fort Aguada
  const [userLocationName, setUserLocationName] = useState<string>('Panaji Promenade, Goa');
  const [isDirectionsModalOpen, setIsDirectionsModalOpen] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDirectionsModalOpen(false);
        setShowPermissionDialog(false);
      }
    };
    if (isDirectionsModalOpen || showPermissionDialog) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isDirectionsModalOpen, showPermissionDialog]);

  const handleGrantPermission = () => {
    setShowPermissionDialog(false);
  };

  const handleManualLocation = () => {
    const loc = prompt('Enter your current city or neighborhood:', 'Panaji, Goa');
    if (loc) {
      setUserLocationName(loc);
      setShowPermissionDialog(false);
    }
  };

  const handleOpenDirections = () => {
    setIsDirectionsModalOpen(true);
  };

  const handleOpenGoogleMaps = () => {
    const query = encodeURIComponent(`${activeWaypoint.name}, Goa, India`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText('15.4920° N, 73.7737° E');
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <section id="live-map" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-mono text-[#6F6F6F] block mb-1">
            REAL-TIME SITUATIONAL RADAR
          </span>
          <h2 className="font-instrument text-4xl sm:text-5xl text-[#000000] tracking-headline leading-none">
            Live Journey Radar
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mt-2">
            Active tracking along Day 4: Panaji to Candolim & North Goa Promontory.
          </p>
        </div>

        {/* Location permission toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPermissionDialog(true)}
            className="flex items-center gap-2 rounded-full px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs font-mono text-[#000000] transition-colors border border-[#E7E5E2] cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>GPS: High Accuracy</span>
          </button>
        </div>
      </div>

      {/* Permission & Location Config Modal */}
      {showPermissionDialog && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0 -z-10" onClick={() => setShowPermissionDialog(false)} />
          <div className="bg-white border border-[#E7E5E2] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-black">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-instrument text-3xl text-black mb-2">Location Accuracy</h3>
            <p className="text-xs sm:text-sm text-[#6F6F6F] font-inter mb-6 leading-relaxed">
              Aethera uses real-time GPS telemetry to estimate driving durations, flag scenic
              detours, and find nearby assistance.
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleGrantPermission}
                className="w-full rounded-full py-3 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all cursor-pointer"
              >
                Enable Automatic Live Geolocation
              </button>
              <button
                type="button"
                onClick={handleManualLocation}
                className="w-full rounded-full py-3 bg-neutral-100 text-black text-xs font-medium hover:bg-neutral-200 transition-all border border-[#E7E5E2] cursor-pointer"
              >
                Set Current City Manually
              </button>
              <button
                type="button"
                onClick={() => setShowPermissionDialog(false)}
                className="w-full text-xs text-[#6F6F6F] hover:text-black py-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Large Minimal Map Canvas */}
      <div className="relative bg-[#FAF8F5] border border-[#E7E5E2] rounded-[32px] overflow-hidden p-6 sm:p-10 shadow-sm min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
        {/* Subtle Map Grid Backdrop */}
        <div
          className="absolute inset-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#000000 0.8px, transparent 0.8px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Top Floating Map Controls */}
        <div className="relative z-20 flex items-center justify-between gap-4">
          {/* User Current Location Indicator */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-[#E7E5E2] shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-xs text-[#000000] font-semibold">
              YOU ARE HERE:
            </span>
            <span className="font-inter text-xs text-[#6F6F6F]">{userLocationName}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase bg-white/80 px-3 py-1.5 rounded-full text-[#6F6F6F] border border-[#E7E5E2]">
              Route Progress: 3 of 5 Done
            </span>
          </div>
        </div>

        {/* Central Map Path & Nodes SVG */}
        <div className="relative w-full h-[280px] sm:h-[340px] my-4 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full text-neutral-300 pointer-events-none"
            viewBox="0 0 800 400"
            fill="none"
          >
            {/* Subtle shoreline / coastal curve */}
            <path
              d="M 120 380 Q 200 280 320 230 T 560 140 T 740 60"
              stroke="#E7E5E2"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Active route connecting the 5 stops */}
            <path
              d="M 192 280 L 304 184 L 400 248 L 544 152 L 656 100"
              stroke="#000000"
              strokeWidth="2"
              strokeDasharray="5 5"
            />
            {/* User Pulse Circle */}
            <circle cx="430" cy="230" r="16" fill="rgba(16, 185, 129, 0.15)" />
            <circle cx="430" cy="230" r="6" fill="#10B981" />
          </svg>

          {/* User Location Marker */}
          <div
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-default"
            style={{ left: '54%', top: '58%' }}
          >
            <div className="flex flex-col items-center">
              <div className="px-2.5 py-1 rounded-full bg-[#000000] text-white text-[10px] font-mono tracking-wider shadow-lg mb-1 whitespace-nowrap flex items-center gap-1">
                <Navigation className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                <span>You (Panaji)</span>
              </div>
              <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white shadow-md animate-pulse" />
            </div>
          </div>

          {/* Interactive Waypoints */}
          {TODAY_WAYPOINTS.map((wp) => {
            const isSelected = activeWaypoint.id === wp.id;
            return (
              <div
                key={wp.id}
                style={{
                  top: `${wp.yPercent}%`,
                  left: `${wp.xPercent}%`,
                }}
                onClick={() => setActiveWaypoint(wp)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#000000] text-white scale-125 shadow-xl ring-4 ring-black/10'
                      : wp.status === 'completed'
                      ? 'bg-neutral-200 text-neutral-600 border border-neutral-300'
                      : 'bg-white text-[#000000] border border-[#E7E5E2] hover:border-black hover:scale-110'
                  }`}
                >
                  {wp.status === 'completed' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                </div>

                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#000000] text-white font-medium shadow-sm'
                      : 'bg-white/90 text-[#6F6F6F] group-hover:text-black border border-[#E7E5E2]'
                  }`}
                >
                  {wp.time} · {wp.name.split(' ')[0]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Waypoint Dossier Card */}
        <div className="relative z-20 bg-white/95 backdrop-blur-md border border-[#E7E5E2] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] mb-1">
              <span>{activeWaypoint.time} SCHEDULED STOP</span>
              <span>•</span>
              <span className="text-[#000000] font-semibold">{activeWaypoint.category}</span>
            </div>
            <h4 className="font-instrument text-2xl sm:text-3xl text-[#000000] leading-none">
              {activeWaypoint.name}
            </h4>
            <p className="text-xs text-[#6F6F6F] font-inter mt-1">
              {activeWaypoint.distance} · Estimated travel time {activeWaypoint.eta}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenDirections}
              className="flex items-center gap-1.5 rounded-full px-6 py-2.5 bg-[#000000] text-white text-xs font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] cursor-pointer shadow-md"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Get Directions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Turn-by-Turn Navigation & Direction Modal */}
      {isDirectionsModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-rise">
          <div className="fixed inset-0 -z-10" onClick={() => setIsDirectionsModalOpen(false)} />
          <div className="bg-white border border-[#E7E5E2] rounded-[32px] max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7E5E2] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#6F6F6F]">
                    NAVIGATION HUD · {activeWaypoint.distance}
                  </span>
                  <h3 className="font-instrument text-2xl sm:text-3xl text-black leading-tight">
                    Route to {activeWaypoint.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDirectionsModalOpen(false)}
                className="p-2 rounded-full text-[#6F6F6F] hover:text-black hover:bg-neutral-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Route Summary Box */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Drive ETA</span>
                  <span className="font-instrument text-3xl text-black leading-none">{activeWaypoint.eta}</span>
                  <span className="text-xs text-[#6F6F6F] font-inter mt-0.5 block">via Aguada-Candolim Rd</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-[#6F6F6F] block">Distance</span>
                  <span className="font-instrument text-3xl text-black leading-none">{activeWaypoint.distance}</span>
                  <span className="text-xs text-emerald-700 font-mono mt-0.5 block">Light Traffic</span>
                </div>
              </div>

              {/* Turn-by-Turn Steps */}
              <div>
                <span className="text-xs font-mono uppercase text-[#6F6F6F] block mb-3">
                  TURN-BY-TURN GUIDANCE
                </span>
                <div className="space-y-3">
                  {activeWaypoint.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-[#E7E5E2] rounded-xl flex items-start gap-3 text-xs text-black font-inter leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-neutral-100 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Grid */}
              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleOpenGoogleMaps}
                  className="w-full rounded-full py-4 bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Launch in Google Maps Navigation</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDirectionsModalOpen(false);
                      if (onRequestRide) onRequestRide(activeWaypoint.name);
                    }}
                    className="flex-1 rounded-full py-3 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E7E5E2]"
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>Book Ride Instead</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCoords}
                    className="rounded-full px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E7E5E2]"
                    title="Copy GPS coordinates"
                  >
                    {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCoords ? 'Copied' : 'GPS'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
