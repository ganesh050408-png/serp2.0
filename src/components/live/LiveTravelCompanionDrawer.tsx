import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X, Send, Navigation, Car, Stethoscope, Pill, Loader2, RotateCcw } from 'lucide-react';
import { callAetheraAI } from '../../services/aiService';
import { StoredJourney } from '../../services/travelStorage';

interface LiveTravelCompanionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onRequestRide: (destination: string) => void;
  onOpenCategory: (category: 'hospitals' | 'pharmacies' | 'unwell') => void;
  journey?: StoredJourney | null;
}

interface CompanionMessage {
  sender: 'user' | 'ai';
  text: string;
  isError?: boolean;
  retryText?: string;
  actions?: {
    label: string;
    action: () => void;
    icon?: typeof Navigation;
  }[];
}

const QUICK_ACTIONS = [
  "What's near me?",
  "I'm not feeling well",
  "Get me to my hotel",
  "Plan the rest of today",
  "Find a pharmacy",
  "Get a ride",
];

export const LiveTravelCompanionDrawer = ({
  isOpen,
  onClose,
  onOpen,
  onRequestRide,
  onOpenCategory,
  journey,
}: LiveTravelCompanionDrawerProps) => {
  const currentCity =
    journey?.destinations?.[0]?.city ||
    journey?.destinations?.[0]?.name ||
    journey?.city ||
    journey?.destination ||
    'your destination';
  const journeyTitle = journey?.destination || journey?.destinations?.[0]?.name || 'Live Journey';
  const totalDays = journey?.itinerary?.length || 5;
  const firstDay = journey?.itinerary?.[0];
  const firstAct = firstDay?.activities?.[0];
  const nextStop =
    (typeof firstAct === 'string'
      ? firstAct
      : firstAct?.name) ||
    journey?.destinations?.[0]?.attractions?.[0] ||
    'Next Checkpoint';

  const [messages, setMessages] = useState<CompanionMessage[]>([
    {
      sender: 'ai',
      text: `Good afternoon, Aravind. You are in ${currentCity} exploring your ${journeyTitle} journey. Your next stop is ${nextStop}. How can I assist you right now?`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (journey) {
      setMessages([
        {
          sender: 'ai',
          text: `Good afternoon, Aravind. You are in ${currentCity} exploring your ${journeyTitle} journey. Your next stop is ${nextStop}. How can I assist you right now?`,
        },
      ]);
    }
  }, [journey?.id, currentCity, nextStop, journeyTitle]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: CompanionMessage = { sender: 'user', text };
    const updatedMsgs: CompanionMessage[] = [...messages.filter((m) => !m.isError), userMessage];
    setMessages(updatedMsgs);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReplyText = await callAetheraAI(
        updatedMsgs,
        `Live In-Destination Mode: ${currentCity} (${journeyTitle}, Day 1 of ${totalDays}). Current Location: ${currentCity} Central. Next Stop: ${nextStop}. Group Travelers: ${journey?.travelers || 2}.`
      );

      let actions: CompanionMessage['actions'];
      const lower = text.toLowerCase();

      if (lower.includes('unwell') || lower.includes('sick') || lower.includes('doctor')) {
        actions = [
          {
            label: 'Hospital Details & Directions',
            action: () => onOpenCategory('hospitals'),
            icon: Stethoscope,
          },
          {
            label: `Book Ride to Hospital in ${currentCity}`,
            action: () => onRequestRide(`Nearest Hospital, ${currentCity}`),
            icon: Car,
          },
        ];
      } else if (lower.includes('near') || lower.includes('around') || lower.includes('pharmacy')) {
        actions = [
          {
            label: 'View Hospitals & Clinics',
            action: () => onOpenCategory('hospitals'),
            icon: Stethoscope,
          },
          {
            label: 'Find 24/7 Pharmacy',
            action: () => onOpenCategory('pharmacies'),
            icon: Pill,
          },
        ];
      } else if (lower.includes('hotel') || lower.includes('stay')) {
        actions = [
          {
            label: `Request Ride to Hotel in ${currentCity}`,
            action: () => onRequestRide(`Hotel in ${currentCity}`),
            icon: Car,
          },
        ];
      } else {
        actions = [
          {
            label: `Navigate to ${nextStop}`,
            action: () => onRequestRide(nextStop),
            icon: Navigation,
          },
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReplyText,
          actions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Adhira is having trouble connecting right now. Please try again in a moment.',
          isError: true,
          retryText: text,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Floating Travel Companion Trigger */}
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="fixed bottom-7 right-7 z-50 flex items-center gap-2.5 rounded-full pl-4 pr-5 py-3.5 bg-[#000000] text-white shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ai-pulse-button cursor-pointer"
          aria-label="Open Live Travel Companion"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span className="font-medium text-xs sm:text-sm font-sans tracking-wide">
            ✦ Travel Companion
          </span>
        </button>
      )}

      {/* Floating Conversational Modal */}
      {isOpen && (
        <div className="fixed bottom-7 right-4 sm:right-7 z-50 w-[calc(100vw-32px)] sm:w-[440px] max-h-[620px] h-[85vh] bg-white border border-[#E7E5E2] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-fade-rise">
          {/* Header */}
          <div className="p-5 border-b border-[#E7E5E2] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center text-xs">
                ✦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-instrument text-2xl text-[#000000] leading-none">
                    Adhira Live
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-[#6F6F6F] font-inter mt-0.5">
                  Real-time in-destination travel assistant
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6F6F6F] hover:text-[#000000] hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Chips */}
          <div className="px-4 py-2.5 bg-white border-b border-neutral-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action)}
                className="text-[11px] text-[#6F6F6F] hover:text-[#000000] bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 font-inter text-xs sm:text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#000000] text-white rounded-br-none'
                      : m.isError
                      ? 'bg-red-50/90 border border-red-200 text-red-950 rounded-bl-none'
                      : 'bg-[#FAF8F5] border border-[#E7E5E2] text-[#000000] rounded-bl-none whitespace-pre-line'
                  }`}
                >
                  {m.text}
                </div>

                {/* Retry Button if error */}
                {m.isError && m.retryText && (
                  <button
                    type="button"
                    onClick={() => handleSend(m.retryText)}
                    disabled={isLoading}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-300 hover:border-black text-[11px] font-mono text-neutral-800 hover:text-black transition-colors cursor-pointer bg-white"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}

                {/* Companion Action Chips */}
                {m.actions && m.actions.length > 0 && !m.isError && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {m.actions.map((act, actIdx) => {
                      const Icon = act.icon;
                      return (
                        <button
                          key={actIdx}
                          type="button"
                          onClick={act.action}
                          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 bg-white border border-[#E7E5E2] hover:border-black text-[11px] font-medium text-[#000000] shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                          {Icon && <Icon className="w-3 h-3 text-neutral-600" />}
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#6F6F6F] p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Travel Companion is checking live data...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#FAF8F5] border-t border-[#E7E5E2] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or state an urgent need..."
              disabled={isLoading}
              className="flex-1 bg-white border border-[#E7E5E2] rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#000000] placeholder:text-neutral-400 focus:outline-none focus:border-black disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-9 h-9 rounded-full bg-[#000000] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0 disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>
      )}
    </>,
    document.body
  );
};
