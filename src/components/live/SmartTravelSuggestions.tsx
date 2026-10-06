import { useState } from 'react';
import { Sparkles, Clock, Compass, CloudSun, X } from 'lucide-react';

interface Suggestion {
  id: string;
  icon: typeof Clock;
  tag: string;
  text: string;
  actionText?: string;
  actionType?: string;
}

const SMART_ALERTS: Suggestion[] = [
  {
    id: '1',
    icon: Clock,
    tag: 'DEPARTURE ADVISORY',
    text: 'Your next stop at Fort Aguada starts in 45 minutes. Leave Panaji by 15:05 to arrive comfortably before parking queues.',
    actionText: 'Get Directions to Fort Aguada (14 min)',
    actionType: 'directions_aguada',
  },
  {
    id: '2',
    icon: Compass,
    tag: 'PROXIMITY INSIGHT',
    text: 'You are 2.1 km from your hotel in Panaji. Estimated return transit time is 8 minutes.',
    actionText: 'Get Directions to Hotel (8 min)',
    actionType: 'directions_hotel',
  },
  {
    id: '3',
    icon: CloudSun,
    tag: 'MICROCLIMATE UPDATE',
    text: 'Golden hour visibility at Anjuna is projected at 98% with low coastal fog. Ideal for sunset photography.',
    actionText: 'Get Directions to Sunset Point',
    actionType: 'directions_anjuna',
  },
];

interface SmartTravelSuggestionsProps {
  onActionClick?: (actionType: string) => void;
}

export const SmartTravelSuggestions = ({ onActionClick }: SmartTravelSuggestionsProps) => {
  const [alerts, setAlerts] = useState(SMART_ALERTS);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <section className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-neutral-800" />
        <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F]">
          AETHERA PROACTIVE COMPANION INSIGHTS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="relative bg-[#FAF8F5] border border-[#E7E5E2] rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-black transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#E7E5E2] text-[#6F6F6F] flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    <span>{alert.tag}</span>
                  </span>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-neutral-400 hover:text-black p-1 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#000000] font-inter leading-relaxed mt-2">
                  {alert.text}
                </p>
              </div>

              {alert.actionText && (
                <div className="pt-4 mt-2 border-t border-neutral-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      if (onActionClick && alert.actionType) {
                        onActionClick(alert.actionType);
                      }
                      const destinationMap: Record<string, string> = {
                        directions_aguada: 'Fort Aguada, Candolim, Goa, India',
                        directions_hotel: 'Fontainhas Heritage Villa, Panaji, Goa, India',
                        directions_anjuna: 'Sunset Point, South Anjuna, Goa, India',
                      };
                      const target = destinationMap[alert.actionType || ''] || 'Goa, India';
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(target)}`, '_blank');
                    }}
                    className="text-xs font-medium text-[#000000] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{alert.actionText} →</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
